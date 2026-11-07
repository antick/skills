"""Private, immutable snapshots with a locked and atomically updated latest pointer."""
from contextlib import contextmanager
from datetime import datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import stat
import uuid

from compare import validate
from config import POLICY_VERSION, PRIVATE_DIRECTORY_MODE, PRIVATE_FILE_MODE, SCHEMA_VERSION

SNAPSHOT_NAME = re.compile(r"^[0-9TZ-]+-[0-9a-f]{32}\.snapshot\.json$")


def timestamp():
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def make_scope(root, depth, exclusions, docker, mode="folder"):
    metadata = root.stat()
    return {"root": str(root), "mode": mode, "host": platform.node(), "uid": os.getuid(),
            "root_device": metadata.st_dev, "root_inode": metadata.st_ino,
            "depth": depth, "exclusions": sorted(exclusions), "docker": docker,
            "policy_version": POLICY_VERSION, "schema_version": SCHEMA_VERSION}


def namespace(scope):
    return hashlib.sha256(json.dumps(scope, sort_keys=True).encode()).hexdigest()[:24]


def private_directory(path):
    if path.is_symlink():
        raise ValueError(f"History directory is a symlink: {path}")
    path.mkdir(mode=PRIVATE_DIRECTORY_MODE, parents=True, exist_ok=True)
    metadata = path.stat()
    if not stat.S_ISDIR(metadata.st_mode) or metadata.st_uid != os.getuid():
        raise ValueError("History directory must be owned by the current user")
    path.chmod(PRIVATE_DIRECTORY_MODE)


@contextmanager
def locked_history(base, scope):
    private_directory(base)
    directory = base / namespace(scope)
    private_directory(directory)
    fd = os.open(directory / ".lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW,
                 PRIVATE_FILE_MODE)
    try:
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error:
            raise ValueError("Another audit is running for this scope; retry after it finishes") from error
        yield directory
    finally:
        os.close(fd)


def read_json(path):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(fd, encoding="utf-8") as source:
        return json.load(source)


def previous_snapshot(directory):
    pointer = directory / "latest.json"
    if not pointer.exists() and not pointer.is_symlink():
        return None
    try:
        name = read_json(pointer)["snapshot"]
        if not isinstance(name, str) or not SNAPSHOT_NAME.fullmatch(name):
            raise ValueError("Invalid snapshot filename")
        return validate(read_json(directory / name))
    except (OSError, ValueError, KeyError, TypeError) as error:
        raise ValueError(f"Cannot read previous baseline; history retained: {error}") from error


def write_new(path, value):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                 PRIVATE_FILE_MODE)
    with os.fdopen(fd, "w", encoding="utf-8") as target:
        json.dump(value, target, ensure_ascii=True, separators=(",", ":"))
        target.write("\n")
        target.flush()
        os.fsync(target.fileno())


def save(directory, snapshot, comparison):
    stem = snapshot["run_id"]
    snapshot_path = directory / (stem + ".snapshot.json")
    comparison_path = directory / (stem + ".comparison.json")
    write_new(snapshot_path, snapshot)
    write_new(comparison_path, comparison)
    temporary = directory / (".latest-" + uuid.uuid4().hex)
    write_new(temporary, {"snapshot": snapshot_path.name})
    os.replace(temporary, directory / "latest.json")
    return snapshot_path, comparison_path


def run_id():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ-") + uuid.uuid4().hex
