---
name: test-suite-hardening
description: Strengthen an existing test suite against false confidence, flaky failures, and missing behavior coverage. Use for weak assertions, excessive mocking, test isolation, unreliable CI tests, or critical-flow coverage gaps.
---

# Test Suite Hardening

Improve the suite's ability to catch meaningful regressions and explain failures.
Do not chase a coverage number or rewrite working tests for stylistic consistency.

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
changes and show the regression failing before the fix. New infrastructure should
fit the request and existing stack; state any missing environment instead of
silently substituting mocks for required integration evidence.

## Verify and report

Run focused tests, a bounded repeat for prior flakes, and the complete available
suite under the relevant CI conditions. Check the meaningful regression now fails
when reintroduced and passes with the correct implementation. Report behaviors
protected, root causes fixed, before/after evidence, remaining quarantines,
runtime cost, and integration/device checks not run. A passing repeat does not
prove a probabilistic failure can never recur.
