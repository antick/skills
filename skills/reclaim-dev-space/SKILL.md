---
name: reclaim-dev-space
description: Report development disk usage, agent-created artifacts, worktrees, Docker resources, and extra test databases directly in chat; highlight protected resources and reclaim space only after the user confirms specific cleanup items.
---

# Reclaim development space

Start with a read-only inventory and report in the chat where this skill was
called. After the report, obtain explicit confirmation of the concrete cleanup
selection before deleting anything. Reviewing or installing this skill does not
authorize an inventory or cleanup of the machine.

## Establish scope and evidence

Identify the OS, current repository, known agent/worktree locations, active agent
and development sessions, storage/filesystems, and Docker context/daemon. Use
OS-appropriate tools and the owning harness's read-only metadata when available.
Read [the resource checks](references/resource-checks.md) before inventorying or
removing worktrees, Docker resources, database data, or generated artifacts.

By default, inventory all registered worktrees for the current repository and
repositories discovered through configured local agent/worktree registries, plus
any repositories the user names. Identify the owning repository for every row.
Use known local roots and registrations for discovery, not an unbounded crawl of
the whole disk. If the user narrows the scope, mark discovered resources outside
it as excluded. Cross-project candidates must be clearly identified in the report
and explicitly covered by the cleanup selection. List all visible containers, volumes,
images, and builder/cache summaries in the selected Docker context, including
important and unrelated resources, not just cleanup candidates. Docker storage
can span projects. A remote daemon/database or inaccessible agent directory is
not the local machine: identify it, show coverage limits, and require explicit
scope before accessing remote resources or proposing remote cleanup.

Include extra test databases, clones/snapshots, agent sandbox directories,
generated builds, caches, browser downloads, test outputs, temporary exports, and
other discovered development artifacts. Check available metadata for provenance:
harness/worktree registrations, project labels, test configuration, resource
owners, mounts, and active consumers. Mark attribution `verified`, `likely`, or
`unknown` and explain the evidence. Names containing "test", "tmp", an agent
name, or a timestamp, an old creation date, a clean Git status, or an unattached
Docker volume are not enough to establish that deletion is safe.

Keep inventory non-destructive: do not stop services, remove registrations,
create reports, install cleanup utilities, or run cleanup/dry-run commands that
actually mutate state. Do not inspect secrets or database records; collect only
metadata needed to establish identity, dependencies, size, and disposability.

## Report in chat before cleanup

Render the report directly in the invoking conversation. Use an inline table or
interactive UI if the harness supports it **without saving a report artifact**;
otherwise use Markdown tables. Never create, export, or save a Markdown, HTML,
JSON, CSV, PDF, or other report file, including a temporary report or downloadable
artifact. Do not substitute a file link for the report. For large inventories,
split tables into readable sections in chat; retain all identified resources and
coverage counts rather than silently dropping protected or uncertain entries.

Begin with the inspected scope: repositories/worktree roots, filesystem and
available space, Docker context/daemon/builder, database servers, and unavailable
checks. State which parts were not checked and why; do not claim a machine-wide
inventory when only one repository or daemon was inspected.

Use stable item IDs so the user can choose precisely. Group rows by worktrees,
containers, databases/storage, and other artifacts, retaining these fields:

| ID | Resource / exact path or identity | Type / owner | State and consumers | Size / estimated reclaim | Agent provenance | Decision / risk | Reason and proposed action |
| --- | --- | --- | --- | --- | --- | --- | --- |

Clearly label each row:

- **KEEP — IMPORTANT**: primary/current worktree, active sessions/services,
  production/primary database and its exact container, image, volume and mount,
  unique/uncommitted work, shared persistent storage, credentials/configuration,
  source, or any other irreplaceable resource. Explain why it must remain.
- **REVIEW — DO NOT REMOVE**: ownership, test-data value, references, activity,
  backups, or provenance is uncertain; permissions/metadata are incomplete; or
  the item is outside scope. Explain what evidence is missing.
- **CANDIDATE — CONFIRM FIRST**: evidence supports an inactive, disposable or
  regenerable resource and its consumers are understood. State the exact action,
  impact, rebuild/download cost, and any data loss. It is not permission to delete.

List protected resources as prominently as candidates. For an extra test DB,
identify server/instance, database, container, volume/bind mount, and whether its
storage is dedicated or shared. Separate deleting a logical database, removing a
container, and removing storage into distinct actions; none implies the others.
A shared primary DB volume is always protected even if it contains an extra test
DB that could be dropped separately after confirmation.

Summarize candidate bytes, protected resources, review items, and exclusions.
Use `unknown` where sizes cannot be measured. Deduplicate paths, Docker shared
layers, filesystem snapshots, and container/volume overlap; report estimates as
estimates rather than promising their sum will become free disk space. Metadata
pruning can reclaim negligible space. Test DB deletion can free internal space
without returning bytes to the filesystem.

## Get confirmation of the selection

After the report, ask which candidate IDs/actions to perform, with a concise
proposed selection. The user must confirm **after seeing this report**; an initial
"clean up everything" request is not confirmation of unseen items. Never infer
approval from silence, elapsed time, UI selection without submission, resource
names, or previous cleanup in another context.

Accept an approved subset and retain everything else. A submitted selection in
a supported harness UI counts as confirmation when it clearly identifies the
resources and actions. Broad approval of the proposed candidate set covers only
that displayed set; it never includes KEEP/REVIEW rows or new discoveries.
Require explicit naming/IDs and acknowledgement of data loss for test databases,
database containers with writable-layer data, and dedicated test volumes or
snapshots. Generic cache cleanup approval does not authorize dropping data.

If this conversation already contains the matching report and explicit approval,
revalidate and proceed without asking again. Changed scope, newly discovered
items, new consumers, or a changed risk invalidates approval for those items;
skip them and report the change. A protected/review item needs new evidence and
a revised report before it can become a candidate. If confirmation is unavailable,
end with the chat report and pending selection; make no destructive changes.

## Clean the approved items carefully

Immediately before each operation, recheck the exact identity, canonical path,
owner, context, active users, dependency/mount graph, protection status, and
continued match to the approved row. Refuse symlink/path escapes, reused names,
changed container IDs, newly dirty worktrees, or resources whose ownership is
unclear. Use exact reviewed identifiers and the owning tool's bounded operation;
never compose deletion from an unreviewed glob or "all stopped/unused" query.

Preserve main/current/locked worktrees, active agent tasks, source, branches,
credentials, primary app containers/images, all primary/shared database storage,
and bind-mounted user data. Do not stop a running service just to make it eligible
for cleanup. Remove only reviewed stopped disposable containers, without force
or implicit volume removal. Do not delete an existing worktree with force, prune
branches, run broad Git cleaning, or delete Docker's internal data directories.

Prefer exact container/image/volume targets. Do not use blanket `docker system
prune`, volume/container/image pruning, `docker compose down -v`, or `docker rm -v`.
Builder cache cleanup requires a separately displayed builder/context and bounded
filter/selection whose impact is understood and confirmed; if the tool cannot
honor that boundary, skip it and explain. Do not treat Docker's "unused" flag as
evidence that persistent data is disposable.

For confirmed disposable test data, use the database or storage owner's native
operation only after the checks in the reference. Never drop the primary DB,
terminate sessions to force deletion, cascade through shared data, or remove a
shared volume. Proceed item by item; stop a dependent sequence when a safeguard
or verification fails and preserve remaining resources. Continue only independent
approved items whose safety still holds. Report failures honestly, without
repeated blind retries or broadening commands to force success.

## Verify and report the result in chat

Re-inventory affected worktrees, containers, database identities, mounts, storage,
and free space. Verify that every protected resource still exists with the same
identity/mount and expected state, that retained worktrees keep their changes,
and that the primary DB remains reachable when a safe metadata-only health check
is available. Report unavailable verification explicitly; do not claim data
safety from Docker's removal output alone.

Post a second table in the same chat: item ID, approved action, result
(`removed`, `retained`, `skipped — changed state`, `blocked`, or `failed`), verified
space/result, and reason/next step. Distinguish actual filesystem free-space
change from estimates/internal reusable space and note concurrent activity or
shared/Btrfs/Docker accounting. Highlight protected databases/volumes retained,
remaining review items, and rebuild/redownload costs. Save no report file.
