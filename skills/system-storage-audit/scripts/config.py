"""Shared scan defaults, units, and conservative path explanations."""
from pathlib import Path
import os

SCHEMA_VERSION = 1
POLICY_VERSION = 3
DEFAULT_DEPTH = 3
MAX_DEPTH = 8
DEFAULT_TIMEOUT = 600
DEFAULT_LIMIT = 20
MAX_ERRORS = 100
PROGRESS_SECONDS = 10
BLOCK_BYTES = 512
PRIVATE_DIRECTORY_MODE = 0o700
PRIVATE_FILE_MODE = 0o600
STATE_COMPONENTS = ("antick", "system-storage-audit")
SYSTEM_ROOT = Path(os.path.abspath(os.sep))
LOCAL_FILESYSTEMS = frozenset({
    "apfs", "hfs", "hfsplus", "ext2", "ext3", "ext4", "xfs", "btrfs", "zfs",
    "f2fs", "ufs", "jfs", "reiserfs", "vfat", "msdos", "exfat", "ntfs", "ntfs3",
    "squashfs", "erofs", "iso9660", "udf",
})
ROOT_ONLY_FILESYSTEMS = frozenset({"overlay"})
SYSTEM_SCAN_ORDER = ("Users", "home", "Applications", "Library", "private", "var", "usr", "opt", "System")
SYSTEM_PATH_HINTS = {
    "System": ("protected", "Operating-system files and services"),
    "Applications": ("protected", "Installed applications"),
    "bin": ("protected", "System executables"),
    "sbin": ("protected", "System administration executables"),
    "usr": ("protected", "Installed system software and shared resources"),
    "etc": ("protected", "System and service configuration"),
    "var": ("protected", "Service state, databases, logs, and system data"),
    "private": ("protected", "macOS service state and system data"),
    "boot": ("protected", "Boot files"),
}

# Hints are explanations, never deletion decisions or executable cleanup rules.
PATH_HINTS = {
    ".ssh": ("protected", "SSH keys and connection settings"),
    ".aws": ("protected", "Cloud credentials and settings"),
    ".kube": ("protected", "Cluster connection settings"),
    ".tauri": ("protected", "App signing and updater keys"),
    ".config": ("protected", "Shared app configuration and account state"),
    ".agents": ("protected", "Shared agent skills and instructions"),
    ".codex": ("protected", "Agent conversations, authentication, settings, and tools"),
    ".codex_sw": ("protected", "Separate agent account state and shared links"),
    ".claude": ("protected", "Agent conversations, authentication, settings, and tools"),
    ".claude_second": ("protected", "Separate agent account state"),
    ".t3": ("protected", "Agent sessions, account state, and tools"),
    ".hermes": ("protected", "Agent source, runtimes, databases, and sessions"),
    ".local": ("protected", "Installed command-line tools and application state"),
    "Library": ("protected", "Application and operating-system data"),
    "Projects": ("protected", "Source projects and local development data"),
    "Documents": ("protected", "Personal documents and possible cloud placeholders"),
    "Desktop": ("protected", "Personal files"),
    "Downloads": ("protected", "Downloads can include documents and signing keys"),
    "Pictures": ("protected", "Personal images and photo libraries"),
    "Movies": ("protected", "Personal recordings and editing projects"),
    "Music": ("protected", "Personal music library"),
    ".npm/_cacache": ("cache-review", "Downloaded npm packages; check active consumers"),
    ".bun/install/cache": ("cache-review", "Downloaded Bun packages; retain executable and global tools"),
    ".cache/uv": ("cache-review", "Python package/build cache; retain environments and interpreters"),
    ".cache/huggingface": ("protected", "Downloaded models may be needed by working apps"),
    ".cache/torch": ("protected", "Downloaded models may be needed by working apps"),
    ".android": ("review", "Virtual devices, their data, and development keys"),
    ".nvm": ("review", "Installed Node.js versions and global packages"),
    ".rustup": ("review", "Installed Rust toolchains"),
}


def default_state_dir():
    base = Path(os.environ.get("XDG_STATE_HOME", Path.home() / ".local/state"))
    return base.joinpath(*STATE_COMPONENTS)


def hint(path):
    if path.split("/", 1)[0] in SYSTEM_PATH_HINTS:
        return SYSTEM_PATH_HINTS[path.split("/", 1)[0]]
    parts = path.split("/")
    matches = [(prefix, value) for prefix, value in PATH_HINTS.items()
               if any("/".join(parts[index:]) == prefix or
                      "/".join(parts[index:]).startswith(prefix + "/")
                      for index in range(len(parts)))]
    if matches:
        return max(matches, key=lambda pair: len(pair[0]))[1]
    return "review", "Ownership and ongoing need require review; names alone do not establish safety"
