---
name: spec-status
description: List unarchived OpenSpec changes whose implementation has already reached the main branch, with pull request and commit evidence. Use when asked which specs can be archived or to check pending spec archives. Reports only; does not archive or modify files.
---

# Spec Status

List active OpenSpec changes whose implementation has reached the main branch
and whose specs are not archived yet. This is a read-only report: do not run
an archive command, move or edit files, check off tasks, switch branches, or
change anything on GitHub. Fetching remote refs is allowed.

## Check

1. Read the repository instructions and confirm `openspec/` exists. Identify
   the main branch (the default branch unless the instructions name another
   release branch) and any integration branch such as `develop`. Fetch both and
   record the exact SHAs. Inspect trees with `git ls-tree` and `git show`
   without disturbing local work. If remote state cannot be read, say so and
   label results from cached refs as provisional.
2. List change directories under `openspec/changes/`, excluding `archive/`, at
   each fetched ref and in the current checkout. Reconcile them by change ID so
   work that exists only locally or only on the integration branch is not
   mistaken for released work. A change that is already archived, or has an
   archive move pending, is not a candidate. Report duplicate active and
   archived copies as a discrepancy.
3. For each remaining change, read its proposal, tasks, capability deltas, and
   verification or follow-up notes. Find the implementing pull requests from
   explicit links and path or commit history with `gh` reads, and confirm each
   association from the pull request's changed files and discussion. Titles,
   branch names, closed issues, and checked boxes alone are not proof. Paginate
   so older changes are not silently omitted.
4. Verify that every in-scope implementation part reached the recorded main
   SHA. Test each merged or squashed commit with
   `git merge-base --is-ancestor <commit> <main-sha>`. Work merged into an
   integration branch reaches main through a later promotion, so the original
   pull request need not target main. Do not test unmerged branch tips. Missing
   or shallow history means incomplete evidence, not unmerged work. A merged
   proposal without its implementation is not enough.
5. Cross-check the implementation and tests on main against the task scope.
   Look for later reverts or superseding changes. If history was rewritten,
   compare verified pull request diffs with current main code or mark the
   change uncertain. Unrelated follow-up work does not block a completed change;
   an unfinished part of this change does.
6. Reconcile task checkboxes with the evidence and report mismatches. Checked
   boxes do not prove a merge, and stale unchecked boxes do not undo a verified
   one. Outstanding required implementation or verification tasks keep a change
   off the candidate list. An unchecked archive task alone does not. Reaching
   main does not prove a deployment happened.

## Report

Start with the number of confirmed archive candidates and the main SHA checked.
Then one row per change:

| Change ID or spec path | Issues and pull requests | Evidence in main | Task notes |
| ---------------------- | ------------------------ | ---------------- | ---------- |

Link the artifacts, issues, and pull requests, and give the merged commit or
other verified evidence. Group several pull requests for one change into one
row. Say clearly when there are no confirmed candidates.

Separately list changes that need attention, each with a short reason: only on
the integration branch, partly merged, required tasks outstanding, reverted, or
evidence unavailable. Summarize already archived or pending archives and any
inventory or access gaps. End by stating that no specs were archived.
