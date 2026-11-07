"""Single-pass POSIX metadata scan; never opens file contents or follows links."""
import hashlib
import os
from pathlib import Path, PurePosixPath
import stat
import sys
import time

from config import BLOCK_BYTES, MAX_ERRORS, PROGRESS_SECONDS, SYSTEM_SCAN_ORDER, hint


DIRECTORY_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW


class Scanner:
    def __init__(self, root, depth, exclusions, timeout, allowed_devices=None,
                 blocked_mounts=None, system_mode=False, mounts=None):
        self.root = Path(root)
        self.depth = depth
        self.exclusions = set(exclusions)
        self.deadline = time.monotonic() + timeout
        self.last_progress = time.monotonic()
        self.entries = []
        self.errors = []
        self.error_count = 0
        self.seen_links = set()
        self.files_seen = 0
        self.directories_seen = 0
        self.device = self.root.stat().st_dev
        self.allowed_devices = set(allowed_devices or {self.device})
        self.blocked_mounts = blocked_mounts or {}
        self.system_mode = system_mode
        self.seen_directories = {}
        self.excluded_identities = {}
        self.mounts = mounts or []
        self.excluded_mounts = {}

    def register_mount_aliases(self, path, metadata):
        views = [view for view in self.mounts
                 if view.get("device") == metadata.st_dev and "filesystem_root" in view]
        parents = [view for view in views if (self.root / path).is_relative_to(Path(view["path"]))]
        if not parents:
            return
        parent = max(parents, key=lambda view: len(Path(view["path"]).parts))
        relative = (self.root / path).relative_to(Path(parent["path"]))
        source = PurePosixPath(parent["filesystem_root"]) / relative.as_posix()
        for view in views:
            if not PurePosixPath(view["filesystem_root"]).is_relative_to(source):
                continue
            try:
                alias = Path(view["path"]).relative_to(self.root)
                if alias.parts:
                    self.excluded_mounts[alias.as_posix()] = path
            except ValueError:
                pass

    def register_exclusions(self, root_fd):
        # Resolve identities before walking so an earlier alias cannot bypass exclusion.
        for path in sorted(self.exclusions):
            fd = os.dup(root_fd)
            try:
                parts = Path(path).parts
                for index, part in enumerate(parts):
                    if "/".join(parts[:index + 1]) in self.blocked_mounts:
                        break
                    metadata = os.stat(part, dir_fd=fd, follow_symlinks=False)
                    if metadata.st_dev not in self.allowed_devices:
                        break
                    if index == len(parts) - 1:
                        self.excluded_identities[(metadata.st_dev, metadata.st_ino)] = path
                        self.register_mount_aliases(path, metadata)
                    else:
                        child_fd = os.open(part, DIRECTORY_FLAGS, dir_fd=fd)
                        os.close(fd)
                        fd = child_fd
            except FileNotFoundError:
                continue
            except OSError as error:
                raise ValueError(f"Cannot establish exclusion boundary for {path!r}: {error}") from error
            finally:
                os.close(fd)

    def error(self, path, reason):
        self.error_count += 1
        if len(self.errors) < MAX_ERRORS:
            self.errors.append({"path": path, "reason": reason})

    def expired(self):
        return time.monotonic() >= self.deadline

    def record(self, path, metadata, kind, level):
        if level > self.depth:
            return {}
        row = {
            "id": "P-" + hashlib.sha256(os.fsencode(path)).hexdigest()[:16],
            "path": path, "kind": kind, "allocated_bytes": 0,
            "measurement": "unknown", "listing_complete": False,
            "filesystem_device": metadata.st_dev,
            "modified_ns": metadata.st_mtime_ns, "mode": stat.S_IMODE(metadata.st_mode),
        }
        if kind != "directory":
            row["logical_bytes"] = metadata.st_size
        if level <= self.depth:
            row["category"], row["explanation"] = hint(path)
            self.entries.append(row)
        return row

    def allocation(self, metadata):
        if metadata.st_nlink > 1 and not stat.S_ISDIR(metadata.st_mode):
            key = (metadata.st_dev, metadata.st_ino)
            if key in self.seen_links:
                return 0
            self.seen_links.add(key)
        return metadata.st_blocks * BLOCK_BYTES

    def visit(self, parent_fd, name, path, level):
        excluded_by = self.excluded_mounts.get(path)
        if path in self.blocked_mounts or excluded_by is not None:
            reason = "Alias of excluded subtree: " + excluded_by if excluded_by is not None else self.blocked_mounts[path]
            if excluded_by is None:
                self.error(path, reason)
            if level <= self.depth:
                self.entries.append({"id": "P-" + hashlib.sha256(os.fsencode(path)).hexdigest()[:16],
                                     "path": path, "kind": "unknown", "measurement": "excluded",
                                     "allocated_bytes": 0 if excluded_by is not None else None,
                                     "listing_complete": False, "exclusion": reason})
            return 0, excluded_by is not None
        try:
            metadata = os.stat(name, dir_fd=parent_fd, follow_symlinks=False)
        except OSError as error:
            self.error(path, error.strerror)
            # A missing stat is an unknown observation, not proof of removal.
            if level <= self.depth:
                self.entries.append({"id": "P-" + hashlib.sha256(os.fsencode(path)).hexdigest()[:16],
                                     "path": path, "kind": "unknown", "measurement": "unknown",
                                     "allocated_bytes": None, "listing_complete": False})
            return 0, False
        kind = ("directory" if stat.S_ISDIR(metadata.st_mode) else
                "symlink" if stat.S_ISLNK(metadata.st_mode) else
                "file" if stat.S_ISREG(metadata.st_mode) else "special")
        row = self.record(path, metadata, kind, level)
        excluded_by = self.excluded_identities.get((metadata.st_dev, metadata.st_ino))
        if path in self.exclusions or excluded_by is not None:
            row["measurement"] = "excluded"
            row["excluded_by"] = excluded_by or path
            return 0, True
        if metadata.st_dev not in self.allowed_devices:
            row["measurement"] = "excluded"
            row["exclusion"] = "filesystem outside the selected scope"
            self.error(path, row["exclusion"])
            return 0, False
        if self.expired():
            self.error(path, "scan timeout; size not measured")
            return 0, False
        total = self.allocation(metadata)
        if kind != "directory":
            self.files_seen += 1
            row.update(allocated_bytes=total, measurement="complete")
            if kind == "symlink" and level <= self.depth:
                try:
                    row["target"] = os.readlink(name, dir_fd=parent_fd)
                except OSError as error:
                    self.error(path, error.strerror)
                    row["measurement"] = "partial"
                    return total, False
            return total, True
        try:
            fd = os.open(name, DIRECTORY_FLAGS, dir_fd=parent_fd)
            try:
                opened = os.fstat(fd)
                if (opened.st_dev, opened.st_ino) != (metadata.st_dev, metadata.st_ino):
                    raise OSError("directory identity changed during scan")
                identity = (opened.st_dev, opened.st_ino)
                if identity in self.seen_directories:
                    row.update(measurement="excluded", alias_of=self.seen_directories[identity])
                    return 0, True
                self.seen_directories[identity] = path
                return self.directory(fd, path, level, row, total)
            finally:
                os.close(fd)
        except OSError as error:
            self.error(path, str(error))
            row.update(allocated_bytes=total, measurement="partial")
            return total, False

    def directory(self, fd, path, level, row, total):
        self.directories_seen += 1
        complete = True
        try:
            with os.scandir(fd) as iterator:
                names = sorted(entry.name for entry in iterator)
            if level == 0 and self.system_mode:
                order = {name: index for index, name in enumerate(SYSTEM_SCAN_ORDER)}
                names.sort(key=lambda name: (order.get(name, len(order)), name))
            row["listing_complete"] = True
        except OSError as error:
            self.error(path, str(error))
            row.update(allocated_bytes=total, measurement="partial")
            return total, False
        for name in names:
            child = name if path == "." else path + "/" + name
            size, measured = self.visit(fd, name, child, level + 1)
            total += size
            complete = complete and measured
            if time.monotonic() - self.last_progress >= PROGRESS_SECONDS:
                print(f"Scanned {self.files_seen} file entries; currently {child!r}",
                      file=sys.stderr, flush=True)
                self.last_progress = time.monotonic()
        row.update(allocated_bytes=total, measurement="complete" if complete else "partial")
        return total, complete

    def run(self):
        fd = os.open(self.root, DIRECTORY_FLAGS)
        try:
            metadata = os.fstat(fd)
            self.register_exclusions(fd)
            self.seen_directories[(metadata.st_dev, metadata.st_ino)] = "."
            row = self.record(".", metadata, "directory", 0)
            self.directory(fd, ".", 0, row, self.allocation(metadata))
            if not row["listing_complete"]:
                raise ValueError("Audit root could not be listed; previous baseline retained")
        finally:
            os.close(fd)
        return {"entries": self.entries, "errors": self.errors,
                "coverage": {"error_count": self.error_count,
                             "errors_omitted": max(0, self.error_count - len(self.errors)),
                             "files_seen": self.files_seen, "directories_seen": self.directories_seen,
                             "root_listing_complete": row["listing_complete"],
                             "measurement": row["measurement"]}}
