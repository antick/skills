---
name: sync-branch
description: Bring a pull request or feature branch up to date by merging the latest main branch (or a branch named in the request), resolving conflicts while keeping both sides' intended behavior, verifying the result, and pushing. Use when asked to sync, update, or catch up a branch or PR; status-only questions do not authorize changes.
---

# Sync Branch

A request to sync authorizes fetching, merging, resolving conflicts,
committing, and pushing the target branch. Follow the repository's agent
instructions. Keep the pull request's base and draft or ready state unchanged.
Do not merge or close the pull request itself.

## 1. Identify and prepare

1. Resolve the target: a pull request link, a branch name, or the current
   branch when the request is unambiguous. For a pull request, read its head
   repository and branch with `gh pr view`. Never sync into `main`, the default
   branch, or another protected branch.
2. Choose the source branch: `main` by default, or the branch the user names
   when invoking this skill (for example "sync with develop"). If no branch was
   named and `main` does not exist, or the pull request targets a base other
   than `main`, ask which branch to merge instead of guessing; merging `main`
   into a pull request based on another branch pollutes its diff.
3. Fetch the source branch and the target head from their verified remotes and
   record both SHAs.
4. Work from the current remote head in a clean checkout. When the user's
   checkout has uncommitted edits or unpublished commits, use a separate
   detached worktree (`git worktree add --detach <path> <remote>/<branch>`),
   because the branch is already checked out there, and push from it with
   `git push <remote> HEAD:<branch>`. Never reset, stash over, or discard the
   user's work.

## 2. Merge

If the source tip is already an ancestor of the target head, report that the
branch is current and stop without creating an empty commit. Otherwise merge
with `git merge --no-commit --no-ff <remote>/<source>`. Preserve history: do
not rebase, squash, cherry-pick, or force-push.

## 3. Resolve conflicts deliberately

- Inspect the merge base, both versions, the surrounding code, and the relevant
  changes on each side before resolving a file.
- Combine the branch's intended behavior with the source branch's newer fixes,
  APIs, and tests. Never blanket-select ours or theirs, restore code the source
  branch removed on purpose, or weaken tests just to finish the merge.
- Regenerate derived files, such as lockfiles or generated API specs, with
  their supported tools instead of hand-merging them. Renumber colliding
  migrations according to the repository's convention.
- If both behaviors cannot coexist and the intended outcome is unclear, explain
  the exact conflict and ask before choosing. Never push an unresolved decision.

## 4. Verify before committing

- Compare the merged result with both recorded heads, including files that
  merged automatically. Check that the source branch's new behavior and the
  branch's own requirements both survive.
- Confirm there are no unresolved index entries or conflict markers.
- Run the focused lint, type, and unit checks for the affected packages. Follow
  the repository's consent rules for expensive suites, and report anything
  unrun.
- Do not commit with failing required checks unless the same failure exists on
  the source branch; report that as pre-existing. When you stop without
  committing, run `git merge --abort` so no checkout is left mid-merge, and
  report what failed.
- Write the merge commit message with `commit-message` when it is installed;
  otherwise follow the repository's commit convention.

## 5. Push and confirm

Recheck the remote head immediately before a normal push. If it moved, fetch
and reconcile those commits, then repeat the affected checks; never overwrite
another developer's work. Retry once after reconciling and report a repeated
race instead of looping. Verify the pushed head contains both recorded heads
and matches the remote.

## Report

Give the branch or pull request link, the source branch and SHA merged in, each
conflict and how it was resolved, the checks run with results, and anything
unrun. Do not claim the merge guarantees no regressions.
