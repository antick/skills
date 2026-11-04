# Regression coverage and test quality

On every review and re-review, read the repository's testing guidance when it
exists. Verify that the change addresses the original requirement and that
meaningful tests would catch its recurrence. Green CI, test counts, or coverage
percentages alone are not proof.

- Trace the original reported failure, reproduction steps, preconditions, and
  expected outcome through the changed production path. Map each fix or changed
  behavior to the specific test and assertion that protects it. Include relevant
  edge and error conditions; an unrelated happy path does not cover the ticket.
- Check that the test exercises the real logic responsible for the defect and
  asserts an observable result or a parsed or generated structured contract. For
  a bug fix, establish why the assertion would fail for the original defect and
  pass with the fix. Prefer executed before-and-after evidence when available
  and permitted; otherwise identify the failing condition by inspection and
  label that evidence as inspected, not executed. Do not modify the checkout to
  recreate a bug.
- Reject bogus evidence: tautologies, hardcoded expected results that never
  exercise production behavior, mocks that replace the very logic being tested,
  assertions too weak to detect the bug, skipped or unreachable tests presented
  as coverage, and expectations weakened just to make a change pass. Mocking
  external dependencies is valid when the affected behavior still executes.
- Reject substring, regular-expression, count, or ordering checks against raw
  implementation source offered as regression coverage. Tests of rendered
  user-visible text, actual responses, or parsed or generated contracts are
  valid when they protect a real requirement.
- Reuse or extend existing tests when they already cover the behavior. Flag
  redundant cases that repeat the same setup, boundary, and assertion with no
  distinct failure mode. Do not demand a new file or duplicate test for every
  ticket; tests at different boundaries are justified when they catch different
  regressions.
- Do not accept tests whose only purpose is proving removed files, functions,
  exports, or callers no longer exist, including renamed inventories of those
  symbols. Recommend deleting obsolete assertions and testing the active
  replacement behavior. Keep meaningful negative behavior tests, such as denied
  access or preventing duplicate delivery; those protect an observable contract.

Report a confirmed missing or ineffective regression test under **Coverage
gaps**: name the failure it leaves unprotected, cite the code and test, and
propose the smallest useful test or correction. Report redundant tests under
**Code smells** and tests of removed names under **Dead code**. Base severity
on the unprotected behavior. An unrun but otherwise meaningful test is a
verification gap, not proof the test is missing or defective.
