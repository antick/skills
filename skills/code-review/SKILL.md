---
name: code-review
description: Evidence-based, read-only review of local changes, commits, branches, or pull request links for correctness, risk, and unnecessary complexity. For pull requests, review the live diff against linked issues or tickets and their discussions; when none exist, use the pull request description and conversation as the intended behavior.
---

# Code Review

Find confirmed problems in the exact change under review. Prefer a few strong,
actionable findings over a long list of possibilities.

## Contract

- Review only. Do not edit code, post comments, approve, merge, or otherwise
  change external state unless the user separately asks.
- Read the repository instructions and the surrounding code before judging the
  diff.
- Establish the exact base and head. Do not review an assumed or stale diff.
- Use evidence from code, tests, checks, requirements, and discussion. Do not
  invent findings to fill a category.
- Apply only the checks relevant to the repository's language, architecture,
  trust boundaries, and risk.
- Report findings first, ordered by severity. If there are none, say so and
  list any evidence gaps or residual risk.

## Establish the review context

### Pull request link

When the user provides a pull request link, inspect the live pull request with
the available authenticated provider tools or CLI.

1. Read the title, description, base and head branches and SHAs, changed files,
   commits, checks, merge state, review decisions, top-level comments, reviews,
   and inline threads. Include resolved threads when they contain requirements
   or explain an implementation decision.
2. Find every clearly linked work item. Check provider link metadata, closing
   keywords, and unambiguous issue or ticket URLs or IDs in the pull request
   title, description, commits, and discussion. Do not treat an incidental
   number or unrelated mention as a requirement.
3. For each linked issue or ticket, read its title, description, acceptance
   criteria, full accessible comment thread, and any linked document or
   attachment needed to understand the expected behavior.
4. Build the expected-behavior checklist:
   - With linked work items: use their requirements and discussion together
     with the pull request description and discussion.
   - Without linked work items: use the pull request title, description,
     comments, reviews, and repository documentation.
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

## Review method

1. **Map intent to code.** For every requirement, identify the implementing
   code and meaningful test evidence. A missing required behavior is a finding
   even when the existing code is internally consistent.
2. **Trace the changed flow.** Follow each changed public entry point through
   same-module helpers and one level into changed cross-file callees. Inspect
   relevant callers and sibling paths that share the same contract. Review the
   executed chain, not helper names.
3. **Inspect risk.** Check correctness first, then security and trust
   boundaries, resource and error handling, concurrency, performance,
   maintainability, compatibility, tests, documentation, and accessibility
   where relevant. Use [references/checklist.md](references/checklist.md).
4. **Challenge added complexity.** Search for an existing equivalent before
   accepting a new helper, abstraction, dependency, configuration option, or
   subsystem. Look for code that can be deleted, reused, replaced by the
   standard library or a native platform feature, expressed directly, or
   removed because it serves only a hypothetical future need. Keep validation,
   security, accessibility, data-loss protection, and useful regression tests.
   Report a simplification only when the concrete replacement preserves the
   required behavior.
5. **Verify.** Use current checks and run relevant tests when the source and
   environment are available. Map important requirements to named passing
   tests; skipped or pending tests are not evidence.
6. **Filter.** Apply the evidence gates in
   [references/review-power.md](references/review-power.md) before reporting.

## Finding bar

Every finding must include:

- a concrete trigger or unmet requirement;
- the resulting wrong behavior or meaningful risk;
- precise file and line evidence;
- the smallest practical correction.

Use these severities:

- `[BLOCKER]`: security exposure, data loss, crash, broken build, explicit
  required behavior missing, or another issue that must be fixed before merge.
- `[MAJOR]`: reachable correctness, performance, compatibility, test, or
  maintainability problem that should be fixed before release.
- `[NIT]`: small but real improvement. Omit formatter output, pure preference,
  and rename-only suggestions.

For security findings, name the trust boundary and realistic attack path. For
dead or duplicate code claims, include the search evidence. Empty catches and
production fallbacks to mocks or stubs are blockers when they hide failure or
return a false success.

Use [references/output-format.md](references/output-format.md) for the final
report. Keep confirmed findings separate from unverified gaps.
