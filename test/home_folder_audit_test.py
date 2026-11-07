"""Exercise the shipped CLI on small local homes, never the real home folder."""
import json
import os
from pathlib import Path
import stat
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "skills/home-folder-audit/scripts/audit.py"


class AuditFixture(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.home = self.base / "home"
        self.home.mkdir()
        self.state = self.base / "history"

    def command(self, *args, success=True):
        result = subprocess.run(
            ["python3", "-B", str(SCRIPT), *map(str, args)],
            capture_output=True, text=True, timeout=20,
        )
        if success:
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads(result.stdout)
        self.assertNotEqual(result.returncode, 0)
        return result

    def run_audit(self, *args, success=True):
        return self.command("run", "--home", self.home, "--state-dir", self.state,
                            *args, success=success)

    def snapshot(self, result):
        return json.loads(Path(result["snapshot_path"]).read_text())


class HomeAuditTests(AuditFixture):
    def test_first_run_is_baseline_and_next_run_compares_without_overwriting_it(self):
        (self.home / ".cache").mkdir()
        (self.home / ".cache/a").write_bytes(b"a" * 4096)
        first = self.run_audit()
        first_bytes = Path(first["snapshot_path"]).read_bytes()
        self.assertEqual(first["comparison"]["status"], "first_run")
        (self.home / ".cache/a").write_bytes(b"a" * 16384)
        (self.home / "new.txt").write_text("new")
        second = self.run_audit()
        self.assertEqual(second["comparison"]["previous_run_id"], self.snapshot(first)["run_id"])
        self.assertEqual(second["comparison"]["status"], "compared")
        changes = {r["path"]: r for r in second["comparison"]["changes"]}
        self.assertEqual(changes["new.txt"]["change"], "added")
        self.assertGreater(changes[".cache/a"]["delta_bytes"], 0)
        self.assertEqual(Path(first["snapshot_path"]).read_bytes(), first_bytes)
        self.assertTrue(Path(second["comparison_path"]).is_file())

    def test_removed_paths_and_stable_item_ids(self):
        (self.home / "keep").write_text("keep")
        (self.home / "remove").mkdir()
        (self.home / "remove/a").write_text("a")
        first = self.run_audit()
        before = {r["path"]: r for r in self.snapshot(first)["entries"]}
        (self.home / "remove/a").unlink()
        (self.home / "remove").rmdir()
        second = self.run_audit()
        after = {r["path"]: r for r in self.snapshot(second)["entries"]}
        self.assertEqual(before["keep"]["id"], after["keep"]["id"])
        changes = {r["path"]: r["change"] for r in second["comparison"]["changes"]}
        self.assertEqual(changes["remove"], "removed")
        self.assertEqual(changes["remove/a"], "removed")

    def test_symlinks_hardlinks_and_odd_names_never_escape_the_home(self):
        outside = self.base / "outside"
        outside.mkdir()
        (outside / "private-name").write_text("SECRET_CONTENT_NOT_METADATA")
        (self.home / "outside-link").symlink_to(outside, target_is_directory=True)
        (self.home / "broken").symlink_to(self.base / "missing")
        source = self.home / "one\tline\nfile"
        source.write_bytes(b"x" * 8192)
        os.link(source, self.home / "hardlink")
        result = self.run_audit()
        snapshot = self.snapshot(result)
        entries = {r["path"]: r for r in snapshot["entries"]}
        self.assertEqual(entries["outside-link"]["kind"], "symlink")
        self.assertIn("one\tline\nfile", entries)
        self.assertNotIn("outside-link/private-name", entries)
        self.assertNotIn("SECRET_CONTENT_NOT_METADATA", json.dumps(snapshot))
        allocated = entries["hardlink"]["allocated_bytes"] + entries["one\tline\nfile"]["allocated_bytes"]
        self.assertEqual(allocated, source.stat().st_blocks * 512)

    def test_history_inside_home_is_excluded_and_private(self):
        self.state = self.home / ".audit-state"
        (self.home / "source").write_text("source")
        first = self.run_audit()
        second = self.run_audit()
        for result in [first, second]:
            snapshot = self.snapshot(result)
            self.assertFalse(any(r["path"].startswith(".audit-state/") for r in snapshot["entries"]))
            self.assertEqual(stat.S_IMODE(Path(result["snapshot_path"]).stat().st_mode), 0o600)
            self.assertEqual(stat.S_IMODE(Path(result["snapshot_path"]).parent.stat().st_mode), 0o700)
        self.assertFalse(any(r["change"] in ["grew", "shrunk"] for r in second["comparison"]["changes"]))

    def test_corrupt_baseline_is_not_silently_replaced(self):
        first = self.run_audit()
        latest = Path(first["snapshot_path"]).parent / "latest.json"
        latest.write_text("broken json")
        files = sorted(p.name for p in latest.parent.iterdir())
        result = self.run_audit(success=False)
        self.assertIn("baseline", result.stderr.lower())
        self.assertEqual(latest.read_text(), "broken json")
        self.assertEqual(sorted(p.name for p in latest.parent.iterdir()), files)

    def test_different_scan_profiles_have_separate_baselines(self):
        self.run_audit("--depth", 1)
        result = self.run_audit("--depth", 2)
        self.assertEqual(result["comparison"]["status"], "first_run")
        self.assertIn("scope", result["comparison"]["reason"])

    def test_compare_refuses_another_root(self):
        first = self.run_audit()
        self.home = self.base / "other-home"
        self.home.mkdir()
        second = self.run_audit()
        result = self.command("compare", first["snapshot_path"], second["snapshot_path"], success=False)
        self.assertIn("scope", result.stderr.lower())

    def test_invalid_root_does_not_create_history(self):
        self.home = self.base / "missing"
        self.run_audit(success=False)
        self.assertFalse(self.state.exists())


if __name__ == "__main__":
    unittest.main()
