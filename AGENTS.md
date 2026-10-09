# Agent Notes

Treat `skills/*/SKILL.md` as the canonical skill set. Keep `packs.json`, `SKILLS.md`,
the host plugin manifests, and `pi-extension/commands.json` synchronized with it.

Run `npm test` and `npm pack --dry-run` after catalogue changes.

After completing and verifying a task that changes files, stage only the changes
made for that task and create a local Conventional Commit with a type prefix such
as `feat`, `fix`, or `docs`. Preserve unrelated user changes and report the commit
hash and message in the final response.

Never push commits unless the user explicitly asks you to push.
