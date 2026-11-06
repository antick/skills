---
name: branch-status
description: Count a repository's remote branches and list merged branches that are safe to delete, with merge evidence and retention reasons. Use for branch status or branch cleanup audits. Read-only; never deletes branches.
---

# Branch Status

Count the repository's live remote branches and identify merged branches that
can be considered for deletion. Report only: do not delete local or remote
branches, prune refs, switch branches, close pull requests, change protections,
or push. Fetching refs for inspection is allowed.

## Inspect

1. Read the repository instructions, confirm the repository, and use
   authenticated `gh` CLI or API reads. Inventory **live remote branches**,
   paginating every result. Do not count tags, `origin/HEAD`, stale tracking
   refs, or fork branches. Record each branch's tip SHA, the default branch,
   any long-lived integration branches (such as `develop`), and the snapshot
   time. Fetch the needed refs without changing the checkout.
2. Read branch protections and rulesets and the complete open pull request
   list, including drafts. Retain the default branch, integration and release
   branches, protected branches, and documented permanent branches. Retain any
   branch used as an open pull request's head **or base**, including stacked
   pull requests. Compare repository identity as well as branch name; a fork
   branch with the same name is a different branch. Retain branches checked out
   in local worktrees and disclose that other machines cannot be inspected.
3. Resolve merged pull requests for each branch through paginated reads.
   Verify the repository, the merge target, the merge commit, and the head the
   merge covered. A closed-but-unmerged pull request, a similar title, or an old
   merged pull request for a reused branch name does not prove the current tip
   was merged.
4. Establish merge evidence for the **current tip** with one of:
   - **Ancestry:** the tip is an ancestor of the fetched default or integration
     branch (`git merge-base --is-ancestor <tip> <target-sha>`). A merge only
     into another temporary branch does not count.
   - **Squash or rebase merge:** a merged pull request covers the exact current
     tip and its resulting commit is reachable from a permanent branch. Use the
     head recorded for that merge, not the live branch head. If the tip moved
     after the merge, retain the branch unless every added change is accounted
     for in the permanent branch. Patch similarity or an empty diff alone is not
     proof.
5. Check for commits added after the merge, branch reuse, partial merges, and
   reverts. Missing or shallow history and permission failures are evidence
   gaps, not proof either way. Unknown protection or open pull request state
   blocks a deletion recommendation.
6. Before reporting, reread candidate tips, open pull requests, and protections.
   Re-evaluate any branch that changed; mark it uncertain if it keeps changing.
   A deletion candidate needs complete current-tip merge evidence and no
   retention reason.

## Report

Start with the repository, snapshot time, total live remote branches, the number
whose current tips are confirmed merged, and the number eligible for deletion.
Count each branch once. Disclose incomplete pagination or access instead of
presenting a partial count as the total.

List every deletion candidate:

| Branch | Current tip | Merged pull request or evidence | Contained in |
| ------ | ----------- | ------------------------------- | ------------ |

Link pull requests or commits. An ancestry-only candidate can have no pull
request; show its commit evidence instead. Then list retained branches with
their reasons: permanent or protected, open pull request or stack, checked out,
unique commits, or uncertain. Say so when there are no candidates.

End with **No branches were deleted.** Recommendations are valid only for the
recorded snapshot; any later deletion must recheck the tip and retention rules.
