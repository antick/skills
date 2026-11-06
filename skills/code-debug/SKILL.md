---
name: code-debug
description: Investigate a bug without changing code and report the root cause, evidence, recommended fix, and the regression test that would catch it. Use for debug-only, diagnosis, or root-cause analysis requests; implementing the fix uses code-build.
---

# Code Debug

Find out why something fails and report it. Do not implement the fix.

## Boundaries

- Read-only. Do not edit source, tests, configuration, or data; do not add
  instrumentation, restart services, deploy, or change issues and pull requests.
  The only exception is a browser action the user approves for reproduction
  (see step 5).
- Local temporary diagnostics, such as a scratch script or a focused run of an
  existing test, are allowed when they are safe. Use synthetic data, do not
  commit them, and remove them afterwards.
- Do not switch branches or overwrite local work. Use a separate worktree when
  another revision must be inspected.
- Follow the repository instructions for expensive checks, such as end-to-end,
  browser, database-backed, or full-suite runs.

## Investigate

1. **Establish the failure.** Read the supplied issue and relevant discussion, or
   use the symptoms from chat. Record expected versus actual behavior,
   reproduction steps, affected environment, approximate time and timezone, and
   scope. Ask only for missing facts that change the investigation, and keep
   inspecting code while waiting.
2. **Trace the code path.** Follow the failure through callers, UI state, API or
   service logic, persistence, configuration, and background work as relevant.
   Read the relevant history (`git log`, `git blame`) to find when the behavior
   changed and why.
3. **Match the revision.** Distinguish the checked-out code from the deployed
   version. Identify the deployed revision when possible before blaming a live
   failure on the current source.
4. **Use runtime evidence when it helps.** When deployed logs or metrics would
   explain or separate possible causes and read access is already configured,
   read them read-only. Do not set up access, sign in, or change permissions to
   get them; report the gap instead. Bound each query to the incident time window
   and a finite result count. Emit only safe fields such as timestamps, error
   codes, and stack locations; never print message bodies, payloads, personal
   data, tokens, or query strings. Empty or truncated results do not prove the
   problem never happened. A nearby error is not proof of cause.
5. **Use a browser only when needed.** When reproducing the failure needs a
   browser, use the `use-chrome` skill. The read-only rule applies there too:
   reproduce with read-only steps. When reproducing the failure needs an action
   that changes data, such as submitting a form, saving, deleting, or
   purchasing, stop and ask the user for permission first, in every
   environment, including staging with synthetic data. Name the exact action, the environment,
   and what it will change, and wait for a yes before doing it.
6. **Test competing explanations.** Check each plausible cause against the code,
   existing tests, history, and runtime evidence. Run focused existing checks
   when useful. Keep going until one cause explains every observation or the
   remaining uncertainty is clear.

## Report

Start with the observed symptom and its affected scope, then:

- **Root cause:** the trigger and the chain of events that produces the failure,
  marked `confirmed`, `likely`, or `unresolved` according to the evidence.
- **Evidence:** file and line locations, inspected or executed tests, and
  sanitized log observations with their environment and time window. Separate
  observations from hypotheses and note contrary evidence.
- **Recommended fix:** the smallest complete correction and the affected areas,
  plus a behavioral regression test that fails with the original defect and
  passes with the fix. Reuse existing coverage when it is sufficient; do not
  propose tests that search source text or only assert that removed code is gone.
- **Gaps:** runtime evidence not checked, unavailable logs or deployed revision,
  checks not run, and the next evidence needed when the cause is uncertain.

Do not claim a fix was made. Implementing it requires a request to fix the issue,
which then follows the `code-build` skill.
