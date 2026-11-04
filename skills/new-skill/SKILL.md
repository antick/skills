---
name: new-skill
description: Create, update, rename, merge, or remove agent skills so they match the repository's existing skills and every catalogue, manifest, adapter, and test that lists them. Use whenever a task adds or changes a skill or its description; use instead of generic skill-creation guidance.
---

# New Skill

Make each new or changed skill look and behave like the skills that already
exist in the repository, and leave every place that lists skills in sync. A
skill that exists in one place but not in its catalogues cannot be found or
installed. Remove or merge away a skill only when the user authorizes it.

## Learn the repository's pattern

1. Read the repository instructions. They usually name the canonical skill
   folder and every file that must stay synchronized.
2. Find the canonical layout. Common layouts are:
   - **Catalogue repository:** `skills/<name>/SKILL.md` with
     `agents/openai.yaml`, optional `references/` or `scripts/`, plus catalogue
     files such as `packs.json`, `SKILLS.md`, plugin manifests, and command
     maps. Follow [the catalogue checklist](references/catalogue-checklist.md).
   - **Project with adapters:** a canonical folder such as `.agents/skills/`
     plus thin adapters for each agent harness (`.claude/skills/`,
     `.cursor/skills/`, and others) or symlinks. Follow
     [the adapter checklist](references/adapter-checklist.md).
   - Anything else: copy whatever the existing skills do.
3. Read two or three existing skills closest to the new one in purpose. Use
   them as the model for naming, frontmatter, section order, tone, length, and
   output templates. Do not invent a new structure when one already exists.
4. Read every existing skill description. If a skill already owns the trigger,
   extend it instead of adding a second skill for the same request. Note which
   nearby skills the new one must hand off to.

## Write the skill

- **Name:** lowercase kebab-case, equal to the folder name. Follow the
  repository's naming families (for example `code-*` for code work or
  `dependency-*` for dependency work). Prefer a short noun or verb phrase the
  user would type.
- **Frontmatter:** copy the keys existing skills use, usually only `name` and a
  one-line `description`. The description says what the skill does, the
  requests that should trigger it, and the nearby requests that should not.
  Keep it specific enough that an agent can choose between similar skills.
- **Body:** a title, one or two sentences stating the goal, then the sections
  the model skills use: boundaries and what invoking the skill authorizes,
  ordered steps, verification, and the output contract. Keep it to roughly the
  length of comparable skills; move long topic guides into `references/` and
  link them from `SKILL.md`.
- **Output templates:** show required formats as fenced templates that render
  correctly. Put bold labels on separate paragraphs with blank lines between
  them.
- **Links:** link only to files inside the skill's own folder, with relative
  paths that exist. Refer to other skills by name in backticks, never by a path
  into another skill's folder; each skill must work when installed alone.
- **Portability:** keep project names, private hosts, account names, and
  personal usernames out of a skill meant for reuse. Put such defaults in the
  repository instructions instead.
- **Scripts:** add a script only for work that is error-prone to do by hand.
  Make it standalone, document its arguments at the top, and check it runs.
- Never leave placeholder text such as `TODO`.

## Rename, merge, or remove

- **Rename:** move the folder, update `name`, the `$<name>` prompt in
  `agents/openai.yaml`, every catalogue and manifest entry, and every reference
  from other skills, documentation, and the website. Search for the old name
  with `git grep -n '<old-name>'` until nothing stale remains.
- **Merge:** keep the surviving skill, move the absorbed behavior into it, and
  update every reference to the absorbed name.
- **Remove:** only with the user's authorization. Delete the folder and every
  catalogue entry, adapter, and reference.

## Validate

Run the checks from the matching checklist and the repository's test and
packaging commands. Fix every reported problem; do not weaken a test to pass.
Search the changed files for stale names, placeholder text, and links that
leave the skill folder.

## Report

List the skill files created, changed, or removed; each catalogue, manifest,
adapter, and website file updated; and the validation commands with their
results. State any check that could not run. Commit only as the repository
instructions or the user direct.
