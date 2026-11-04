# Catalogue repository checklist

Use this when skills live in `skills/<name>/` and the repository publishes them
as a package. Confirm each file exists before editing it; skip entries the
repository does not have.

## Skill folder

- `skills/<name>/SKILL.md` with frontmatter `name: <name>` on the line after
  the opening `---`, and a one-line `description`.
- `skills/<name>/agents/openai.yaml`:

  ```yaml
  interface:
    display_name: "Title Case Name"
    short_description: "Short phrase under about 60 characters"
    default_prompt: "Use $<name> to <typical request>."
  ```

- Optional `references/*.md` guides and `scripts/` files, linked only from
  inside the folder.

## Catalogues and manifests

Add, rename, or remove the skill in every list, keeping each list's existing
order and style:

| File | What to change |
| --- | --- |
| `packs.json` | The `summaries` entry (one short phrase) and the skill name in a pack's `skills` list |
| `SKILLS.md` | The skill count and a table row `` | `<name>` | <summary> | ``; a workflow coverage row when the skill covers a listed capability |
| `README.md` | The skill count in prose, the available skills table row, and an example invocation when the section lists one per skill |
| `.claude-plugin/marketplace.json` | `./skills/<name>` in the plugin's `skills` list |
| `.codex-plugin/plugin.json` | Capabilities, long description, and default prompts when the skill adds a capability |
| `pi-extension/commands.json` | `"<name>": "<summary>"` |
| Website catalogue files | Presentation details (category, heading, description, prompt starting with `$<name> `, steps, mode) and an icon mapping |

Keep the summary text identical wherever the repository repeats it, such as
`packs.json`, `SKILLS.md`, and the command map. Avoid regular-expression
characters such as `( ) ? + * [` in summaries; the installer test matches each
summary as a pattern and fails on them.

## Checks

Run the repository's commands, typically:

```sh
npm test
npm pack --dry-run
```

When a website is present, also run its catalogue tests, which work without
installing its dependencies, for example `node --test website/tests/*.test.mjs`.
Run its type checks (such as `npm run check --prefix website`) when its
dependencies are installed, and otherwise report them as skipped; a missing
icon mapping is caught only there. Then search for stale or missing entries:

```sh
git grep -n '<old-or-new-name>'
```
