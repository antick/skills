"""Compare only matching scopes; missing visibility is never treated as deletion."""
from collections import Counter
from pathlib import PurePosixPath

from collectors import docker_changes
from config import SCHEMA_VERSION


def validate(snapshot):
    if not isinstance(snapshot, dict) or snapshot.get("schema_version") != SCHEMA_VERSION:
        raise ValueError("Unsupported or invalid snapshot schema")
    if not isinstance(snapshot.get("scope"), dict) or not isinstance(snapshot.get("run_id"), str):
        raise ValueError("Invalid snapshot scope or run identity")
    entries = snapshot.get("entries")
    if not isinstance(entries, list):
        raise ValueError("Invalid snapshot entries")
    seen = set()
    for row in entries:
        if not isinstance(row, dict) or not isinstance(row.get("path"), str):
            raise ValueError("Invalid snapshot entry")
        path = row["path"]
        if path in seen or PurePosixPath(path).is_absolute() or ".." in PurePosixPath(path).parts:
            raise ValueError("Duplicate or unsafe snapshot path")
        seen.add(path)
        if row.get("measurement") not in {"complete", "partial", "excluded", "unknown"}:
            raise ValueError("Invalid measurement state")
        value = row.get("allocated_bytes")
        if value is not None and (type(value) is not int or value < 0):
            raise ValueError("Invalid allocated byte count")
    if "." not in seen:
        raise ValueError("Snapshot has no root entry")
    return snapshot


def observed_absence(path, entries, reference, devices):
    device = reference.get(path, {}).get("filesystem_device")
    if device is not None and device not in devices:
        return False
    parent = str(PurePosixPath(path).parent)
    while True:
        if parent in entries:
            row = entries[parent]
            old_device = reference.get(parent, {}).get("filesystem_device")
            if old_device is not None and row.get("filesystem_device") != old_device:
                return False
            return row.get("kind") == "directory" and row.get("listing_complete") is True
        if parent == ".":
            return False
        parent = str(PurePosixPath(parent).parent)


def devices_in(snapshot):
    devices = {row["filesystem_device"] for row in snapshot["entries"]
               if "filesystem_device" in row and row.get("measurement") in {"complete", "partial"}}
    devices.update(row["device"] for row in snapshot.get("filesystems", {}).get("mounts", [])
                   if "device" in row)
    return devices


def mount_boundaries(snapshot):
    root = PurePosixPath(snapshot["scope"]["root"])
    result = {}
    for row in snapshot.get("filesystems", {}).get("mounts", []):
        try:
            relative = PurePosixPath(row["path"]).relative_to(root).as_posix()
            result[relative] = (row.get("device"), row.get("filesystem"))
        except ValueError:
            pass
    return result


def compare(previous, current):
    validate(current)
    if previous is None:
        return {"status": "first_run", "reason": "No previous snapshot for this machine, root, and scan scope",
                "previous_run_id": None, "current_run_id": current["run_id"],
                "change_counts": {}, "changes": []}
    validate(previous)
    if previous["scope"] != current["scope"]:
        raise ValueError("Snapshot scope differs; compare the same machine, root, mode, and scan profile")
    before = {row["path"]: row for row in previous["entries"]}
    after = {row["path"]: row for row in current["entries"]}
    old_devices, new_devices = devices_in(previous), devices_in(current)
    changed_boundaries = set()
    old_mounts, new_mounts = mount_boundaries(previous), mount_boundaries(current)
    changed_boundaries.update(path for path in old_mounts.keys() | new_mounts.keys()
                              if old_mounts.get(path) != new_mounts.get(path))
    for path in before.keys() | after.keys():
        old, new = before.get(path, {}), after.get(path, {})
        if (old.get("filesystem_device") is not None and new.get("filesystem_device") is not None
                and old["filesystem_device"] != new["filesystem_device"]):
            changed_boundaries.add(path)
        elif ((old.get("filesystem_device") is not None and old["filesystem_device"] not in new_devices)
              or (new.get("filesystem_device") is not None and new["filesystem_device"] not in old_devices)):
            changed_boundaries.add(path)
    uncertain_totals = set()
    for path in changed_boundaries:
        parent = str(PurePosixPath(path).parent)
        while True:
            uncertain_totals.add(parent)
            if parent == ".":
                break
            parent = str(PurePosixPath(parent).parent)
    changes = []
    for path in sorted(before.keys() | after.keys()):
        old, new = before.get(path), after.get(path)
        if old is None:
            change = "added" if observed_absence(path, before, after, old_devices) else "newly_observed"
        elif new is None:
            change = "removed" if observed_absence(path, after, before, new_devices) else "not_observed"
        elif old.get("measurement") == "excluded" and new.get("measurement") == "excluded":
            continue
        elif old.get("measurement") != "complete" or new.get("measurement") != "complete":
            change = "measurement_unknown"
        elif path in changed_boundaries:
            change = "filesystem_changed"
        elif path in uncertain_totals and new.get("kind") == "directory":
            change = "measurement_unknown"
        elif old.get("kind") != new.get("kind"):
            change = "type_changed"
        elif old.get("target") != new.get("target"):
            change = "link_changed"
        elif new["allocated_bytes"] != old["allocated_bytes"]:
            change = "grew" if new["allocated_bytes"] > old["allocated_bytes"] else "shrunk"
        elif new.get("kind") != "directory" and any(
            old.get(key) != new.get(key) for key in ["logical_bytes", "modified_ns", "mode"]
        ):
            change = "metadata_changed"
        else:
            continue
        measured = (old and new and old.get("measurement") == new.get("measurement") == "complete"
                    and change not in {"filesystem_changed", "measurement_unknown"})
        changes.append({"id": (new or old)["id"], "path": path, "change": change,
                        "before_bytes": old.get("allocated_bytes") if old else None,
                        "after_bytes": new.get("allocated_bytes") if new else None,
                        "delta_bytes": new["allocated_bytes"] - old["allocated_bytes"] if measured else None})
    return {"status": "compared", "previous_run_id": previous["run_id"],
            "previous_captured_at": previous.get("captured_at"),
            "current_run_id": current["run_id"],
            "change_counts": dict(Counter(row["change"] for row in changes)), "changes": changes}


def compare_snapshots(previous, current):
    result = compare(previous, current)
    before = previous.get("collectors", {}).get("docker") if previous else None
    after = current.get("collectors", {}).get("docker", {"status": "not_requested"})
    result["docker"] = docker_changes(before, after)
    return result
