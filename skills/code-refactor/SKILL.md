---
name: code-refactor
description: Use when refactoring or modernizing existing code, replacing legacy patterns with current framework or library features, or improving maintainability or performance while preserving behavior. Applies across stacks, including React.
---

# Code Refactor

Refactor with current official guidance and a tested behavior baseline. Adopt newer
features only when they solve a concrete problem and fit the project's versions.
Passing checks reduce regression risk; they cannot guarantee that nothing breaks.

## 1. Inspect the scope and baseline

Read repository instructions, check Git status, and preserve unrelated changes.
Identify the requested code, callers, public contracts, and observable behavior.
For complex refactors spanning module boundaries or architecture cleanup, read
[architecture migration](references/architecture-migration.md). It adds dependency
mapping, staged cutover, compatibility, and deletion checks to this workflow.
Inspect manifests, lockfiles, runtime, framework, compiler, and relevant configuration
to determine actual installed versions, rather than relying on declared ranges.

Find the existing test runner, tests, fixtures, CI commands, and relevant build,
type-check, and lint checks. Run the available checks before editing. Record existing
failures; investigate those that affect the refactor's safety before proceeding.
Do not hide failures by skipping tests or weakening checks.

## 2. Research current official guidance

Fetch the latest official documentation, release notes, and migration guides for
the frameworks and libraries involved, using available browsing or documentation
tools. Also check documentation for the installed version. Do this for each task;
do not treat remembered API details or a cached skill example as current research.

For each useful candidate, identify:

- The current pattern and its concrete maintenance or performance cost.
- The replacement, official source URL, and date checked.
- Required versions, stability status, runtime/compiler/framework support, and any
  changed semantics or migration costs.
- Whether it is usable now, requires a separate upgrade, or should be rejected.

Prefer stable, supported APIs. Newness alone does not justify a replacement.
Dependency upgrades and experimental APIs require explicit user authorization;
a refactor request alone does not authorize either. Keep compatible work moving
and report upgrade-dependent opportunities separately.

If current official sources cannot be accessed, disclose the gap. Continue only
with changes justified by verifiable installed-version documentation or source;
defer recommendations that depend on unverified newer features.

For React, start with [versions](https://react.dev/versions), the applicable API
references, and release/upgrade guides. Inspect effects, derived state, component
boundaries, and data flow. Consider newer hooks, form APIs, or compiler support only
where the documented prerequisites and behavior fit the app. Do not assume compiler
optimization is enabled or remove memoization solely because a newer React exists.

## 3. Establish regression protection before refactoring

Suggest specific tests for the behavior at risk, then follow this decision:

| Project state | Action |
| --- | --- |
| A runnable test suite exists | Reuse it and write or update meaningful regression tests before changing production code. No separate approval is needed for tests within that setup. |
| Tests exist elsewhere but the affected code is uncovered | Add coverage using the existing setup; unrelated green tests are insufficient. |
| No tests exist, or the setup is only a placeholder | Propose a minimal suite and request explicit approval before creating test files, installing test dependencies, configuring the suite, or refactoring production code. |
| Existing tools cannot test the affected behavior | Explain the gap and request approval for additional test infrastructure before the dependent refactor. |

An approval request must name the proposed tools, files/configuration changes,
critical cases, and commands. Continue read-only inspection and research while
waiting. A general instruction to refactor is not approval to introduce a suite.
If approval is declined or unanswered, provide findings and a plan; leave the
unprotected production changes unapplied. Honor explicit suite approval already
given in the conversation.

For an existing or approved suite, write characterization tests that pass against
the original implementation. Cover observable contracts, important edge cases,
errors, and affected integrations. For UI changes, include interactions, state
transitions, async success/failure, and cleanup or accessibility where relevant.
A snapshot or coverage percentage alone does not establish protection. Avoid tests
that only assert private structure, hook choices, or mocked implementation details.

Do not defer these tests until after the refactor to save time. Separate intentional
bug fixes or behavior changes from characterization; do not freeze a known bug as
the desired contract. If relevant baseline failures remain unexplained, defer the
dependent refactor and report the blocker.

## 4. Refactor in small verified steps

Briefly explain selected changes, their source-backed benefit, and the tests that
protect them. Preserve public APIs, UI behavior, data formats, side effects, and
error handling unless the user requested a change.

Apply one coherent change at a time and run affected tests after each step. Reuse
project conventions and avoid unrelated rewrites. Inspect codemod output before
accepting it. Do not weaken assertions or update snapshots blindly to make changes
pass. Claim runtime, memory, bundle-size, or rendering improvements only after a
repeatable before/after measurement; otherwise label the benefit as expected.

Example: when a React component stores a filtered list in state and updates it in
an effect, check [the official effect guidance](https://react.dev/learn/you-might-not-need-an-effect).
If the list is purely derived, first test filtering, empty results, and updates to
the source data and query. Then derive it during rendering and rerun those tests.
Check whether removing the intermediate state changes any observable timing.
Keep effects that synchronize with an external system.

## 5. Verify and report

Run the complete existing test suite plus relevant type-check, lint, build, and
repository-required checks. Exercise affected UI or integration flows when possible.
Compare results with the baseline, fix introduced regressions, and inspect the
final diff for scope drift, lost behavior, and weakened tests.

Report changes and rationale, official source links and versions checked, tests
added or updated, exact verification commands and results, and deferred candidates.
Disclose existing failures, unavailable checks, and untested behavior. Never promise
that passing tests prove a refactor cannot break anything.
