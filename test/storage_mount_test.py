"""Mount regressions using real directory walks and simulated OS mount metadata."""
from contextlib import contextmanager
import os
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

from storage_audit_test import AuditFixture, SCRIPT
from storage_compare_test import row, snapshot

sys.path.insert(0, str(SCRIPT.parent))


@contextmanager
def mount_views(views):
    """Expose source directory descriptors at mount paths, optionally on another device."""
    original_stat, original_open = os.stat, os.open
    original_fstat, original_close = os.fstat, os.close
    descriptors = {}
    parents = {str(path): original_stat(path.parent) for path in views}

    def mounted_source(path, dir_fd):
        for mount, (source, device) in views.items():
            if dir_fd is None and str(path) == str(mount):
                return source, device
            if dir_fd is not None and str(path) == mount.name:
                parent = original_fstat(dir_fd)
                expected = parents[str(mount)]
                if (parent.st_dev, parent.st_ino) == (expected.st_dev, expected.st_ino):
                    return source, device
        return None

    def on_device(metadata, device):
        if device is None:
            return metadata
        return SimpleNamespace(**{key: device if key == "st_dev" else getattr(metadata, key)
                                  for key in ("st_dev", "st_ino", "st_mode", "st_size", "st_blocks",
                                              "st_nlink", "st_mtime_ns")})

    def stat(path, *args, **kwargs):
        source = mounted_source(path, kwargs.get("dir_fd"))
        if source:
            return on_device(original_stat(source[0]), source[1])
        metadata = original_stat(path, *args, **kwargs)
        return on_device(metadata, descriptors.get(kwargs.get("dir_fd")))

    def open_directory(path, *args, **kwargs):
        source = mounted_source(path, kwargs.get("dir_fd"))
        descriptor = original_open(source[0] if source else path, *args, **kwargs)
        if source or kwargs.get("dir_fd") in descriptors:
            descriptors[descriptor] = source[1] if source else descriptors[kwargs["dir_fd"]]
        return descriptor

    def fstat(descriptor):
        return on_device(original_fstat(descriptor), descriptors.get(descriptor))

    def close(descriptor):
        descriptors.pop(descriptor, None)
        return original_close(descriptor)

    with patch("os.stat", stat), patch("os.open", open_directory), \
            patch("os.fstat", fstat), patch("os.close", close):
        yield


class MountWiringTests(AuditFixture):
    def mount_table(self, device):
        root = self.home.resolve()
        return (f"1 0 8:1 / {root} rw - ext4 /dev/fixture rw\n"
                f"2 1 8:2 /source {root / 'mounted'} rw - ext4 /dev/device-{device} rw\n")

    def exercise(self, system, device):
        import audit
        source = self.base / "outside-source"
        source.mkdir()
        (source / "payload").write_bytes(b"x" * 8192)
        mounted = self.home / "mounted"
        mounted.mkdir()
        mounted = mounted.resolve()
        (self.home / "ordinary").write_text("ordinary")
        table = SimpleNamespace(read_text=lambda: self.mount_table(device))
        args = ["run", "--state-dir", str(self.state)]
        if not system:
            args.extend(["--path", str(self.home)])
        with patch("scope.platform.system", return_value="Linux"), \
                patch("scope.SYSTEM_ROOT", self.home.resolve()), \
                patch("scope.LINUX_MOUNT_TABLE", table), \
                patch("audit.processes", return_value={"status": "complete", "items": {}}), \
                mount_views({mounted: (source, device)}):
            result = audit.run(audit.parser().parse_args(args))
        return self.snapshot(result)

    def test_system_discovery_passes_a_second_device_to_the_real_scanner(self):
        device = self.home.stat().st_dev + 1000
        saved = self.exercise(True, device)
        entries = {entry["path"]: entry for entry in saved["entries"]}
        self.assertEqual(entries["mounted/payload"]["filesystem_device"], device)
        self.assertGreater(entries["mounted"]["allocated_bytes"], 0)
        self.assertEqual(entries["mounted"]["measurement"], "complete")

    def test_folder_audit_blocks_a_nested_mount_on_a_different_device(self):
        saved = self.exercise(False, self.home.stat().st_dev + 1000)
        self.assertNotIn("mounted/payload", [entry["path"] for entry in saved["entries"]])

    def test_folder_audit_blocks_a_same_device_bind_mount_and_keeps_ordinary_files(self):
        saved = self.exercise(False, self.home.stat().st_dev)
        entries = {entry["path"]: entry for entry in saved["entries"]}
        self.assertIn("ordinary", entries)
        self.assertNotIn("mounted/payload", entries)
        self.assertEqual(entries["mounted"]["measurement"], "excluded")

    def test_folder_audit_filters_mount_metadata_before_querying_storage(self):
        import audit
        table = SimpleNamespace(read_text=lambda: (
            f"1 0 8:1 / {self.home.resolve()} rw - ext4 /dev/fixture rw\n"
            "2 1 8:2 / /unrelated-storage rw - ext4 /dev/other rw\n"))
        calls = []

        def disk_usage(path):
            self.assertEqual(Path(path), self.home.resolve())
            calls.append(path)
            return SimpleNamespace(total=100, used=50, free=50)

        with patch("scope.platform.system", return_value="Linux"), \
                patch("scope.LINUX_MOUNT_TABLE", table), \
                patch("scope.shutil.disk_usage", side_effect=disk_usage):
            saved = self.snapshot(audit.run(audit.parser().parse_args(
                ["run", "--path", str(self.home), "--state-dir", str(self.state)])))
        self.assertNotIn("/unrelated-storage", str(saved["filesystems"]))
        self.assertEqual(len(calls), 1)

    def test_unknown_folder_mount_boundaries_fail_before_history_is_written(self):
        import audit
        with patch("scope.platform.system", return_value="Linux"), \
                patch("scope.LINUX_MOUNT_TABLE", SimpleNamespace(read_text=lambda: "bad mount metadata")):
            with self.assertRaises(ValueError):
                audit.run(audit.parser().parse_args(
                    ["run", "--path", str(self.home), "--state-dir", str(self.state)]))
        self.assertFalse(self.state.exists())


class AliasExclusionTests(unittest.TestCase):
    def test_mount_of_an_excluded_descendant_is_blocked_before_it_is_scanned(self):
        from scan import Scanner
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            secret, alias = root / "z-secret", root / "a-alias"
            (secret / "child").mkdir(parents=True)
            alias.mkdir()
            (secret / "child/private-name").write_text("fixture")
            device = root.stat().st_dev
            mounts = [{"path": str(root), "device": device, "filesystem_root": "/"},
                      {"path": str(alias), "device": device, "filesystem_root": "/z-secret/child"}]
            with mount_views({alias: (secret / "child", None)}):
                saved = Scanner(root, 3, ["z-secret"], 30, mounts=mounts).run()
            entries = {entry["path"]: entry for entry in saved["entries"]}
            self.assertNotIn("a-alias/private-name", entries)
            self.assertEqual(entries["a-alias"]["measurement"], "excluded")

    def test_excluded_directory_is_blocked_through_aliases_in_either_walk_order(self):
        from scan import Scanner
        for excluded_name, alias_name in [("z-excluded", "a-alias"), ("a-excluded", "z-alias")]:
            with self.subTest(excluded=excluded_name), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                excluded, alias = root / excluded_name, root / alias_name
                excluded.mkdir()
                alias.mkdir()
                (excluded / "private-name").write_bytes(b"x" * 8192)
                with mount_views({alias: (excluded, None)}):
                    saved = Scanner(root, 3, [excluded_name], 30, system_mode=True).run()
                entries = {entry["path"]: entry for entry in saved["entries"]}
                self.assertNotIn(alias_name + "/private-name", entries)
                self.assertEqual(entries[alias_name]["measurement"], "excluded")
                self.assertEqual(entries["."]["allocated_bytes"], root.stat().st_blocks * 512)


class MountComparisonTests(unittest.TestCase):
    def views(self, names):
        entries = [{**row("."), "filesystem_device": 1}]
        for index, name in enumerate(names):
            entries.append({**row(name, measurement="complete" if index == 0 else "excluded",
                                 listing=index == 0), "filesystem_device": 2})
            if index == 0:
                entries.append({**row(name + "/retained", kind="file"), "filesystem_device": 2})
        saved = snapshot(entries)
        saved["filesystems"] = {"mounts": [{"path": "/fixture", "device": 1}] +
                                [{"path": "/fixture/" + name, "device": 2} for name in names]}
        return saved

    def test_unmounted_alias_is_unobserved_when_the_device_remains_mounted_elsewhere(self):
        from compare import compare
        before, after = self.views(["diskA", "diskB"]), self.views(["diskB"])
        before["entries"].append({**row("actually-deleted", kind="file"), "filesystem_device": 1})
        changes = {entry["path"]: entry for entry in compare(before, after)["changes"]}
        self.assertEqual(changes["diskA"]["change"], "not_observed")
        self.assertEqual(changes["diskA/retained"]["change"], "not_observed")
        self.assertEqual(changes["actually-deleted"]["change"], "removed")

    def test_added_mount_view_is_not_mistaken_for_new_files_on_an_existing_device(self):
        from compare import compare
        before, after = self.views(["diskB"]), self.views(["diskA", "diskB"])
        changes = {entry["path"]: entry for entry in compare(before, after)["changes"]}
        self.assertEqual(changes["diskA/retained"]["change"], "newly_observed")

    def test_rebinding_a_mount_to_another_directory_on_the_same_device_is_unknown(self):
        from compare import compare
        before, after = self.views(["diskA"]), self.views(["diskA"])
        before["filesystems"]["mounts"][1]["filesystem_root"] = "/old-source"
        after["filesystems"]["mounts"][1]["filesystem_root"] = "/new-source"
        before["entries"][-1]["path"] = "diskA/old-file"
        after["entries"][-1]["path"] = "diskA/new-file"
        changes = {entry["path"]: entry for entry in compare(before, after)["changes"]}
        self.assertEqual(changes["diskA/old-file"]["change"], "not_observed")
        self.assertEqual(changes["diskA/new-file"]["change"], "newly_observed")


if __name__ == "__main__":
    unittest.main()
