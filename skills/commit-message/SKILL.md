---
name: commit-message
description: Draft or revise concise commit messages that follow the repository's convention, defaulting to Conventional Commits, with a short subject and only essential bullets. Use whenever suggesting a commit message or preparing an authorized commit, amend, or squash message, including during another workflow.
---

# Commit Message

## Find the convention

Follow the repository's existing commit convention. Check its agent
instructions, `CONTRIBUTING` guide, commit-lint configuration, and recent
`git log` subjects. When the repository has no clear convention, use
[Conventional Commits](https://www.conventionalcommits.org/): a lowercase type
such as `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, or
`chore`, an optional scope, a colon, and a lowercase description, as in
`fix(auth): keep the session on refresh`.
Do not add agent branding or change team rules to apply this skill.

## Format and voice

- Start the subject with the type or prefix the convention requires, then a
  concise title that begins with an action verb, in the letter case the
  convention uses (lowercase for Conventional Commits).
- Include a ticket number only when it was supplied in the conversation or comes
  from a verified linked issue, placed where the convention puts it. A branch
  name is a lead, not proof. Never invent a number or commit a placeholder.
- Aim for at most 50 characters for the whole subject. This is a soft target:
  prefer a shorter clear title, and exceed it only when shortening would hide
  what changed.
- After the subject, leave one blank line and add short `- ` bullets for the
  essential changes only: one idea per bullet, as few bullets as the change needs.
  A small change can have no bullets.
- Omit file lists, implementation narration, examples, headings, nested lists,
  and generic test boilerplate. Keep a technical term only when it identifies the
  change accurately.
- Never claim testing, deployment, or completion without evidence.

## Ground the message

Describe the actual changes. For an imminent commit, read the staged diff
(`git diff --cached`); for an amend or squash, read the resulting combined change.
Do not describe unrelated unstaged work. For a suggestion made before staging,
state its scope outside the message.

## Output and execution

For a draft, return only the subject, a blank line, and the bullets in a copyable
plain-text block. Put any note about missing input outside that block.

This skill governs wording. It does not itself authorize staging, committing,
amending history, pushing, or changing a pull request. Continue actions that are
already authorized without asking again.

When making an authorized commit, keep the exact message and real newlines.
Write it to a temporary file and use `git commit -F <message-file>` rather than
interpolating the text into shell code. Verify the saved message with
`git log -1 --format=%B`.
