---
name: home-folder-audit
description: Use when the user wants a home-folder clutter or dot-folder audit, a cleanup review report, or changes in home storage since a previous audit. For macOS and Linux; actual cleanup is a separate confirmed task.
---

# Home folder audit

Explain what occupies the user's home folder, what its hidden folders do, and
what changed since the previous run. Audit metadata and present the report in
chat; cleanup stays pending the user's review and explicit selection.

## Run the audit

1. Confirm the requested machine and root from the conversation. Default to
   that machine's home directory. Reviewing or installing this skill alone does
   not authorize a scan. The scripts support macOS/Linux with Python 3.10+ and
   use only its standard library; report other platforms as unsupported.
2. Resolve `<skill-dir>` to this installed skill's directory, then run:

   ```sh
   python3 -B "<skill-dir>/scripts/audit.py" run
   ```

   Use `--home PATH` for a named root. Add `--docker` when local Docker is in
   scope; it refuses remote endpoints and never switches contexts. Keep the
   same options on repeat audits so their snapshots remain comparable.
   Run `--help` for output limits, exact subtree exclusions, and scan limits.
3. Let the command finish and read its compact JSON. It scans once, keeps
   bounded output, saves immutable metadata snapshots and complete comparisons,
   and automatically compares against the previous run for this machine, home,
   and scan profile. The first run establishes a baseline. A changed profile
   starts a separate history; say why rather than claiming no prior audit exists.
   Partial measurements remain unknown; an access error is never a removal.
4. Inspect only large, changed, or uncertain paths that need more evidence.
   Reuse saved measurements instead of repeating a home scan or reconstructing
   scripts. The full snapshot retains every entry through the configured depth;
   stdout says how many rows were omitted. Read the relevant saved JSON fields
   when a truncated list could hide an important resource. For comparison rules,
   privacy, and accounting limits, read [the audit reference](references/audit.md).

## Explain the result

Use stable path IDs from the snapshot. Separate **KEEP — IMPORTANT**,
**REVIEW — DO NOT REMOVE**, and **CANDIDATE — CONFIRM FIRST**. Script categories
are hints: a cache name, old date, idle process, clean worktree, or unattached
volume does not prove that deletion is safe.

Protect credentials, signing keys, settings, agent conversations/memories,
databases, personal files, source changes, installed tools, downloaded models,
and virtual-device data. Explain skill shortcuts separately from copied data.
For possible cleanup, establish the owner, active consumers, exact action,
regeneration cost, and data loss. Report unknown evidence explicitly.

Include:

- Scope, timestamp, disk availability, coverage gaps, and snapshot/comparison
  paths. Link the saved artifacts; the main findings belong in chat.
- Previous run timestamp and added, removed, grown, shrunk, or newly observable
  paths. Show uncertain measurements separately. State first-run/profile changes.
- Largest space consumers and dot-folder purposes, including protected resources
  and specific review candidates. Preserve counts and disclose omitted rows.
- A proposed selection of exact IDs/actions for later confirmation. Estimate
  occupied bytes separately from recoverable space; parent totals overlap.

This skill writes only its private audit history. Its scripts contain no cleanup
commands. Do not move, delete, prune, stop services, or change configuration as
part of the audit. If the user later requests cleanup, revalidate the selected
items and follow the `reclaim-dev-space` workflow when available; its separate
approval and protection rules still apply.
