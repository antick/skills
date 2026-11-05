---
name: update-skills
description: Update agent skills installed with the skills CLI by running `npx skills@latest update --global`, then report what changed, skills added upstream that are not installed, skills removed upstream, and skills pinned to a branch. Use when the user asks to update, refresh, or upgrade installed skills; not for writing or changing skills in a repository.
---

# Update Skills

Bring installed skills up to date with `npx skills@latest update --global` and
tell the user exactly what changed. `update` only refreshes skills that are
already installed, from the branch each one tracks, so also report what it
cannot do on its own: install skills that were added upstream and remove skills
that were deleted upstream.

Invoking this skill authorizes running `update`. It does not authorize
installing new skills or removing installed ones; ask first for each.

## Boundaries

- Use global scope by default. Use `--project` instead only when the user asks
  for project skills.
- Always call the CLI as `npx skills@latest` so the newest CLI runs.
- Run CLI commands with standard input closed (`</dev/null`) so an interactive
  prompt cannot hang the session. Add `-y` only where these steps say so.
- Never edit the skills lock file by hand, and never reinstall every skill to
  force an update.
- Never install, remove, or switch the branch of a skill without the user's
  confirmation of the exact names.

## Steps

1. **Record the starting state.** Run
   `npx skills@latest list --global --json </dev/null`. Note each skill's name,
   source, and status. Read the lock file for each skill's folder hash and any
   `ref`: `$XDG_STATE_HOME/skills/.skill-lock.json` when `XDG_STATE_HOME` is
   set, otherwise `~/.agents/.skill-lock.json`. A skill with a `ref` follows
   that branch instead of the source's default branch.
2. **Run the update.**

   ```sh
   npx skills@latest update --global </dev/null
   ```

   Keep the full output. It lists skills that were updated, skills that failed,
   skills it cannot check automatically (local paths, plain Git URLs, private
   or deleted repositories) with the command to update each by hand, and a
   warning for skills that appear to have been deleted upstream. Without a
   terminal the CLI skips deleting those skills; it does not remove them.
3. **Find skills added upstream.** For each GitHub source in the starting
   state, run `npx skills@latest add <source> --list </dev/null`, adding
   `#<ref>` to the source for skills that follow a branch. Compare the listed
   names with the installed skills from that source. Each name that is not
   installed is new upstream. If the listing fails, report the source as
   unchecked.
4. **Offer follow-up actions.** Ask once, listing exact names, whether to:
   - install the new skills, with
     `npx skills@latest add <source> --global --skill <name>... --agent <agent>... -y`.
     Use the agent list in the lock file's `lastSelectedAgents` unless the
     user names agents; without either, ask which agents to install to.
   - remove the skills deleted upstream, with
     `npx skills@latest remove <name>... --global -y`.
   - move skills that follow a merged branch back to the default branch, by
     installing them again from the plain source with the same `add` command.

   Run only what the user confirms. If the user declines or does not answer,
   leave the skills as they are and give the commands in the report.
5. **Verify.** Run `npx skills@latest list --global --json </dev/null` again and
   read the lock file. Compare with the starting state: an updated skill has a
   new folder hash, an installed skill appears in the list, and a removed skill
   is gone. Report any action whose result does not match.

## Report

Start with one line: the scope, the number of installed skills checked, and
how many were updated. Then use these headings, one item per line, and leave
out a heading that has no items:

- **Updated:** skill names.
- **Already current:** a count; list names only when there are few.
- **New upstream, not installed:** name and source, and whether it was
  installed in this run.
- **Removed upstream:** name, and whether the local copy was removed.
- **Following a branch:** name and branch, so the user knows these skills skip
  the default branch.
- **Not checked automatically:** name, reason, and the update command the CLI
  printed.
- **Failed:** name and the error.

End with the commands for every action that is still open. If skills were
updated, installed, or removed, say that the agent may need a restart or a new
session before it loads the changed skills.
