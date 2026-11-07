# Audit history and interpretation

## Saved state

The script stores history beneath `$XDG_STATE_HOME/antick/system-storage-audit`, or
`~/.local/state/antick/system-storage-audit` when that variable is unset. Override
with `--state-dir PATH`. This metadata history is an intentional part of this
skill, unlike the report-only `reclaim-dev-space` workflow.

Each scope has its own directory, selected from the machine name, user ID,
system or folder mode, canonical root and filesystem identity, schema/policy version, detail depth,
exclusions, and Docker option. It contains immutable `*.snapshot.json` and
`*.comparison.json` files, a `latest.json` pointer, and a persistent `.lock` file.
The directory has mode `0700`; new state files have mode `0600`. History is never
automatically pruned. Do not commit or publish these files: filenames, local
paths, account-folder names, and process names can be private.

The lock covers baseline selection, scanning, comparison, and writing. Concurrent
runs for the same scope fail without advancing the baseline. Snapshots and
comparisons are written before the latest pointer is atomically replaced. A
corrupt/missing referenced baseline causes a clear failure and is retained;
never reset it silently. A failed root listing does not advance history. A
partial scan is saved with its access/timeout gaps, and becomes the next run's
previous state; comparisons preserve uncertainty across those gaps.

To compare any two compatible saved snapshots without scanning or writing:

```sh
python3 -B "<skill-dir>/scripts/audit.py" compare BEFORE.snapshot.json AFTER.snapshot.json
```

Different roots, hosts, system/folder modes, or scan profiles are rejected. Never seed this format
from conversational estimates or pretend an older manual report is a complete
script-generated baseline.

## Measurement boundaries

The default scope starts at `/` in the current machine's mount namespace.
System mode discovers mounted local filesystems from Linux mountinfo or macOS
mount metadata. It includes the separate macOS Data volume, blocks network and
virtual filesystems, and reports unsupported filesystem types as exclusions.
Mounted macOS disk images and nested Linux container overlays are excluded to
avoid counting their contents again alongside host backing files. An overlay
root is supported inside a container, covering that container's mount namespace
rather than the physical host.
Each included filesystem carries its own availability figures. Do not sum APFS
volumes that share a storage pool. Unknown mount discovery makes the result
partial; it is never represented as complete system coverage.

`--path PATH` selects folder mode. It scans only that canonical folder on its
containing filesystem; nested mounts and symlink targets remain outside scope.
System-wide process and Docker queries are disabled. `--path` with `--docker`
is rejected before any scan or history write. The containing filesystem's disk
availability is context, not a measurement of unrelated folders.
Folder mode reads the OS mount table only to locate nested mount points within
the selected path. It blocks those points even when a bind mount shares the
same filesystem device, without querying other mounts' storage. If mount
boundaries cannot be read, the folder audit stops before writing history.

The scanner visits each subtree once using directory descriptors and metadata
calls. It reads no file contents and follows no directory symlinks. System mode
crosses only discovered local filesystem devices. Directory identities deduplicate
bind mounts and macOS aliases; file inodes deduplicate hardlinks. User-facing
root directories are visited before the macOS physical Data-volume mirror, so
saved detail remains useful. It excludes its own history subtree. Exact `--exclude`
subtrees are part of the comparison scope; they are not zero-sized cleanup wins.
Excluded object identities are resolved before traversal so another alias cannot
be visited first. Linux mount roots also identify aliases of descendants inside
an excluded subtree. Neither operation reads the excluded files' contents.
The `--depth` setting limits saved detail, not sizing traversal. Default depth
three covers top-level system categories and user-home entries; deeper cache
detail needs a higher depth or a separate folder-scoped run. Changing depth
starts a separate comparison profile. The timeout is soft:
an individual operating-system metadata call or directory listing can exceed it.

Allocated bytes use filesystem block counts. Hardlinked file inodes are counted
once in deterministic path order; per-path attribution can change when another
link is added or removed. Files with zero allocated bytes may be cloud
placeholders. APFS clones, snapshots, compression, sparse disks, and shared
package files can make deletion recover less space than occupied-size figures
suggest. Cloud files are not intentionally opened or downloaded. Do not sum
parent/child rows, Docker internal totals and its host VM disk, or shared images.

Both entries must have complete sizes before a byte delta is calculated.
`measurement_unknown` has no numerical delta. Missing descendants of an
unreadable or unscanned directory are `not_observed`, not `removed`. Paths that
become visible after such a gap are `newly_observed`, not necessarily newly
created. Filesystem device changes are `filesystem_changed`, without a byte
delta. Contents of unmounted devices are `not_observed`; mounting existing data
does not establish file creation or disk growth. Aggregate comparisons remain
unknown where changed filesystem boundaries affect their totals. Changed mount
paths also keep their contents uncertain when the same device remains mounted
elsewhere. Linux mount roots distinguish rebinding a path to another directory
on the same device. `metadata_changed` means file metadata changed, not that contents were
read or compared. Disk availability is a host-wide observation, not proof that
an audit or cleanup reclaimed that amount.

## Follow-up evidence

The script identifies common protected paths and cache review hints, but it does
not prove disposability. Use targeted metadata checks for owners, symlink targets,
recent usage, open-file consumers, installed versions, and app-supported removal
options. Never dump credential files, shell environments, DB records, or private
conversations to identify a folder.

For agent workspaces, inspect the owning Git registrations, dirty/untracked and
ignored files, detached/local-only commits, locks, and live tasks before proposing
removal. A broken Git reference is a review/recovery item. The filesystem scan
does not perform an exhaustive Git-state or logical-database audit.

In system mode, `--docker` saves containers, image tags, volumes, networks, container mounts, and
daemon space summaries using projected fields. Full environment-bearing inspect
output is never collected. Failed/unavailable inventories and changed contexts
have unknown resource deltas. Builder-specific cache records, volume byte sizes,
consumer graphs, and logical database contents need separate scoped checks;
Docker's “reclaimable” or unattached status does not authorize deletion.

The initial audit needs no installation, service changes, or file moves. A later
cleanup requires the user's approval of the displayed selection, a fresh safety
check, an exact native removal action, and verification of retained data.
