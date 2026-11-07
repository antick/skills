#!/usr/bin/env python3
"""Run: audit.py run [--path PATH] [--state-dir PATH] [--docker].

Default: accessible local system storage. --path confines the audit to one folder.

Compare saved snapshots: audit.py compare BEFORE.snapshot.json AFTER.snapshot.json.
Python 3.10+ on macOS/Linux; standard library only. Help describes all options.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import sys

sys.dont_write_bytecode = True

from collectors import docker_metadata, processes
from compare import compare_snapshots, validate
from config import DEFAULT_DEPTH, DEFAULT_LIMIT, DEFAULT_TIMEOUT, MAX_DEPTH, SCHEMA_VERSION, default_state_dir
from history import locked_history, make_scope, previous_snapshot, read_json, run_id, save, timestamp
from report import compact, summary
from scan import Scanner
from scope import select_scope


def parser():
    result = argparse.ArgumentParser(description=__doc__)
    commands = result.add_subparsers(dest="command", required=True)
    run = commands.add_parser("run", help="Scan metadata, save a private snapshot, and compare to the previous run")
    run.add_argument("--path", type=Path, help="Audit only this folder; omit for local system storage")
    run.add_argument("--state-dir", type=Path, default=default_state_dir(), help="Private history root; never pruned")
    run.add_argument("--depth", type=int, choices=range(1, MAX_DEPTH + 1), default=DEFAULT_DEPTH,
                     help="Directory levels retained in JSON; sizing still traverses the entire scope")
    run.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT,
                     help="Soft scan time limit in seconds; partial sizes are flagged, never compared as zero")
    run.add_argument("--exclude", action="append", default=[], help="Exact relative subtree to exclude; repeatable")
    run.add_argument("--docker", action="store_true", help="Also collect read-only metadata from the selected local Docker context")
    run.add_argument("--limit", type=int, default=DEFAULT_LIMIT, help="Max entries in each stdout list; saved files remain complete")
    diff = commands.add_parser("compare", help="Compare two saved snapshots without scanning or writing")
    diff.add_argument("before", type=Path)
    diff.add_argument("after", type=Path)
    diff.add_argument("--limit", type=int, default=DEFAULT_LIMIT)
    return result


def exclusions_for(root, state, requested):
    exclusions = set()
    try:
        relative = state.relative_to(root)
        if not relative.parts:
            raise ValueError("History directory cannot be the audit root itself")
        exclusions.add(relative.as_posix())
    except ValueError:
        if state == root:
            raise
    for path in requested:
        candidate = Path(path)
        if candidate.is_absolute() or ".." in candidate.parts or not candidate.parts:
            raise ValueError("Exclusions must be non-empty relative subtree paths inside the audit root")
        exclusions.add(candidate.as_posix())
    return sorted(exclusions)


def run(args):
    if args.timeout <= 0 or args.limit < 1:
        raise ValueError("Timeout and output limit must be positive")
    if args.path is not None and args.docker:
        raise ValueError("Docker inventory is system-only; omit --docker for a folder-only audit")
    mode, root, devices, blocked_mounts, filesystems = select_scope(args.path)
    state = args.state_dir.expanduser().absolute()
    if state.is_symlink():
        raise ValueError("History root must not be a symlink")
    state = state.resolve()
    exclusions = exclusions_for(root, state, args.exclude)
    scope = make_scope(root, args.depth, exclusions, args.docker, mode)
    with locked_history(state, scope) as directory:
        previous = previous_snapshot(directory)
        started = timestamp()
        scanned = Scanner(root, args.depth, exclusions, args.timeout,
                          allowed_devices=devices, blocked_mounts=blocked_mounts,
                          system_mode=mode == "system", mounts=filesystems["mounts"]).run()
        if mode == "system" and filesystems["status"] != "complete":
            scanned["coverage"]["measurement"] = "partial"
            next(row for row in scanned["entries"] if row["path"] == ".")["measurement"] = "partial"
        disk = shutil.disk_usage(root)
        snapshot = {"schema_version": SCHEMA_VERSION, "run_id": run_id(),
                    "scope": scope, "captured_at": started, "finished_at": timestamp(),
                    "disk": {"total_bytes": disk.total, "used_bytes": disk.used, "free_bytes": disk.free},
                    **scanned, "filesystems": filesystems,
                    "collectors": ({"processes": processes(root), "docker": docker_metadata(args.docker)}
                                   if mode == "system" else
                                   {"processes": {"status": "not_requested", "reason": "Folder-only scope"},
                                    "docker": {"status": "not_requested", "reason": "Folder-only scope"}})}
        comparison = compare_snapshots(previous, snapshot)
        snapshot_path, comparison_path = save(directory, snapshot, comparison)
    return {"snapshot_path": str(snapshot_path), "comparison_path": str(comparison_path),
            "summary": summary(snapshot, args.limit), "comparison": compact(comparison, args.limit)}


def main():
    args = parser().parse_args()
    try:
        if args.command == "run":
            output = run(args)
        else:
            if args.limit < 1:
                raise ValueError("Output limit must be positive")
            output = compact(compare_snapshots(validate(read_json(args.before)),
                                               validate(read_json(args.after))), args.limit)
        print(json.dumps(output, ensure_ascii=True, indent=2))
        return 0
    except (OSError, ValueError, KeyError, TypeError, RecursionError) as error:
        print(f"system-storage-audit: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
