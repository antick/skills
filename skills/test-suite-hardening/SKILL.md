---
name: test-suite-hardening
description: Strengthen a test suite against false confidence, flaky failures, and missing behavior coverage, and prove a bug fix or feature with tests that would catch its regression. Use for weak assertions, excessive mocking, test isolation, unreliable CI tests, critical-flow coverage gaps, or writing the tests for a change.
---

# Test Suite Hardening

Improve the suite's ability to catch meaningful regressions and explain failures.
Do not chase a coverage number or rewrite working tests for stylistic consistency.

## Prove a change

When the task is writing or checking the tests for a specific fix or feature:

1. Read the repository's testing guidance. Replay the original ticket steps or
   user journey in the cheapest test that actually exercises those steps. Do not
   substitute an unrelated route, planted state that skips the steps under
   test, or an assertion against implementation source text.
2. Show that the test fails for the original defect and passes with the fix.
   When that cannot be executed, identify the failing condition by inspection
   and say the evidence is inspected, not executed.
3. Finish the implementation and focused lint, type, and unit checks for the
   affected packages before any end-to-end, browser, database-backed,
   infrastructure synthesis, or full-suite run. Do not ask about expensive runs
   at task start.
4. Add or update an end-to-end test only when a user journey actually changed or
   the ticket's original steps are that journey. Reuse an existing journey test
   when it already covers the path. Copy, token, styling, or layout-only work
   does not need a new end-to-end file.
5. After the rest of the work is done, ask at most once to run an expensive
   suite, and only when it matters for the result. A request to prepare a pull
   request for merge or release already counts as consent. If declined, report
   the suite as unrun.

## Reject bogus tests

Whether proving a change or hardening a suite, do not write or keep these as
coverage:

- tests that cannot fail, such as tautologies or assertions on values the test
  itself set;
- hardcoded expected results that never run production behavior;
- mocks that replace the logic under test (mocking external boundaries is fine
  when the affected behavior still runs);
- substring, regular-expression, count, or ordering checks against raw
  implementation source;
- tests whose only job is proving a removed file, function, export, or caller
  no longer exists;
- redundant cases that repeat the same setup, boundary, and assertion;
- expectations weakened or deleted just to make a change pass.

Tests of rendered user-visible text, actual responses, or parsed or generated
contracts are valid when they protect a real requirement. Keep meaningful
negative tests, such as denied access or preventing duplicate delivery.

## Diagnose the suite

Read instructions, test commands/configuration, fixtures, CI jobs, and recent
failure evidence. Inspect setup/teardown before running tests that could touch
databases, accounts, or external systems. Use disposable data and the project's
existing isolation mechanisms. Record baseline failures and durations.

Map important behaviors to tests: permissions, data writes, user journeys, error
recovery, migrations, and platform boundaries. Identify assertions that cannot
fail, skipped tests, blanket snapshots, swallowed promise rejections, mocks that
replace the behavior under test, and tests omitted from the real CI command.
Missing coverage is a risk hypothesis until tied to a specific behavior.

## Reproduce before changing

For flakes, preserve the failing seed, order, worker count, timezone, runtime, and
logs. Repeat a bounded targeted run and compare isolated versus combined execution.
Investigate shared mutable fixtures, time, randomness, open handles, network,
ports, async cleanup, and eventual consistency. Do not increase retries or timeouts
until the underlying waiting contract and observed timing justify it.

For weak tests, demonstrate that an intentional representative regression escapes
the current assertion in a temporary copy or reversible local mutation. Restore
production code immediately afterward. Use existing mutation tooling if suitable;
do not install a large toolchain just to produce a score.

## Strengthen at the right layer

1. Assert observable results and side effects, including absence of forbidden
   effects. A denied request must not write data, not merely return an error.
2. Mock external boundaries where needed, while exercising the actual business
   logic. Add contract/integration tests where mock assumptions hide incompatibility.
3. Replace arbitrary sleeps with bounded waits for observable conditions. Control
   clocks and randomness when deterministic behavior is the contract; retain real
   timing tests where timing itself matters.
4. Isolate resources per test/worker, clean up on failures, and restore modified
   environment/global state. Do not serialize the whole suite to hide a race.
5. Cover reachable edge cases and failures around the highest-risk paths. Use
   accessible UI queries and user actions rather than private component structure.
6. Remove redundant tests only after checking their distinct contracts. Quarantine
   requires a reason, owner, and exit condition; it is unresolved work, not a fix.

Preserve legitimate product behavior. Separate production bug fixes from test-only
changes and show the regression failing before the fix, or, when that cannot be
executed, identify the failing condition by inspection. New infrastructure should
fit the request and existing stack; state any missing environment instead of
silently substituting mocks for required integration evidence.

## Verify and report

Run focused tests, a bounded repeat for prior flakes, and, within the consent rule
in **Prove a change**, the complete available suite under the relevant CI
conditions. Check the meaningful regression now fails when reintroduced and passes
with the correct implementation, or label that evidence as inspected when it
cannot be executed. Report behaviors
protected, root causes fixed, before/after evidence, remaining quarantines,
runtime cost, and integration/device checks not run. A passing repeat does not
prove a probabilistic failure can never recur.
