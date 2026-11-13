# Repository cleanup

Use for an authorized cleanup of unused code, duplicate helpers, unnecessary
wrappers or abstractions, obsolete comments, and tests without distinct value.
For an audit-only request, use `code-audit` and report without editing. Preserve
the main skill's scope, baseline checks, and approval rules for new test tooling.

## Map coverage

Read repository instructions and map the major source directories plus relevant
configuration, scripts, and tests. Inspect every mapped area before finishing a
repository-wide cleanup. Record what was inspected, excluded, or inaccessible.
Do not imply complete coverage when areas remain uninspected.

## Justify each candidate

- Trace imports, callers, public exports, runtime registration, configuration,
  scripts, dynamic references, generated code, and side effects as applicable.
  No text matches is insufficient proof of disuse; account for framework
  discovery and external consumers of public APIs.
- Describe the concrete maintenance cost and the smallest behavior-preserving
  replacement or removal. Similarity, short length, or a single caller alone
  does not make code unnecessary. Preserve intentional provider, platform,
  authorization, and compatibility boundaries.
- Consolidate helpers only when input, output, error, and side-effect contracts
  fit. Prefer an existing owner over a new abstraction that merely relocates code.
- Remove comments only when obsolete or without useful information. Preserve
  explanations of intent, constraints, and non-obvious behavior.
- Before removing a test, name its cases and failure modes and show where
  remaining tests protect each one. Similar assertions, coverage percentages,
  and a passing suite do not establish redundancy. Keep distinct regression
  coverage; do not delete failing tests to make a cleanup pass.

Leave uncertain candidates unchanged and report the missing evidence. Research
official framework behavior when safety depends on it; repository-proven dead
code removal needs no unrelated modernization research or dependency upgrade.

## Apply and verify

Establish the baseline using the main workflow. For affected behavior, identify
existing tests that protect the contracts and failure paths. Reuse adequate
coverage; add meaningful characterization tests before changing behavior-bearing
code when coverage is missing. Follow the main skill's approval rules if new
test infrastructure is needed. Proven unused code and obsolete comment removal
do not need new tests that only assert the deletion.

Make one coherent cleanup at a time and run the affected checks. Preserve public
contracts, side effects, error handling, and meaningful assertions. Keep fixes or
intentional behavior changes separate from cleanup. Do not replace removed
ceremony with a larger speculative abstraction.

Run relevant lint, type, and build checks plus the main skill's final test and
repository-required checks. Compare against the baseline and inspect the final
diff for lost behavior, weakened coverage, and unrelated changes.

## Report

For each cleanup, state what changed, the evidence supporting removal or reuse,
and the tests or checks protecting remaining behavior. Include exact check
results, existing failures, unrun checks, directory coverage, and deferred
candidates. Passing checks reduce risk; they do not prove every removal safe.
