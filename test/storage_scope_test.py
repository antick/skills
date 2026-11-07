"""System defaults, local mount coverage, and strictly scoped folder audits."""
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

from storage_audit_test import AuditFixture, SCRIPT

sys.path.insert(0, str(SCRIPT.parent))


class ScopeTests(AuditFixture):
    def test_no_path_defaults_to_system_and_walks_the_selected_system_root(self):
        import audit
        (self.home / "Applications").mkdir()
        (self.home / "Applications/app").write_text("installed")
        with patch("scope.SYSTEM_ROOT", self.home.resolve()), \
                patch("scope.discover_local_filesystems", return_value={
                    "status": "complete", "mounts": [], "excluded": [], "errors": []}), \
                patch("audit.processes", return_value={"status": "complete", "items": {}}):
            args = audit.parser().parse_args(["run", "--state-dir", str(self.state)])
            result = audit.run(args)
        snapshot = self.snapshot(result)
        self.assertEqual(snapshot["scope"]["mode"], "system")
        self.assertEqual(snapshot["scope"]["root"], str(self.home.resolve()))
        self.assertIn("Applications/app", [r["path"] for r in snapshot["entries"]])

    def test_named_folder_excludes_siblings_and_global_collectors(self):
        folder = self.home / "chosen"
        folder.mkdir()
        (folder / "inside").write_text("inside")
        (self.home / "outside").write_text("PRIVATE_OUTSIDE_CONTENT")
        self.home = folder
        first = self.run_audit()
        (self.home / "new").write_text("new")
        second = self.run_audit()
        saved = self.snapshot(second)
        self.assertEqual(saved["scope"]["mode"], "folder")
        self.assertNotIn("outside", [r["path"] for r in saved["entries"]])
        self.assertEqual(saved["collectors"]["processes"]["status"], "not_requested")
        self.assertEqual(saved["collectors"]["docker"]["status"], "not_requested")
        self.assertEqual(second["comparison"]["previous_run_id"], self.snapshot(first)["run_id"])

    def test_named_folder_rejects_global_docker_before_any_query_or_history_write(self):
        self.run_audit("--docker", success=False)
        self.assertFalse(self.state.exists())

    def test_folder_mode_never_calls_system_discovery_or_process_commands(self):
        import audit
        with patch("scope.discover_local_filesystems", side_effect=AssertionError("global discovery")), \
                patch("audit.processes", side_effect=AssertionError("global process query")), \
                patch("audit.docker_metadata", side_effect=AssertionError("global Docker query")):
            args = audit.parser().parse_args(["run", "--path", str(self.home), "--state-dir", str(self.state)])
            audit.run(args)

    def test_folder_and_system_modes_use_separate_history_even_at_same_root(self):
        import audit
        first = self.run_audit()
        with patch("scope.SYSTEM_ROOT", self.home.resolve()), \
                patch("scope.discover_local_filesystems", return_value={
                    "status": "complete", "mounts": [], "excluded": [], "errors": []}), \
                patch("audit.processes", return_value={"status": "complete", "items": {}}):
            args = audit.parser().parse_args(["run", "--state-dir", str(self.state)])
            second = audit.run(args)
        self.assertEqual(second["comparison"]["status"], "first_run")
        self.assertNotEqual(Path(first["snapshot_path"]).parent, Path(second["snapshot_path"]).parent)


class FilesystemDiscoveryTests(unittest.TestCase):
    def test_container_root_overlay_is_included_but_nested_container_views_are_excluded(self):
        from scope import parse_linux_mounts
        included, excluded = parse_linux_mounts(
            "1 0 0:1 / / rw - overlay overlay rw\n"
            "2 1 0:2 / /var/lib/docker/merged rw - overlay overlay rw\n")
        self.assertEqual([r["path"] for r in included], ["/"])
        self.assertEqual([r["path"] for r in excluded], ["/var/lib/docker/merged"])

    def test_mounted_disk_images_are_excluded_to_avoid_counting_backing_files_twice(self):
        from scope import exclude_disk_images
        mounted = [{"path": "/", "filesystem": "apfs"},
                   {"path": "/Library/Developer/runtime", "filesystem": "apfs"}]
        images = {"images": [{"image-path": "/host/runtime.dmg", "system-entities": [
            {"mount-point": "/Library/Developer/runtime"}]}]}
        included, excluded = exclude_disk_images(mounted, [], images)
        self.assertEqual([r["path"] for r in included], ["/"])
        self.assertEqual([r["path"] for r in excluded], ["/Library/Developer/runtime"])

    def test_linux_mounts_include_local_storage_and_exclude_network_and_virtual_mounts(self):
        from scope import parse_linux_mounts
        text = (
            "1 0 8:1 / / rw - ext4 /dev/sda1 rw\n"
            "2 1 8:2 / /data\\040disk rw - xfs /dev/sdb1 rw\n"
            "3 1 0:1 / /proc rw - proc proc rw\n"
            "4 1 0:2 / /network rw - nfs server:/data rw\n"
        )
        included, excluded = parse_linux_mounts(text)
        self.assertEqual([r["path"] for r in included], ["/", "/data disk"])
        self.assertEqual([r["path"] for r in excluded], ["/proc", "/network"])

    def test_macos_data_volume_is_included_alongside_system_volume(self):
        from scope import parse_macos_mounts
        text = (
            "/dev/disk3s1s1 on / (apfs, sealed, local, read-only)\n"
            "/dev/disk3s5 on /System/Volumes/Data (apfs, local, journaled)\n"
            "devfs on /dev (devfs, local)\n"
            "//server/share on /Volumes/Share (smbfs, nodev)\n"
        )
        included, excluded = parse_macos_mounts(text)
        self.assertEqual([r["path"] for r in included], ["/", "/System/Volumes/Data"])
        self.assertEqual([r["path"] for r in excluded], ["/dev", "/Volumes/Share"])

    def test_unlisted_or_disallowed_mounts_remain_coverage_gaps(self):
        from scan import Scanner
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "network").mkdir()
            (root / "network/hidden").write_text("not scanned")
            scanner = Scanner(root, 3, [], 30, blocked_mounts={"network": "network filesystem"})
            result = scanner.run()
            self.assertNotIn("network/hidden", [r["path"] for r in result["entries"]])
            self.assertEqual(result["coverage"]["measurement"], "partial")

    def test_mounted_device_is_followed_in_system_mode_but_excluded_in_folder_mode(self):
        from scan import Scanner
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "data").mkdir()
            (root / "data/file").write_text("local data")
            device = root.stat().st_dev
            folder = Scanner(root, 3, [], 30)
            folder.allowed_devices = {device + 1}
            self.assertNotIn("data/file", [r["path"] for r in folder.run()["entries"]])
            system = Scanner(root, 3, [], 30, allowed_devices={device}, system_mode=True)
            self.assertIn("data/file", [r["path"] for r in system.run()["entries"]])

    def test_repeated_directory_identity_is_counted_once(self):
        from scan import Scanner
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "data").mkdir()
            (root / "data/file").write_bytes(b"x" * 4096)
            scanner = Scanner(root, 3, [], 30, system_mode=True)
            data = (root / "data").stat()
            scanner.seen_directories[(data.st_dev, data.st_ino)] = "already-scanned-alias"
            result = scanner.run()
            rows = {r["path"]: r for r in result["entries"]}
            self.assertEqual(rows["data"]["alias_of"], "already-scanned-alias")
            self.assertNotIn("data/file", rows)
            self.assertEqual(rows["data"]["allocated_bytes"], 0)


class FilesystemComparisonTests(unittest.TestCase):
    def test_mount_changes_below_saved_detail_depth_make_aggregate_delta_unknown(self):
        from compare import compare
        from storage_compare_test import row, snapshot
        before = snapshot([{**row(".", size=4096), "filesystem_device": 1}])
        after = snapshot([{**row(".", size=8192), "filesystem_device": 1}])
        before["filesystems"] = {"mounts": [{"path": "/fixture", "device": 1}]}
        after["filesystems"] = {"mounts": [{"path": "/fixture", "device": 1},
                                            {"path": "/fixture/deep/nested/volume", "device": 2}]}
        change = compare(before, after)["changes"][0]
        self.assertEqual(change["path"], ".")
        self.assertIsNone(change["delta_bytes"])

    def test_unmounted_volume_contents_are_not_reported_as_deleted_files(self):
        from compare import compare
        from storage_compare_test import row, snapshot
        before = snapshot([{**row("."), "filesystem_device": 1},
                           {**row("data"), "filesystem_device": 2},
                           {**row("data/retained", kind="file"), "filesystem_device": 2}])
        after = snapshot([{**row("."), "filesystem_device": 1},
                          {**row("data"), "filesystem_device": 1}])
        changes = {r["path"]: r for r in compare(before, after)["changes"]}
        self.assertEqual(changes["data"]["change"], "filesystem_changed")
        self.assertIsNone(changes["data"]["delta_bytes"])
        self.assertEqual(changes["data/retained"]["change"], "not_observed")

    def test_newly_mounted_files_are_newly_observed_and_do_not_imply_root_growth(self):
        from compare import compare
        from storage_compare_test import row, snapshot
        before = snapshot([{**row(".", size=4096), "filesystem_device": 1},
                           {**row("data"), "filesystem_device": 1}])
        after = snapshot([{**row(".", size=8192), "filesystem_device": 1},
                          {**row("data"), "filesystem_device": 2},
                          {**row("data/retained", kind="file"), "filesystem_device": 2}])
        changes = {r["path"]: r for r in compare(before, after)["changes"]}
        self.assertEqual(changes["data/retained"]["change"], "newly_observed")
        self.assertIsNone(changes["."]["delta_bytes"])


if __name__ == "__main__":
    unittest.main()
