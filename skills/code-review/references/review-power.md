# Evidence gates and flow tracing

Use this before emitting findings.

## Trace the executed flow

For each changed public method, exported function, handler, job, or command:

1. Inline the behavior of same-module private helpers, including nearby private
   files in the same package.
2. Follow changed cross-file callees one level deeper.
3. Treat standard-library, third-party, and untouched external modules as
   leaves unless their contract is the suspected source of the problem.
4. Record validations, mutations, external calls, resource acquisition and
   release, errors, and unsafe access to external input.

Inspect relevant callers when a signature or contract changes. Compare sibling
paths only when they have the same data shape, lifecycle, trust boundary, and
caller expectations.

## Evidence gates

Keep a finding only when it passes all applicable gates:

1. **Reachable:** Name the real input, state, or requirement that triggers it.
2. **Wrong:** State the observable failure or concrete maintenance cost.
3. **Scoped:** Tie it to the reviewed diff or to behavior the diff was required
   to implement.
4. **Supported:** Cite exact code, requirement, discussion, check, or test
   evidence. Claims such as dead code or duplication require search results.
5. **Proportionate:** Match severity to impact, not reviewer preference.

An explicit unmet acceptance criterion does not need a runtime reproduction;
the missing implementation or meaningful test is the evidence.

## Acceptance evidence

Build a small mapping from each important requirement to implementation and
test evidence. A requirement is uncovered when its only test is skipped,
pending, unrelated, or limited to a happy path that cannot exercise the stated
boundary or failure behavior.

Fresh tests and checks prove only what they exercise. Keep code and CI proof
separate from browser, deployed-environment, database, migration, and product
acceptance proof.

## Common high-value checks

- A validation helper exists but the changed entry point never calls it.
- A resource is released on success but leaks on an exception or early return.
- A broad catch hides failure or returns a successful result.
- A lookup or query inside a loop creates avoidable N+1 work.
- A new symbol duplicates an existing implementation or has no caller.
- User-controlled text crosses into SQL, a shell, HTML, a path, a system
  prompt, or another privileged interpreter without the correct boundary.
- A production path silently falls back to a mock, stub, or sample result.

Drop theoretical future concerns, style-only comments, formatter findings,
generic best-practice advice, and suggestions without a named benefit.
