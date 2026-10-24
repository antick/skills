# Resource inventory and removal checks

Use these checks with the main skill's **chat report → user confirmation →
revalidation → exact action → verification** workflow. None of the commands or
examples below grants permission to delete resources. Adapt read-only tools to
the detected OS; inspect installed help before using unfamiliar options.

## Worktrees and agent-created directories

Resolve each repository root and Git common directory; deduplicate repositories
registered through multiple paths. Read `git worktree list --porcelain` and the
owning harness's worktree/session metadata when available. Cover every registered
worktree, including missing, locked, prunable, detached, and clean entries. Show
agent-managed directories discovered through configured roots separately when
they are not registered worktrees. Do not scrape entire private conversations to
infer ownership; use minimal task/session/project metadata.

For each existing worktree, inspect Git status including untracked files, HEAD,
branch/upstream, local-only or detached commits, locks, active tasks/processes,
and relevant ignored files. A clean tracked diff can hide ignored `.env` files,
local databases, user assets, or an active agent. Generated-cache size inside a
retained worktree can be a separate candidate from deleting the whole worktree;
deduplicate those byte estimates. Unique/detached commits and unknown-value
ignored/untracked contents remain protected until preserved and reclassified.

Keep the primary and current worktrees, locked worktrees, in-use worktrees, and
those with valuable changes. For an approved clean inactive extra worktree, use
the owning harness's removal operation when available, otherwise `git worktree
remove <exact-path>` without force. Check that the operation does not implicitly
delete its branch or unrelated task state. Never use recursive filesystem
removal as a fallback for a refused worktree removal.

`git worktree prune --dry-run --verbose` can expose stale registrations; review
all entries it proposes before approval. Pruning is metadata cleanup, not
removal of live worktree directories or Git branches. Recheck the full prune set
before applying it; if it has expanded beyond the approved set, do not run it.
See [Git's worktree reference](https://git-scm.com/docs/git-worktree).

## Docker containers, images, volumes, networks, and builders

Identify the selected Docker context/host, rootless/rootful daemon, and builder.
Do not switch contexts or scan every remote endpoint automatically. Read visible
resource listings (`docker ps -a`, image/volume/network listings,
`docker system df`, and builder usage metadata as supported). Report all visible
resources or explicit coverage gaps, grouping large lists in chat.

Project only needed inspect fields: immutable IDs, state, known project/task
labels, image IDs, mounts/volume names, network consumers, and sizes. Full inspect
output can expose environment secrets: do not print it or raw container envs.
Record every container using a volume, bind mount, image, or network, including
stopped consumers; check host processes for bind-mounted data too. Labels and
names are evidence of origin, not proof of disposable contents.

Identify primary app/DB containers by their configured data mounts and actual
project role. Name their volumes, host paths, mount destinations, and images in
the protected section. Keep unknown, shared, production, primary, or active
resources. Stopped DB containers can still hold their only data in writable
layers; disclose that before classifying their removal as a candidate.

For approved disposable stopped containers, recheck their IDs and state, then use
`docker rm <exact-ID>` without `--force` or `--volumes`. Keep the volumes unless
separately named and confirmed. For reviewed unused images, preserve primary
images and all retained container dependencies; use exact image IDs without
force. Remove a network only if the reviewed network is unused and unrelated
services will not need it. Never remove a volume simply because no container is
attached. Verify a dedicated test volume's data policy and consumers first.

Do not use catch-all prune commands as a shortcut. Image layers, caches, and
volumes can be shared across projects, and builder usage may differ by builder.
A builder-cache operation must have an inspected, supported bounded selection
and a report of affected scope/rebuild cost; global builder cleaning is not a
repo-only action. If scope cannot be established, retain it. See
[Docker pruning semantics](https://docs.docker.com/engine/manage-resources/pruning/)
and [container removal options](https://docs.docker.com/reference/cli/docker/container/rm/).

## Extra test databases and snapshots

Find test instances from project test/Compose configuration, harness task
metadata, container labels, and existing authorized local database connections.
Inventory local SQLite files and known DB data/snapshot directories as well as
logical test databases on servers already in scope. Keep credentials hidden; do
not dump rows, database contents, or secret-bearing connection URLs.

Record the exact server/cluster endpoint and immutable instance identity where
available, logical database/schema name, owning project/task, consumers/sessions,
container and storage mapping, size, retention/backups, and evidence of
reproducibility or explicit disposability. Check whether this is the only copy of
valuable data. A database named `test` can be the user's primary development DB.
Without authorized read-only access, report the DB check as unavailable; do not
invent a disposable classification or connect to production to fill the table.

Dedicated ephemeral test DBs/snapshots can become candidates only when inactive,
isolated, and proven disposable or recoverable. Confirm the exact data-bearing
row and irreversible effect with the user. Verify a restorable backup when
retention is required; do not assume one exists. An explicitly disposable fixture
can be deleted without creating a backup, provided that loss was in the report
and confirmation. The report itself is never saved to disk.

Before deletion, recheck instance identity, exact database/storage target, active
sessions, all mounts/consumers, and independence from primary/shared data. Use
vendor-supported identifier quoting and an exact native operation; never infer a
SQL identifier from an unvalidated name or wildcard. Do not force-disconnect
clients, drop the primary/current database, apply cascading schema removal, or
invoke helpers that remove a shared cluster. If a tool cannot isolate the
approved test database, leave it and explain the limitation.

Logical DB deletion, container deletion, dedicated volume removal, and snapshot
removal are separate approved actions. Dropping a test DB inside a shared primary
container never authorizes removing that container, its volume, or its image.
Check retained database identities/health and mounts afterward without reading
user records. Space released inside a DB engine is not necessarily free OS space.

## Generated caches, builds, outputs, downloads, and temp data

Identify paths from actual project/tool configuration and creation evidence,
not directory-name guesses. Examples include Turbo cache, Next.js build outputs,
Playwright downloads, agent sandboxes, generated test/browser results, and
agent-created temporary exports. Inventory other frameworks' generated outputs
when verified; the skill is not limited to Turbo or Next.js.

Check resolved path, expected parent, ownership, symlinks, active processes,
mounted/shared locations, generated status, and recovery cost. Size files without
following symlinks or double-counting nested entries; use platform-native free
space readings. For Btrfs/reflinks, snapshots, sparse files, and Docker layers,
state accounting limitations and avoid adding overlapping logical sizes.

Preserve source, credentials, config, model weights/downloads with uncertain
value, user uploads, agent conversations/memory, and `node_modules` by default.
Do not indiscriminately erase `.turbo`, whole home/temp/cache directories, or an
agent's entire runtime directory. Primary/active resources remain protected even
when an agent created them. Remove only exact inactive verified generated paths
that the user confirmed; account for later builds/tests redownloading or
regenerating them. Recheck paths and consumers immediately before removing them.
