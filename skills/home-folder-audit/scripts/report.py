"""Bounded JSON for the agent; the complete inventory stays in private snapshots."""
from collections import Counter


def compact(comparison, limit):
    changes = sorted(comparison["changes"],
                     key=lambda row: (-(abs(row["delta_bytes"] or 0)), row["path"]))
    docker = {**comparison.get("docker", {})}
    if "collections" in docker:
        docker["collections"] = {
            name: {**{key: rows[:limit] for key, rows in group.items()},
                   **{key + "_omitted": max(0, len(rows) - limit) for key, rows in group.items()}}
            for name, group in docker["collections"].items()
        }
    return {**comparison, "changes": changes[:limit], "docker": docker,
            "changes_omitted": max(0, len(changes) - limit),
            "accounting_note": "Parent/child changes overlap; allocated bytes are not guaranteed reclaimable space"}


def summary(snapshot, limit):
    top = [row for row in snapshot["entries"] if row["path"] != "." and "/" not in row["path"]]
    counts = Counter(("hidden_" if row["path"].startswith(".") else "visible_") + row["kind"]
                     for row in top)
    largest = sorted(top, key=lambda row: -(row.get("allocated_bytes") or 0))[:limit]
    hints = [row for row in snapshot["entries"] if row.get("category") == "cache-review"]
    collectors = {key: {k: v for k, v in value.items() if k not in {"collections", "mounts", "items"}}
                  for key, value in snapshot["collectors"].items()}
    for key, value in snapshot["collectors"].items():
        if "items" in value:
            collectors[key]["items"] = dict(list(value["items"].items())[:limit])
            collectors[key]["items_omitted"] = max(0, len(value["items"]) - limit)
    return {"root": snapshot["scope"]["root"], "captured_at": snapshot["captured_at"],
            "finished_at": snapshot["finished_at"], "disk": snapshot["disk"],
            "coverage": snapshot["coverage"], "top_level_counts": dict(counts),
            "root_measurement": next(row for row in snapshot["entries"] if row["path"] == "."),
            "largest_top_level_entries": largest, "top_level_entries_omitted": max(0, len(top) - limit),
            "cache_review_hints": hints[:limit], "cache_review_hints_omitted": max(0, len(hints) - limit),
            "error_examples": snapshot["errors"][:limit],
            "error_examples_omitted": max(0, snapshot["coverage"]["error_count"] - limit),
            "collectors": collectors,
            "cleanup_authorized": False}
