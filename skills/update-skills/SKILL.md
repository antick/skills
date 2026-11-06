---
name: update-skills
description: Update agent skills installed with the skills CLI by running `npx skills@latest update --global`, then report what changed, skills added upstream that are not installed, skills removed upstream, and skills that follow a branch. Use only when the user explicitly requests the update-skills skill; not for writing or changing skills in a repository.
disable-model-invocation: true
---

# Update Skills

Bring installed skills up to date with `npx skills@latest update --global` and
tell the user exactly what changed. `update` only refreshes skills that are
already installed, from the branch each one tracks, so also report what it
cannot do on its own: install skills that were added upstream and remove skills
that were deleted upstream.

Use on an explicit request, such as `$update-skills` or `/update-skills`.
Invoking this skill authorizes running `update`. It does not authorize
installing new skills, removing installed ones, or moving a skill to another
branch; ask first for each.

## Boundaries

- Always call the CLI as `npx skills@latest`, including in every command you
  give the user.
- Run CLI commands with standard input closed (`</dev/null`) so an interactive
  prompt cannot hang the session. Add `-y` only where these steps say so.
- Never edit a skills lock file by hand, and never reinstall every skill to
  force an update.
- Never install, remove, or move a skill to another branch without the user's
  confirmation of the exact names.

## Choose the scope

Use global scope unless the user asks for project skills. Apply the matching
row to every step; do not mix the two.

| Scope | `update` | `list`, `add`, `remove` | Lock file | Hash field |
| --- | --- | --- | --- | --- |
| Global | `--global` | `--global` | `$XDG_STATE_HOME/skills/.skill-lock.json` when `XDG_STATE_HOME` is set, otherwise `~/.agents/.skill-lock.json` | `skillFolderHash` |
| Project | `--project`, run from the project root | no scope flag, run from the project root | `./skills-lock.json` | `computedHash` |

`--project` is an `update` option only; `list`, `add`, and `remove` ignore it
and use project scope whenever `--global` is absent. The examples below show
global scope.

## Steps

1. **Record the starting state.** Run
   `npx skills@latest list --global --json </dev/null`. Note each skill's name,
   source, agents, and status:
   - `tracked`: listed in the lock file, so `update` checks it.
   - `missing`: listed in the lock file but not on disk. `update` installs it
     again.
   - `untracked`: on disk with no lock entry, for example copied in by hand.
     `update` never checks it.

   From the lock file, note each skill's hash and any `ref`. Group the tracked
   and missing skills by source and `ref` together, as the CLI does: skills
   from one repository can follow different branches. A group with a `ref`
   follows that branch instead of the source's default branch.
2. **Check each branch.** For every group with a `ref` on a GitHub source,
   check whether the branch still exists
   (`git ls-remote --heads https://github.com/<owner>/<repo> <ref>`) and
   whether a merged pull request used it as its head
   (`gh pr list --repo <owner>/<repo> --head <ref> --state merged`). Record the
   branch as open, merged, deleted, or unknown when a check fails.
3. **Run the update.**

   ```sh
   npx skills@latest update --global </dev/null
   ```

   Keep the full output. It lists skills that were updated, sources it failed
   to check, skills it cannot check automatically (local paths, plain Git URLs,
   private or deleted repositories), and a warning for skills that appear to
   have been deleted upstream. Without a terminal the CLI skips deleting those
   skills; it does not remove them.
4. **Find skills added upstream.** For each GitHub group, list the skills on
   its branch with `npx skills@latest add <source> --list </dev/null`, adding
   `#<ref>` to the source for a group with a `ref`. Run these listings in
   parallel. Compare each listing only with the installed skills of the same
   group; a skill installed from another branch of the same repository does
   not count. Each name that is not installed is new upstream. If a listing
   fails, record the source and branch as not checked for new skills.
5. **Choose agents for any install.** `--agent` takes CLI agent ids such as
   `claude-code` or `github-copilot`, not the display names that `list --json`
   shows. Use the agents of the skills being replaced; for a new skill, use the
   agents shared by the other skills in its group, and ask when they differ.
   Turn each display name into its id. If the CLI rejects an id, it installs
   nothing and prints the valid ids; use those to correct the list. Never use
   the lock file's `lastSelectedAgents`: it records only the most recent
   interactive choice.
6. **Offer follow-up actions.** Ask once, listing exact names, whether to:
   - install the new skills, with
     `npx skills@latest add <source> --global --skill <name>... --agent <id>... -y`.
   - remove the skills deleted upstream, with
     `npx skills@latest remove <name>... --global -y`.
   - move skills whose branch is merged or deleted back to the default branch,
     by installing them again from the plain source with the same `add`
     command. Do not offer this for an open branch; report it instead.
   - update a skill the CLI cannot check, with the same `add` command and the
     skill's own source and agents.

   Run only what the user confirms. If the user declines or does not answer,
   leave the skills as they are and give the commands in the report.
7. **Verify.** Run `npx skills@latest list --global --json </dev/null` again and
   read the lock file. Compare with the starting state: an updated skill has a
   new hash, an installed skill appears in the list, a removed skill is gone,
   and a moved skill has no `ref`. Report any action whose result does not
   match.

## Report

Start with one line: the scope, the number of tracked and missing skills that
`update` checked, how many were updated, and the number of untracked skills it
skipped. Then use these headings, one item per line, and leave out a heading
that has no items:

- **Updated:** skill names.
- **Reinstalled:** skills that were missing from disk and that `update`
  installed again.
- **Already current:** a count; list names only when there are few.
- **New upstream, not installed:** name, source, and branch, and whether it was
  installed in this run.
- **Removed upstream:** name, and whether the local copy was removed.
- **Following a branch:** name, branch, and whether the branch is open,
  merged, deleted, or unknown.
- **Not checked automatically:** name, reason, and the update command built in
  step 6.
- **Not managed by the CLI:** untracked skills, which `update` never checks.
- **Sources not checked for new skills:** source, branch, and the error.
- **Failed:** skill or source, and the error.

End with the commands for every action that is still open, written with
`npx skills@latest` and explicit `--agent` ids. If skills were updated,
installed, or removed, say that the agent may need a restart or a new session
before it loads the changed skills.
