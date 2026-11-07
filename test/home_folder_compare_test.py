"""Regression cases for visibility gaps, bounded reports, and history locking."""
import fcntl
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

from home_folder_audit_test import AuditFixture, SCRIPT

sys.path.insert(0, str(SCRIPT.parent))


def row(path, size=4096, kind="directory", measurement="complete", listing=True):
    return {"id": "P-" + path, "path": path, "kind": kind, "allocated_bytes": size,
            "measurement": measurement, "listing_complete": listing}


def snapshot(entries, run_id="fixture"):
    return {"schema_version": 1, "scope": {"root": "/fixture"}, "run_id": run_id,
            "entries": entries}


class ComparisonVisibilityTests(unittest.TestCase):
    def compare(self, before, after):
        from compare import compare
        return {r["path"]: r for r in compare(snapshot(before, "old"), snapshot(after, "new"))["changes"]}

    def test_unreadable_parent_does_not_turn_missing_children_into_removals(self):
        old = [row("."), row(".cache"), row(".cache/retained")]
        new = [row(".", measurement="partial"),
               row(".cache", measurement="partial", listing=False)]
        changes = self.compare(old, new)
        self.assertEqual(changes[".cache/retained"]["change"], "not_observed")
        self.assertIsNone(changes[".cache"]["delta_bytes"])
        self.assertIsNone(changes["."]["delta_bytes"])

    def test_recovered_visibility_is_newly_observed_not_new_data(self):
        old = [row(".", measurement="partial"), row(".cache", measurement="partial", listing=False)]
        new = [row("."), row(".cache"), row(".cache/retained")]
        self.assertEqual(self.compare(old, new)[".cache/retained"]["change"], "newly_observed")

    def test_deep_access_error_does_not_hide_a_confirmed_sibling_removal(self):
        old = [row("."), row("gone"), row("blocked")]
        new = [row(".", measurement="partial"), row("blocked", measurement="partial", listing=False)]
        self.assertEqual(self.compare(old, new)["gone"]["change"], "removed")

    def test_symlink_retargeting_and_type_changes_are_distinct(self):
        old = [row("."), {**row("link", kind="symlink"), "target": "one"}, row("folder")]
        new = [row("."), {**row("link", kind="symlink"), "target": "two"}, row("folder", kind="file")]
        changes = self.compare(old, new)
        self.assertEqual(changes["link"]["change"], "link_changed")
        self.assertEqual(changes["folder"]["change"], "type_changed")

    def test_remote_docker_endpoint_is_skipped_before_daemon_commands(self):
        from collectors import docker_metadata
        with patch.dict("os.environ", {"DOCKER_HOST": "tcp://remote.invalid:2375"}), \
                patch("collectors.shutil.which", return_value="docker"), \
                patch("collectors.command", side_effect=AssertionError("daemon command executed")):
            result = docker_metadata(True)
        self.assertEqual(result["status"], "unavailable")

    def test_unavailable_or_different_docker_source_never_claims_resource_deletion(self):
        from collectors import docker_changes
        before = {"status": "complete", "context": "local", "endpoint": "unix:///local"}
        self.assertEqual(docker_changes(before, {"status": "unavailable"})["status"], "unknown")
        after = {"status": "complete", "context": "other", "endpoint": "unix:///other"}
        self.assertEqual(docker_changes(before, after)["status"], "unknown")

    def test_docker_change_lists_respect_the_stdout_limit(self):
        from report import compact
        comparison = {"changes": [], "docker": {"status": "compared", "collections": {
            "containers": {"added": [{"ID": "one"}, {"ID": "two"}], "removed": [], "changed": []}
        }}}
        output = compact(comparison, 1)
        self.assertEqual(len(output["docker"]["collections"]["containers"]["added"]), 1)
        self.assertEqual(output["docker"]["collections"]["containers"]["added_omitted"], 1)
        self.assertEqual(len(comparison["docker"]["collections"]["containers"]["added"]), 2)

    def test_docker_elapsed_uptime_does_not_count_as_a_resource_change(self):
        from collectors import docker_changes
        before = {"status": "complete", "context": "local", "endpoint": "unix:///fixture",
                  "collections": {"containers": [{"ID": "one", "State": "running", "Status": "Up 1 hour", "Health": "healthy"}],
                                  "images": [], "volumes": [], "networks": []}}
        after = {**before, "collections": {**before["collections"], "containers": [
            {"ID": "one", "State": "running", "Status": "Up 2 hours", "Health": "healthy"}]}}
        self.assertEqual(docker_changes(before, after)["collections"]["containers"]["changed"], [])
        after["collections"]["containers"][0]["Health"] = "unhealthy"
        self.assertEqual(len(docker_changes(before, after)["collections"]["containers"]["changed"]), 1)


class HistoryBoundaryTests(AuditFixture):
    def test_cache_hints_respect_the_stdout_limit_and_remain_in_the_snapshot(self):
        for index in range(5):
            (self.home / f".cache/uv/package-{index}").mkdir(parents=True)
        result = self.run_audit("--limit", 1)
        self.assertEqual(len(result["summary"]["cache_review_hints"]), 1)
        self.assertGreater(result["summary"]["cache_review_hints_omitted"], 0)
        hints = [r for r in self.snapshot(result)["entries"] if r.get("category") == "cache-review"]
        self.assertGreater(len(hints), 1)

    def test_explicit_comparison_includes_saved_docker_changes(self):
        first = self.run_audit()
        before = self.snapshot(first)
        after = self.snapshot(first)
        before["collectors"]["docker"] = {
            "status": "complete", "context": "local", "endpoint": "unix:///fixture",
            "collections": {"containers": [], "images": [], "volumes": [], "networks": []},
        }
        after["collectors"]["docker"] = {
            **before["collectors"]["docker"], "collections": {
                "containers": [{"ID": "new-container", "Names": "fixture"}],
                "images": [], "volumes": [], "networks": [],
            },
        }
        old_file, new_file = self.base / "old.json", self.base / "new.json"
        old_file.write_text(json.dumps(before))
        new_file.write_text(json.dumps(after))
        output = self.command("compare", old_file, new_file)
        self.assertEqual(output["docker"]["collections"]["containers"]["added"][0]["ID"], "new-container")

    def test_locked_scope_refuses_overlapping_runs(self):
        first = self.run_audit()
        directory = Path(first["snapshot_path"]).parent
        with (directory / ".lock").open("r+") as lock:
            fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            result = self.run_audit(success=False)
        self.assertIn("Another audit", result.stderr)
        self.assertEqual(len(list(directory.glob("*.snapshot.json"))), 1)

    def test_output_limit_does_not_discard_saved_changes(self):
        self.run_audit()
        for index in range(5):
            (self.home / f"new-{index}").write_text("new")
        second = self.run_audit("--limit", 2)
        saved = json.loads(Path(second["comparison_path"]).read_text())
        self.assertEqual(len(second["comparison"]["changes"]), 2)
        self.assertEqual(sum(r["change"] == "added" for r in saved["changes"]), 5)
        self.assertGreater(second["comparison"]["changes_omitted"], 0)

    def test_timeout_keeps_sizes_unknown_instead_of_reporting_space_recovered(self):
        (self.home / "data").mkdir()
        (self.home / "data/file").write_bytes(b"x" * 8192)
        self.run_audit()
        second = self.run_audit("--timeout", "0.000000001")
        changes = {r["path"]: r for r in second["comparison"]["changes"]}
        self.assertEqual(changes["data"]["change"], "measurement_unknown")
        self.assertIsNone(changes["data"]["delta_bytes"])
        self.assertEqual(changes["data/file"]["change"], "not_observed")

    def test_symlink_history_root_is_refused(self):
        target = self.base / "target"
        target.mkdir()
        self.state.symlink_to(target, target_is_directory=True)
        self.run_audit(success=False)
        self.assertEqual(list(target.iterdir()), [])


if __name__ == "__main__":
    unittest.main()
