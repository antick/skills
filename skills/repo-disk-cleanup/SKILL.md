---
name: repo-disk-cleanup
description: Inventory and, with explicit permission, clean a repository's generated Turbo/Next.js artifacts, stale Git worktrees, Docker test containers/build cache/unused images, and Playwright browser downloads while preserving primary databases and their volumes. Use for disk cleanup requests in any repository.
---

# Repository disk cleanup

Operate on the user's **current repository**, not on a hardcoded project. Default to an inventory and proposed plan; perform destructive steps only when the user explicitly authorizes them. Honor the repository's own instructions. Scope each deletion to the categories the user approved; report skipped items and remaining disk use.

## Preflight (always)

1. Resolve the repository root with `git rev-parse --show-toplevel`; verify it is the requested repository and inspect `git status --short` and `git worktree list --porcelain`. Check whether build/dev/test processes are running. Do not clear in-use build directories or a worktree containing work. Never delete source, `node_modules`, Git branches, or an existing worktree merely to save space without a separate explicit decision.
2. Inventory sizes of the actual cache paths before deletion (`du -sh`), plus `df -h`, `docker system df`, `docker ps -a`, images and volumes if Docker is available. Docker state is **machine-wide**, not repo-specific. Inspect labels, names, mounts, state, and Compose project for every proposed container removal. Identify the primary DB container by its mount to the persistent data volume (not merely by its name), and explicitly state both names. Protect all primary app containers, primary DB image, volumes, and bind-mounted data. If identity is ambiguous, stop and ask. Never use `docker system prune --volumes`, `docker volume prune`, `docker compose down -v`, `docker rm -v`, or raw deletion under Docker's data root. Do not infer that an unreferenced volume is disposable.
3. Before applying global Docker image or builder pruning, tell the user it may affect images/cache belonging to other projects; obtain approval for those operations if not already explicit. Check for running containers and exclude them. Avoid printing secrets, DB records, or Docker environment variables.

## Approved cleanup (only requested categories)

- Turbo: remove `<repo>/.turbo/cache` only if it is a real directory inside the verified repo, not a symlink. Do not remove `.turbo` indiscriminately.
- Next.js: inventory and remove only verified generated `apps/*/.next` and explicitly identified `.next-login-harness` directories, when no relevant server/test is running. Never follow symlinks; do not delete source directories. For another layout, inspect it before choosing paths.
- Containers: remove only individually reviewed **stopped** test/automation containers. Use `docker rm <explicit names or IDs>` **without `-v`**. Exclude primary containers and any unknown container; recheck primary DB name, data-volume mount, and container existence immediately before deletion. Do not remove attached or anonymous volumes, even after removing containers.
- Build cache: `docker builder prune -af` only when authorized; regenerates on rebuild.
- Unused images: `docker image prune -af` only when authorized and after identifying primary DB image and retaining its container. Warn that this is global; report image changes. Never use `docker rmi` on a protected image.
- Playwright downloads: remove `~/.cache/ms-playwright` only when authorized, inspected as a real directory, and no browser tests are running. Note that a later test will redownload browsers.
- Worktrees: run `git worktree prune --dry-run --verbose`, then `git worktree prune --verbose` for stale registrations. Keep the main worktree. For any *existing* extra worktree, first inspect status, untracked files, and user ownership; never use `--force` and ask before removing it even when clean. Pruning metadata does not remove a Git branch.

## Verification

Confirm the protected DB container still exists, still mounts exactly the same volume at its data directory, and the volume still exists; confirm other protected containers remain. Confirm `git worktree list`, targeted cache paths, `docker ps -a`, `docker system df`, `git status --short`, and `df -h`. Give actual results, avoid summing overlapping Btrfs/Docker logical sizes, and call out retained database volumes explicitly. Never claim data safety merely because Docker reported an item as unused.
