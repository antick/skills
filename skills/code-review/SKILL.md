---
name: code-review
description: Evidence-based, read-only review of local changes, commits, branches, or pull request links against their requirements. Reports severity-ranked Issue, Impact, and Solution findings in plain language, split into Task findings and Code health (code smells, coverage gaps, dead code, over-engineering, side effects), with merge status, verification gaps, and regression coverage.
---

# Code Review

Find confirmed problems in the exact change under review and explain them so a
developer who has not read the code understands them on the first read. Prefer
a few strong, actionable findings over a long list of possibilities.

## Contract

- Review only. Do not edit files, switch branches, commit, push, comment,
  approve, request changes, label, assign, close, merge, or change ticket or
  project status. Publishing findings is a separate step (`submit-review`) that
  needs its own request.
- Read the repository instructions and the surrounding code before judging the
  diff. Before analyzing, list every instruction, rule, or guide file that the
  repository's agent instructions route this kind of change to, and read each
  one completely. A required file that was skipped or partly read makes the
  review incomplete; read it before delivering, never after.
- Establish the exact base and head. Re-fetch the live pull request, head and
  base SHAs, diff, checks, and merge state on every review and re-review. Never
  infer the target from the checked-out branch.
- Use evidence from code, tests, checks, requirements, and discussion. Do not
  invent findings to fill a category.
- Run focused, inexpensive checks only when they validate the exact reviewed
  head without disturbing the user's checkout. Do not run end-to-end, browser,
  database-backed integration, infrastructure synthesis, or full-suite runs
  without the user's consent.

## Establish the review context

### Pull request link

When the user provides a pull request link, inspect the live pull request with
the available authenticated provider tools or CLI.

1. Read the title, description, base and head branches and SHAs, changed files,
   commits, checks, merge state, review decisions, top-level comments, reviews,
   and inline threads. Include resolved threads when they contain requirements
   or explain an implementation decision.
2. Resolve the requirements source in this order: an issue URL the user
   supplied; the pull request's linked closing issues; clearly linked work items
   in the title, description, commits, and discussion. Do not treat an
   incidental number, branch name, or similar title as a requirement.
3. For each linked issue or ticket, read its title, description, acceptance
   criteria, original reproduction steps, full accessible comment thread, and
   any linked document needed to understand the expected behavior.
4. Build the expected-behavior checklist. Without linked work items, use the
   pull request title, description, comments, reviews, and repository
   documentation, and say in the review that these were the requirements source.
5. Call out conflicting or ambiguous requirements instead of silently choosing
   one interpretation. Treat a clearly stated later clarification as an update.
6. Review the provider's current pull request diff or the equivalent
   merge-base-to-head diff. Before finishing, confirm that the head SHA has not
   changed.

If some context is inaccessible, state exactly what could not be read and
continue only as far as the available evidence allows.

### Local changes, commits, or branches

Resolve the requested scope and its comparison point. Use the repository's
merge base when reviewing a branch. If several bases are plausible and would
materially change the result, ask rather than guessing.

Read any supplied specification, task, issue, or acceptance criteria and turn
it into the same expected-behavior checklist used for pull requests.

## Merge conflicts and base freshness

Check this on every pull request review and re-review, using live data.

- Query the pull request's mergeability, merge state, base branch, and how many
  commits the head is behind the base tip (for GitHub, `gh pr view` with
  `mergeable`, `mergeStateStatus`, `baseRefName`, `headRefOid`, and
  `baseRefOid`, plus the compare API). If the state is unknown, query once more
  after a short wait before reporting it as unverified.
- When the pull request conflicts, report a `HIGH` Task finding titled with the
  conflict. Name each conflicting file when it can be found read-only, such as
  with `git merge-tree --write-tree` on fetched refs; otherwise say the files
  could not be listed. Explain that it cannot merge and that the reviewed diff
  may change once conflicts are resolved. Recommend `sync-branch` followed by a
  re-review.
- When it merges cleanly but is behind, check whether base commits since the
  merge base touch the same files, migrations, specifications, generated
  contracts such as API specs, or runtime callers the change depends on. Report
  only a concrete semantic conflict, such as a duplicate migration number or a
  changed signature the change still calls, sized by impact. Otherwise note
  "behind base, no overlapping changes found" in the merge status line.
- A conflict does not end the review. Continue reviewing the current head.

## Review method

1. **Map intent to code.** For every requirement, identify the implementing
   code and meaningful test evidence. A missing required behavior is a finding
   even when the existing code is internally consistent.
2. **Trace the changed flow.** Follow each changed public entry point through
   same-module helpers and one level into changed cross-file callees. Inspect
   relevant callers, including unchanged ones the change can affect, and
   sibling paths that share the same contract. Trace success, failure, retry,
   authorization, data-boundary, and deployment paths where relevant.
3. **Inspect risk.** Check correctness first, then security and trust
   boundaries, sensitive-data exposure, resource and error handling,
   concurrency, performance, compatibility, tests, documentation, and
   accessibility where relevant. Use [references/checklist.md](references/checklist.md).
4. **Check code health.** Apply every category in
   [references/code-health.md](references/code-health.md), including
   unnecessary complexity, to every change.
5. **Check regression coverage.** For every fix or behavior change, apply
   [references/test-quality.md](references/test-quality.md).
6. **Verify.** Use current checks and run focused tests within the consent rules
   above. Skipped, pending, or unrun tests are not evidence; green CI alone does
   not prove runtime behavior.
7. **Filter.** Apply the evidence gates in
   [references/review-power.md](references/review-power.md) before reporting.

### Full-change coverage gate

Apply this on every review, including after fixes. A re-review starts from the
complete current base-to-head diff and requirements, not the latest patch.

- Map every changed file or coherent file group and each requirement to the
  affected behavior, runtime callers, and verification.
- Recheck earlier findings and user-supplied concerns against the current head.
  Do not assume a proposed fix works or that a previous finding still applies.
- Before reporting, reconcile the map with the complete changed-file list and
  all requirements. State material checks that could not be performed.

## Finding bar

Report only actionable defects or code health problems introduced by the
change, or required behavior it omitted. Merge-conflict findings are the
exception, even when newer base commits caused them. Every finding needs:

- a concrete trigger or unmet requirement;
- the resulting wrong behavior or concrete maintenance, testing, or
  operational cost;
- precise file and line evidence;
- the smallest practical correction.

Use these severities, based on demonstrated impact rather than the section a
finding sits in:

- `CRITICAL`: security exposure, data loss or corruption, or an outage that
  must be fixed before merge.
- `HIGH`: crash, broken build, merge conflict, missing required behavior, or a
  side effect that breaks another feature.
- `MEDIUM`: reachable correctness, performance, compatibility, test, or
  maintainability problem that should be fixed before release.
- `LOW`: small but real improvement. Omit formatter output, pure preference,
  and rename-only suggestions.

For security findings, name the trust boundary and realistic attack path. Use
sanitized examples without reproducing secrets or personal data. Empty catches
and production fallbacks to mocks or stubs are at least `HIGH` when they hide
failure or return a false success.

### Rollout severity

Establish impact relative to existing behavior before assigning severity. A
rollout window that safely keeps the old behavior but delays the new one is not
by itself a regression, unless an explicit requirement demands immediate
activation. Report an inaccurate design statement separately from runtime
impact. Treat old and new versions running together during deployment as
blocking only when that weakens security, loses or corrupts data, makes
supported functionality unavailable, or needs manual repair.

### Never findings

Pull request metadata and ticket bookkeeping are not code defects. Never report
these, at any severity, in findings, gaps, notes, or follow-up suggestions:

- The pull request title, its prefix, wording, or format, or commit-message
  format.
- Issue linking or closing: that merging will close a linked issue, closing
  keywords, linked-issue state, or whether a follow-up ticket exists.
- Scope the change openly defers.

Use linked issues only as the requirements source. Report an unbuilt
requirement only when the change claims to deliver it or the omission breaks
something the change touches, and describe the missing behavior and its user
impact, never the issue's open or closed state.

## Output

Follow [references/output-format.md](references/output-format.md) exactly,
including its writing style. Keep confirmed findings separate from
verification gaps.
