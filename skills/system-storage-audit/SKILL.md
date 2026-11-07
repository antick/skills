---
name: system-storage-audit
description: Use when the user wants a system storage or clutter audit, an explanation of hidden folders, a cleanup review report, or storage changes since a previous audit. A named folder limits the entire audit to that folder. For macOS and Linux; cleanup is a separate confirmed task.
---

# System storage audit

Explain what occupies the machine's local storage, what changed since the
previous run, and which items need review before cleanup. Without a folder,
audit accessible local system storage. When the user names a folder, audit only
that folder. Present findings in chat and leave cleanup pending confirmation.

## Select the scope and run

1. Use the machine and folder named in the conversation. Default to the current
   machine's system root only when no folder is specified. Reviewing or
   installing this skill alone does not authorize a scan. Scripts support
   macOS/Linux with Python 3.10+ and its standard library.
2. Resolve `<skill-dir>` to this installed skill's directory. For system storage:

   ```sh
   python3 -B "<skill-dir>/scripts/audit.py" run
   ```

   For a particular folder, pass it explicitly:

   ```sh
   python3 -B "<skill-dir>/scripts/audit.py" run --path "/path/to/folder"
   ```

   **Folder scope is strict:** retain the selected root, stay on its filesystem,
   and exclude sibling folders, symlink targets, system-wide process inventories,
   and Docker inventories. Do not expand to system mode to fill missing evidence.
   System mode discovers local filesystems, including macOS's separate Data
   volume, and avoids double-counting directory aliases. It excludes network,
   virtual, and unsupported mounts and reports access failures and timeouts.
   Preserve permissions; report inaccessible areas without automatically using
   elevated privileges. System mode may add `--docker` for local Docker metadata.
   Run `--help` for output limits, exact exclusions, and scan limits.
3. Read the command's bounded JSON. It scans once, saves private immutable
   snapshots and complete comparisons, and automatically compares to the previous
   matching machine, root, mode, and scan profile. System runs and each chosen
   folder have separate histories. First use establishes a baseline; a changed
   profile starts another history. State which happened and why. An unreadable
   area or an unmounted disk is not evidence of deleted files.
4. Investigate only large, changed, or uncertain paths within the selected scope.
   Reuse saved measurements instead of rebuilding scripts or repeating the scan.
   Saved detail includes every entry through the configured depth; stdout lists
   omitted counts. Read relevant saved JSON fields when a truncated list could
   hide an important resource. Read [the audit reference](references/audit.md)
   for filesystem boundaries, comparison rules, privacy, and accounting limits.

## Explain the result

Use snapshot path IDs. Separate **KEEP — IMPORTANT**, **REVIEW — DO NOT REMOVE**,
and **CANDIDATE — CONFIRM FIRST**. Script categories are hints. Establish the
owner, active consumers, exact proposed action, regeneration cost, and data loss
before proposing a candidate. Names, age, idle processes, or unattached volumes
alone do not prove disposability.

Protect operating-system files, boot data, installed software, credentials,
signing keys, settings, agent conversations/memories, databases, personal files,
source changes, models, and virtual-device data. Explain shortcuts separately
from copied data. Mark missing evidence and partial coverage explicitly.

Include the selected mode/root, timestamp, filesystem availability and exclusions,
coverage gaps, and linked snapshot/comparison paths. Show the previous run's
changes, largest space consumers, hidden-folder purposes, protected resources,
and specific review candidates. Preserve counts and disclose omitted rows.
Separate occupied data from estimated recoverable space; overlapping parent
rows and shared files cannot be added together. Propose exact IDs/actions for a
later cleanup selection; the main findings belong in chat.

This skill writes only its private audit history and contains no cleanup
commands. Keep deletion, pruning, file moves, service stops, and configuration
changes outside the audit. If cleanup is later requested, revalidate the
selected items and follow the separately confirmed `reclaim-dev-space` workflow
when available.
