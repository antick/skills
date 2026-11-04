---
name: antick
description: List Antick skills by area with one-line descriptions and installed status, or recommend which Antick skill fits a task. Use when the user asks what Antick skills exist, which are installed, or which skill to use for something.
---

# Antick

Show the Antick skill catalogue in chat, or route a task to the skill that fits.
This skill only reads: it writes no files, installs nothing, and runs no other
skill.

[The catalogue](references/catalogue.md) is the source for names, areas, order,
and one-line descriptions. Copy each description exactly.

## Determine installed status

Mark a skill `✓` when it is available to you in this session: it appears in your
host's skill list, with or without a plugin namespace such as `skills:code-review`,
or a sibling folder `../<name>/SKILL.md` exists beside this skill. Mark every
other skill `-`. Show uninstalled skills with `-`; keep every catalogue row.

## List the catalogue

When the request has no task, print:

1. A heading line: `**Antick skills**: <total> skills (<installed> installed, <missing> not installed)`.
2. One bold area title and one table per area, in catalogue order, with the
   columns `Skill | What it does |` and an unlabeled status column holding `✓` or `-`.
3. The footer: `✓ installed · - not installed. Try <invocation> <what you want to do> for a suggestion.`
   Write `<invocation>` in the host's syntax for this skill, such as `$antick` in
   Codex, `/antick` in Claude Code or OpenCode, or `/skill:antick` in Pi.

The list is complete when every catalogue row appears exactly once with its
status.

## Recommend a skill for a task

When the request names a task, match it against the catalogue and, when it
helps you choose between candidates, the `description` of each installed
candidate's `SKILL.md`. Print:

- **Best match:** the skill and one sentence on why it fits this task.
- **Also relevant:** up to two other skills, each with its reason, only when they
  add something the best match does not.
- How to start: the best match's invocation in the host's syntax. When it is not
  installed, say so and point to <https://github.com/antick/skills> for installation.

When no skill fits, say so plainly and list the two closest areas.
