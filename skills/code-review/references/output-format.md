# Review output

## Writing style

Write every part of the review so a developer who has not read the changed code
understands it on the first read, as a teammate explaining the problem would.

- Give each finding a title that names the concrete problem.
- Use plain words and short sentences. Say what goes wrong, when it happens,
  and who is affected, then give the technical cause.
- Keep the technical detail needed to find and fix the problem: file and line,
  the function, field, or check involved, and the input or condition that
  triggers it. Leave out detail that helps with neither.
- Explain an acronym or piece of jargon the first time it appears. Do not chain
  implementation names together in place of an explanation.
- No filler. Do not restate the title in the Issue, and drop openers such as
  "It is worth noting", "It appears that", or "This ensures that". Do not stack
  hedges; state what was verified and mark what was not.
- Use a short example when the failure is hard to picture. Keep each claim and
  severity tied to the behavior you showed.

## Layout

For a pull request, open with a one-line **Merge status**: mergeable,
conflicting, or unknown, and how many commits the head is behind its base. For
local changes, open with one line naming the reviewed scope. Then use these
sections in this order:

1. `## Task findings`: whether the change does what its requirements ask, and
   does it safely. This covers missing or wrong required behavior, security and
   sensitive-data defects, data, rollout, and mixed-version problems in the
   changed flow, and merge-conflict findings.
2. `## Code health`: always all five headings, in this order:
   `### Code smells`, `### Coverage gaps`, `### Dead code`,
   `### Over-engineering`, `### Side effects`.
3. `## Verification gaps`: anything important you could not check.
4. `## Regression coverage`: which test protects each changed behavior.

Write only `None found.` under any section or Code health heading without
findings. Do not add a summary of what the change does, praise, or a list of
what you checked or which files you loaded. When no issue is linked, say in one
line under the merge status that the review used the description and
discussion as its requirements source.

Place each finding once. Security and sensitive-data defects, merge conflicts,
and rollout or mixed-version problems in the required flow always go under Task
findings. Side effects covers behavior outside the requirements. Otherwise use
the Code health heading that fits; use Task findings when none does.

Within each section or heading, order findings `CRITICAL`, `HIGH`, `MEDIUM`,
then `LOW`. Number every finding in one continuous sequence across the whole
review, in the order they appear: the first Task finding is 1, and numbering
carries on through each Code health heading without restarting. For example,
two Task findings are 1 and 2, a Code smell is 3, a Coverage gap is 4, and a
Dead code finding is 5.
Skip no numbers, and do not number `None found.` lines, Verification gaps, or
Regression coverage. On a re-review, number the new review from 1 again. Use
this block:

```markdown
### 1. [SEVERITY] Short title

**Location:** `path/to/file.ts:42`

**Issue:** What is wrong, with concrete evidence.

**Impact:** What can break or why it matters.

**Solution:** The smallest correct remediation.
```

Under a Code health heading, use `####` for the finding title instead of `###`,
keeping the number, such as `#### 3. [MEDIUM] Short title`.
Bold every label and keep a blank line between labels; Markdown merges adjacent
lines into one paragraph. Before sending, check that each finding has all four
bold labels on separate paragraphs.

Use an exact changed-file line whenever possible. For a repository-wide or CI
finding, name the relevant check or contract instead of inventing a line.

## Gaps and coverage

Keep Verification gaps and Regression coverage to one short line per item. For
a gap, say what was not checked and, when it is not obvious, why it matters.
For coverage, name the behavior in plain words, then the test file that
protects it with `passes`, `not run`, or `no test`. Point to a Coverage gaps
finding by its number instead of repeating it. Leave out commit SHAs, CI run IDs, and
explanations of why a check is impossible unless the reader needs them to act.
Do not claim that tests guarantee no future defects.

```markdown
## Verification gaps

- CI has not run on the latest commit. The previous run passed.
- Pasting a number was not tried in a real browser.

## Regression coverage

- Autofill keeps every digit: `PhoneInput.test.tsx` (passes).
- Pasting a number with a country code: no test (see finding 4).
```

If there are no actionable findings, Task findings and every Code health
heading say `None found.`; Verification gaps and Regression coverage still list
their items.
