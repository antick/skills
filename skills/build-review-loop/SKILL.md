---
name: build-review-loop
description: Build the user's own issues in parallel with one builder agent and worktree per issue, then self-review each draft pull request, post the findings, send them back to the same builder, and re-review until every current head has no actionable findings. Use when asked to build issues with a self-review and fix loop before the user's final review. Single tasks use code-build; review-only work uses code-review.
---

# Build Review Loop

Take each requested issue through building, a draft pull request, review,
published findings, fixes, and re-review. The coordinator (you) owns every
review verdict; each issue's builder owns its implementation and branch. These
are the user's own tasks, so every review is a self-review.

## Authorization

Invoking this loop authorizes builder delegation, commits, pushes, draft pull
requests, and publishing findings with `submit-review` in self-review mode.
The user keeps the final review: do not merge, deploy, approve, mark a pull
request ready, or change ticket or project status. The repository's other
approval rules still apply. Continue independent work while a decision is
pending.

## 1. Map issues to builders

Read each issue and its discussion. Capture reproduction steps, acceptance
criteria, dependencies, and scope boundaries. Ask only about missing
information that blocks correct work. Spot shared files, colliding migration
numbers, and ordering dependencies early, and coordinate them without merging
the issues into one implementation.

Keep a compact ledger with one entry per issue: builder handle, worktree,
branch, pull request link, latest head SHA, review round, open findings,
verification results, and state (`queued`, `building`, `reviewing`, `fixing`,
`clean`, or `blocked`). A blocker is never clean.

## 2. Start one builder per issue

Use the host's delegation and worktree tools to give each issue its own builder,
worktree, and branch, based on the latest fetched base branch unless the user
names another. Verify each worktree's base before work starts. Queue issues
beyond the available concurrency, keeping one builder per issue. Keep any
provider or model settings the user asked for, and say when one is unavailable.

Give each builder a self-contained task with:

- the exact issue URL, scope, dependencies, and shared-file notes;
- an instruction to use `code-build`, including its meaningful commits,
  behavioral tests, focused checks, and draft pull request linked to the issue;
- the user's earlier consent or refusal for expensive checks;
- an instruction to return the pull request URL, pushed head SHA, changed
  behavior, checks run with results, unrun checks, and open decisions;
- an instruction to implement only and leave review to the coordinator;
- an instruction to return any `code-build` approval request, such as a layout
  sketch for a new screen, as an open decision instead of waiting for the user;
- an instruction not to use the user's main Chrome. Browser checks that need
  it are run by the coordinator, one at a time, with `use-chrome`.

When a builder returns an open decision, ask the user, then send the answer
back to the same builder.

Start independent builders together and review finished pull requests while
others are still building. Keep each builder's handle for later fixes.

## 3. Review every finished pull request

Run `code-review` completely on each pull request: the whole base-to-head
change against its exact issue, not the builder's summary. Record the reviewed
head SHA and findings. A builder's own "done" or "clean" claim, green CI, and
passing tests do not establish a clean review. If the head changes during the
review, review the new head before recording a verdict; a verdict applies only
to the SHA actually reviewed.

## 4. Post findings and return them to the builder

For each pull request with actionable findings, run `submit-review` in
self-review mode: inline comments without a username tag, a comment review, and
the pull request kept as draft. Record the review link.

Send the exact findings and link to that issue's existing builder, resuming it
in the same worktree and branch to fix, test, commit, and push to the same pull
request. For a merge-conflict or behind-base finding, tell the builder to bring
the branch up to date with `sync-branch`, merging the pull request's base
branch, then re-review. Keep other builders on their own issues.

If a builder disputes a finding, check the evidence against the requirement
and settle it on technical grounds. Ask the user when intended behavior is
ambiguous. Never drop a valid finding to end the loop. Persistent permission,
environment, or capability failures are blockers to report.

## 5. Re-review after every fix

When a builder reports a fix, verify the pushed head and repeat step 3 on the
whole pull request: recheck every earlier finding and look for regressions the
fix introduced. Post new or remaining findings through step 4.

Repeat until the current head has zero actionable findings. Do not stop after a
fixed number of rounds. If an issue makes no progress across rounds,
investigate or escalate that blocker while other issues continue. Any push,
sync, or conflict resolution after a clean verdict invalidates it and needs a
new review.

## 6. Hand back the batch

Before announcing completion, confirm every issue has a pull request whose
latest head matches a clean verdict. Report overlapping files, migration
collisions, and merge-order constraints across the batch; do not merge one pull
request to fix another.

Return one row per issue:

| Issue | Pull request | Reviewed head | Rounds | Final state |
| ----- | ------------ | ------------- | ------ | ----------- |

Then summarize fixes made, passing checks, unrun checks, open decisions, and
integration conflicts. Say clearly whether all pull requests have no actionable
findings and await the user's final review, or which are blocked. Send short
progress updates while work continues; a progress update is not completion.
CI monitoring and repair are extra work only when requested.
