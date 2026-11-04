---
name: create-issue
description: Create or refine GitHub issues through the gh CLI, following the repository's current issue conventions, checking for duplicates, and verifying the saved result. Use when the user asks to create, file, draft, or improve a GitHub issue.
---

# Create Issue

## Boundaries

- Draft, preview, review, and refinement requests stay read-only unless the user
  explicitly asks to create or update the issue on GitHub.
- Set labels or an issue type when the user asks for them or comparable recent
  issues show one clear convention. Set assignees, milestones, parents, or
  project fields only when the user asks for them. There is no default assignee
  or project.
- Keep secrets, credentials, private environment details, personal data, and
  unnecessary personal information out of issues. Ask before publishing content
  you are unsure about.

## GitHub access: use gh

- Use `gh issue`, `gh search issues`, `gh project`, and `gh api` for searches,
  reads, creation, edits, comments, and verification. Use `gh api graphql` or
  REST through `gh api` when a dedicated command does not cover an operation.
- Do not open or automate the GitHub web interface, and do not use `--web` or
  `--browser`, unless the user explicitly asks for the browser. A GitHub URL is
  input to `gh`, not an instruction to navigate.
- If a command fails, read the error and `gh <command> --help`, then use the
  supported CLI or API path. Report any access blocker; do not silently fall back
  to the browser or claim success.
- Pass titles and bodies non-interactively. Write multiline bodies to a UTF-8
  temporary file and use `--body-file`; use JSON files with `gh api --input` for
  API writes.

## Preflight

1. Resolve the target repository from the request or the current checkout and
   confirm it with `gh repo view`. Verify authenticated access with
   `gh auth status`.
2. When the user asks for project fields, resolve the exact project, field, and
   option IDs before creating the issue. If the token lacks project access, ask
   the user to run `gh auth refresh -s project`.

## Learn the current convention

Treat GitHub state as live:

1. Search open and closed issues for the same outcome, area, and distinctive
   terms. When a likely duplicate exists, show it and ask before creating another
   issue; offer a comment on the existing issue instead.
2. Read three to five recent issues closest in work type and product area. Prefer
   maintained examples over outliers.
3. Follow their useful title style, terminology, labels, issue types, and body
   structure. Use the repository's issue templates when they exist.

## Write the issue

Use an outcome-focused title and the closest current issue structure. When no
clear convention exists, use:

```markdown
## Description

<Current problem or requested outcome, affected users, and scope>

## Acceptance criteria

- [ ] <Observable outcome>
- [ ] <Important regression or correctness condition>
- [ ] <Relevant verification>
```

Keep the issue implementation-neutral unless a constraint is already decided.
Add reproduction steps, evidence, links, or screenshots only when they clarify the
work, and attach only files the user supplied or authorized. When refining an
existing issue, keep its original content and add clarifications after it unless
the user asks for a rewrite; fetch the current body immediately before editing so
concurrent edits are not overwritten.

## Create and configure

1. Create the issue once with `gh issue create`, passing the repository, final
   title, `--body-file <body-file>`, and only the metadata allowed under
   **Boundaries**.
2. Capture the issue URL. When the user asked for project fields, add the issue
   to the project and set them with the IDs resolved in preflight.
3. If creation returns an uncertain result, search for the exact title before
   retrying. Repair the existing issue when a later metadata step fails; never
   create a duplicate to recover from a partial result.

## Verify and report

Re-read the live issue and verify its title, body, metadata, and state. Report the
clickable issue URL and any requested field that could not be set.
