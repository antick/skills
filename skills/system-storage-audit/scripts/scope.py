"""Select a system or folder scope and discover local filesystem boundaries."""
import os
from pathlib import Path
import platform
import plistlib
import re
import shutil
import subprocess

from config import LOCAL_FILESYSTEMS, ROOT_ONLY_FILESYSTEMS, SYSTEM_ROOT

MOUNT_TIMEOUT = 15
LINUX_MOUNT_TABLE = Path("/proc/self/mountinfo")


def parse_linux_mounts(text):
    included, excluded = [], []
    for line in text.splitlines():
        left, separator, right = line.partition(" - ")
        fields, tail = left.split(), right.split()
        if not separator or len(fields) < 5 or not tail:
            raise ValueError("Unrecognized Linux mount-table entry")
        path = re.sub(r"\\([0-7]{3})", lambda match: chr(int(match[1], 8)), fields[4])
        filesystem_root = re.sub(r"\\([0-7]{3})", lambda match: chr(int(match[1], 8)), fields[3])
        row = {"path": path, "filesystem": tail[0], "filesystem_root": filesystem_root}
        local = tail[0] in LOCAL_FILESYSTEMS or path == "/" and tail[0] in ROOT_ONLY_FILESYSTEMS
        (included if local else excluded).append(row)
    return included, excluded


def parse_macos_mounts(text):
    included, excluded = [], []
    for line in text.splitlines():
        location, separator, flags = line.rpartition(" (")
        _, marker, path = location.partition(" on ")
        if not separator or not marker or not flags.endswith(")"):
            raise ValueError("Unrecognized macOS mount-table entry")
        options = [part.strip() for part in flags[:-1].split(",")]
        row = {"path": path, "filesystem": options[0]}
        (included if options[0] in LOCAL_FILESYSTEMS and "local" in options else excluded).append(row)
    return included, excluded


def exclude_disk_images(included, excluded, images):
    paths = {entry["mount-point"] for image in images.get("images", [])
             for entry in image.get("system-entities", []) if "mount-point" in entry}
    retained, skipped = [], list(excluded)
    for row in included:
        if row["path"] in paths and row["path"] != "/":
            skipped.append({**row, "reason": "Mounted disk image; backing file belongs to host storage"})
        else:
            retained.append(row)
    return retained, skipped


def read_mount_table():
    if platform.system() == "Linux":
        included, excluded = parse_linux_mounts(LINUX_MOUNT_TABLE.read_text())
    elif platform.system() == "Darwin":
        result = subprocess.run(["/sbin/mount"], capture_output=True, text=True,
                                check=True, timeout=MOUNT_TIMEOUT)
        included, excluded = parse_macos_mounts(result.stdout)
    else:
        raise ValueError("Mount discovery supports macOS and Linux")
    if not included and not excluded:
        raise ValueError("Mount discovery returned no filesystems")
    return included, excluded


def folder_mount_boundaries(root, requested_path):
    try:
        included, excluded = read_mount_table()
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        raise ValueError(f"Cannot determine folder mount boundaries; audit not started: {error}") from error
    nested = []
    roots = (root, requested_path.expanduser().absolute())
    for row in included + excluded:
        for spelling in roots:
            try:
                relative = Path(row["path"]).relative_to(spelling)
            except ValueError:
                continue
            if relative.parts:
                nested.append({**row, "path": str(root / relative),
                               "reason": "Nested mount is outside the selected folder scope"})
            break
    return {"status": "complete", "boundary_only": True, "mounts": [], "excluded": nested, "errors": []}


def discover_local_filesystems():
    errors = []
    try:
        included, excluded = read_mount_table()
        if platform.system() == "Darwin":
            try:
                images = subprocess.run(["/usr/bin/hdiutil", "info", "-plist"], capture_output=True,
                                        check=True, timeout=MOUNT_TIMEOUT)
                included, excluded = exclude_disk_images(included, excluded, plistlib.loads(images.stdout))
            except (OSError, ValueError, subprocess.SubprocessError) as error:
                errors.append({"path": str(SYSTEM_ROOT), "reason": "Disk-image discovery unavailable: " + str(error)})
        disks = {}
        for row in included:
            try:
                row["device"] = os.stat(row["path"]).st_dev
                if row["device"] not in disks:
                    usage = shutil.disk_usage(row["path"])
                    disks[row["device"]] = {"total_bytes": usage.total, "used_bytes": usage.used,
                                             "free_bytes": usage.free}
                row["disk"] = disks[row["device"]]
            except OSError as error:
                errors.append({"path": row["path"], "reason": str(error)})
        return {"status": "partial" if errors else "complete", "mounts": included,
                "excluded": excluded, "errors": errors}
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        return {"status": "unavailable", "mounts": [], "excluded": [],
                "errors": [{"path": str(SYSTEM_ROOT), "reason": str(error)}]}


def select_scope(requested_path):
    mode = "folder" if requested_path is not None else "system"
    root = (requested_path or SYSTEM_ROOT).expanduser().resolve(strict=True)
    if not root.is_dir():
        raise ValueError("Audit root must be a directory")
    filesystems = (discover_local_filesystems() if mode == "system" else
                   folder_mount_boundaries(root, requested_path))
    devices = {root.stat().st_dev}
    devices.update(row["device"] for row in filesystems["mounts"] if "device" in row)
    blocked = {}
    for row in filesystems["excluded"]:
        try:
            relative = Path(row["path"]).relative_to(root).as_posix()
            blocked[relative] = row.get("reason", "Excluded filesystem: " + row["filesystem"])
        except ValueError:
            pass
    if "." in blocked:
        raise ValueError("System root is a network or unsupported filesystem")
    return mode, root, devices, blocked, filesystems
