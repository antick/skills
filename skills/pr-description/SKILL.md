---
name: pr-description
description: Draft or revise pull request titles and descriptions in plain, everyday language that still carries the technical details reviewers need, using a scannable Summary, Implementation Details, Validation, and Notes format. Use whenever preparing a new pull request or editing its title or body, including during another workflow. Does not perform a code review.
---

# PR Description

## Read the final scope

Use the intended base-to-head diff, the verified linked issue, and the available
verification results. For an existing pull request, read its current title, body,
and relevant discussion first. Keep user corrections and useful review context.
Describe the final implementation; drop stale plans, superseded results, and
abandoned approaches unless they explain a current tradeoff.

Follow the repository's pull request template and title convention when one
exists. Do not add agent branding or change team rules to apply this skill.

## Write so anyone on the team can follow it

Write for a teammate who has not seen the code, including someone outside the
specialty, while keeping what a reviewer needs to locate and judge the change.

- Lead with the problem and the result in everyday words: what was wrong or
  missing, who noticed it, and what happens now.
- Use short sentences and common words. Explain a term, acronym, or component name
  the first time it appears, in a few plain words.
- Keep the technical detail that helps someone review or verify the change:
  affected paths, endpoints, components, or data, the behavior before and after,
  and the checks that prove it. Put it after the plain explanation, not instead
  of it.
- No filler. Drop openers such as "This PR aims to" or "It is worth noting", and
  vague claims such as "improves performance" without saying what changed.
- Use a short concrete example when the behavior is hard to picture.

## Reviewer-relevant substance

Before drafting, identify what a reviewer must check. The body should answer what
changed, why this approach, where to look, which behavior must stay the same, and
how it was verified.

- Explain the root cause or previous behavior and how the change fixes it.
- Under Implementation Details, name the affected code path and the meaningful
  before and after behavior. Mention ordering, limits, fallbacks, authorization,
  transactions, API or schema changes, or compatibility only when affected.
- Keep important invariants and tradeoffs visible. Point to exact paths or symbols
  when they help; do not dump a file list.
- Under Validation, connect each check to the behavior it proves. Separate
  completed checks from pending or unrun ones. A passing suite name alone is not
  enough.
- Keep real limitations visible, but separate confirmed problems from unproven
  observations. Never invent results, risks, deployment status, or readiness.

## Title and body

Give the title separately from the body; it is the hosting provider's title
field, not a heading inside the body. Follow the repository's title convention.
When there is none, use a Conventional Commit style prefix such as `feat:`,
`fix:`, or `docs:` followed by a short plain description. Include a verified
ticket number only when one exists; never invent one or publish a placeholder.

Use these body sections in order:

1. `## Summary/Overview`: the problem, the outcome, and who it affects.
2. `## Implementation Details`: what to review, the technical changes, preserved
   behavior, and tradeoffs.
3. `## Validation`: checks performed and their results, including important
   failed, blocked, or unrun checks.
4. `## Notes`: only when there are meaningful remaining limits, follow-ups, or
   reviewer notes. Format its bullets as blockquotes using `>`.

Separate sections with a standalone `---`, with blank lines around it. Do not add
a horizontal line after the final section.

Every section uses unordered parent bullets that contain only a short **bold
phrase**. Put the explanation on the following lines as two-space-indented `- `
sub-points, one idea each. Make the bold phrases readable on their own, so someone
scanning only bold text understands the main points. In Notes, prefix every line
with `>` and keep the same indentation. Use only this one level of nesting; avoid
numbered steps, bare prose paragraphs, tables, and decorative labels by default.

Use as few bullets as the content needs. Link a verified issue in an appropriate
bullet. Use a closing keyword such as `Closes #123` only when this pull request
actually resolves that issue. If validation was not run, say so. Omit Notes when
nothing material belongs there.

This abstract shape is a format reference, not content to copy:

```markdown
## Summary/Overview

- **Main outcome**
  - What was wrong, in everyday words.
  - What happens now.

---

## Implementation Details

- **Meaningful change**
  - The affected code path and the technical change.
  - Why this fixes the problem and which behavior stays the same.

---

## Validation

- **Verified result**
  - The check performed and the relevant environment or inputs.
  - What it proves, and any gap.

---

## Notes

> - **Remaining limitation**
>   - The constraint that still applies.
>   - The follow-up, when known.
```

## Scope and output

This skill controls wording. It does not authorize creating a pull request,
publishing edits, pushing, merging, or running tests. A request to create or
update a pull request already authorizes that action; do not ask again because
this skill is used. A draft-only request stays draft-only.

For a draft, return the title separately and the complete body in a copyable
Markdown block. For an authorized creation or update, apply this format and verify
the saved title and body. Pass the body with structured tool arguments or a UTF-8
temporary file with real newlines (`--body-file` for `gh`); do not interpolate it
into shell code.
