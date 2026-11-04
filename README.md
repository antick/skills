# Antick Skills

24 skills for AI coding agents: code review, refactoring, security and database
audits, tests and CI, releases, documentation, workstation upkeep, and clear writing.

[Website](https://skills.potion.sh) · [Install](#install) · [All skills](SKILLS.md)

## Install

You need Node.js 24 and Git.

### Every skill, for every agent on this machine

```sh
npx github:antick/skills --skill '*' --global --copy --yes
```

The installer finds the agents you have installed by looking for their config
folders (`~/.claude`, `~/.codex`, and so on) and installs every skill for each of
them. If it finds none, it installs for Cursor, Claude Code, Codex, OpenCode, and Pi.

Restart your agents (or open a new session) afterwards.

### Pick skills and agents yourself

```sh
npx github:antick/skills
```

This opens a menu. To skip it, name what you want:

```sh
# two skills, for Codex and Claude Code only
npx github:antick/skills --skill code-review --skill concise --agent codex --agent claude-code --global --copy --yes

# one skill, into one project instead of your home folder
npx github:antick/skills --skill code-build --agent codex --cwd /path/to/project --copy --yes
```

See every skill without installing anything: `npx github:antick/skills --list`.

### Using the `skills` CLI instead

[skills.sh](https://skills.sh)'s `skills` CLI also works:

```sh
npx skills@latest add antick/skills --global --skill '*' -y
```

It finds your installed agents too. Don't add `--all`: in that CLI it means "every
agent it knows" (60+), and a few of them (Eve, PromptScript) can't install globally,
so you get dozens of errors. You may still see PromptScript errors without `--all`.
They're harmless.

### From a checkout

```sh
git clone https://github.com/antick/skills.git
cd skills
node scripts/install.mjs --skill '*' --global --copy --yes
```

Same installer, same options. This is the way to install changes you haven't pushed yet.

### Options

| Option | What it does |
| --- | --- |
| `--skill`, `-s <name>` | Install this skill. Repeat for more. `'*'` means all. |
| `--agent`, `-a <id>` | Install for this agent. Repeat for more. `'*'` means all 18. Leave it out to use the agents found on this machine. |
| `--global`, `-g` | Install into your home folder so every project gets the skills. |
| `--cwd <dir>` | Install into this project instead. Defaults to the current folder. |
| `--copy` | Copy files into each agent's folder instead of symlinking. |
| `--yes`, `-y` | Don't ask questions. Required when not running in a terminal. |
| `--all` | All skills, all 18 agents, no questions. |
| `--list`, `-l` | Show the skills and stop. |

Quote `'*'` so your shell doesn't expand it.

### Where skills go

Each skill is copied to `.agents/skills/<name>` (or `~/.agents/skills/<name>` with
`--global`), then copied or linked into each agent's own folder, such as
`~/.claude/skills` or `~/.codex/skills`. The full list of paths and detection
folders is in [install-agents.json](scripts/install-agents.json).

To install by hand, copy a whole folder from `skills/` into your agent's skills
folder. Keep its `references/`, `stacks/`, and `agents/` subfolders.

Supported agents (`--agent` value): Amp (`amp`), Antigravity (`antigravity`),
Claude Code (`claude-code`), Cline (`cline`), Codex (`codex`), Continue
(`continue`), Crush (`crush`), Cursor (`cursor`), Droid (`droid`), Gemini CLI
(`gemini-cli`), GitHub Copilot (`github-copilot`), Goose (`goose`), Kilo Code
(`kilo`), OpenCode (`opencode`), Pi (`pi`), Roo Code (`roo`), Windsurf
(`windsurf`), Zed (`zed`).

Installing replaces the whole folder of each selected skill, including any edits
you made. If a copy fails, the old version is kept. The installer refuses to write
outside the target project or your home folder.

### Update or remove

- **Update:** run your install command again.
- **Remove:** delete the skill's folder from each agent's skills folder, and from
  `.agents/skills` once no agent uses it. There is no uninstall command.
- **Renamed skills:** the installer doesn't delete old names. After updating,
  remove these if you have them: `repo-disk-cleanup` (now `reclaim-dev-space`),
  `save-window-layout` (now `save-omarchy-window-layout`), and `update-ai-tools` or
  `manage-ai-tools` (now `ai-harness-setup`).

## Skills

| Skill | What it does |
| --- | --- |
| [antick](skills/antick/SKILL.md) | List every Antick skill by area with installed status, or recommend one for a task |
| [code-review](skills/code-review/SKILL.md) | Review changes or a PR against its requirements. Read-only. |
| [code-build](skills/code-build/SKILL.md) | Build features, standardize UI, wire localization, and migrate platforms |
| [code-refactor](skills/code-refactor/SKILL.md) | Refactor auth, state, SDKs, routing, types, and performance with regression tests |
| [code-audit](skills/code-audit/SKILL.md) | Rank the biggest safe simplifications in a repository. Read-only. |
| [code-security](skills/code-security/SKILL.md) | Audit security; fix vulnerabilities and harden supply chains when asked |
| [database-audit](skills/database-audit/SKILL.md) | Audit schemas, migrations, queries, indexes, and access. Read-only. |
| [github-actions-security-audit](skills/github-actions-security-audit/SKILL.md) | Audit GitHub Actions and CI security across every repo of an account. Read-only. |
| [soc2-readiness](skills/soc2-readiness/SKILL.md) | Assess SOC 2 readiness and report gaps and missing evidence in chat. Read-only. |
| [upgrade-dependencies](skills/upgrade-dependencies/SKILL.md) | Upgrade to stable releases at least 48 hours old, apply migrations, and verify |
| [test-suite-hardening](skills/test-suite-hardening/SKILL.md) | Fix flaky tests and strengthen behavior coverage |
| [ci-cd-triage](skills/ci-cd-triage/SKILL.md) | Diagnose and repair failing builds and pipelines |
| [accessibility-audit](skills/accessibility-audit/SKILL.md) | Find accessibility barriers; fix them when asked |
| [documentation-generation](skills/documentation-generation/SKILL.md) | Write source-backed docs, architecture maps, and onboarding guides |
| [public-desktop-release](skills/public-desktop-release/SKILL.md) | Ship signed Apple Silicon apps through GitHub Releases with auto-updates and a separate dev app |
| [private-desktop-release](skills/private-desktop-release/SKILL.md) | Set up signed private macOS releases, licensed updates, and device controls |
| [vercel-domain-cleanup](skills/vercel-domain-cleanup/SKILL.md) | Fix Vercel and www redirects and DNS warnings, then verify every site |
| [reclaim-dev-space](skills/reclaim-dev-space/SKILL.md) | Report disk used by worktrees, Docker, test databases, and agent leftovers; delete only what you confirm |
| [ai-harness-setup](skills/ai-harness-setup/SKILL.md) | Update installed AI tools and runtimes; install missing ones only when you ask |
| [save-omarchy-window-layout](skills/save-omarchy-window-layout/SKILL.md) | Save Omarchy/Hyprland window layout for restoring at login |
| [concise](skills/concise/SKILL.md) | Short answers that keep the important parts |
| [make-sense](skills/make-sense/SKILL.md) | Clear, plain explanations with as much detail as needed |
| [simplify](skills/simplify/SKILL.md) | Write in ASD-STE100 Simplified Technical English |
| [interview](skills/interview/SKILL.md) | Get to know you and save only what you approve to memory |

[SKILLS.md](SKILLS.md) maps common tasks to the skill and guide that covers them.
Each skill's `SKILL.md` is the source of truth for what it does.

A few behave differently from the rest:

- **`ai-harness-setup` and `save-omarchy-window-layout`** run only when you call them
  by name. `ai-harness-setup` only updates by default; say "also install missing
  tools" to install. Its [tool list](skills/ai-harness-setup/references/tools.md)
  covers 19 tools and runtimes. `save-omarchy-window-layout` needs an existing
  Omarchy/Hyprland setup.
- **`reclaim-dev-space`** shows its findings in chat first and deletes nothing
  until you pick items from that report.
- **`interview`** saves to memory only what you approve, and never to the repository.

## Use a skill

Call it by name. The syntax depends on your agent:

| Agent | Syntax |
| --- | --- |
| Codex | `$code-review` |
| Claude Code, OpenCode | `/code-review` |
| Pi | `/skill:code-review` (or `/code-review` with the Pi extension) |

Add your request after the name:

```text
$code-review Review my uncommitted changes.
$code-build Add search to this Astro site.
$reclaim-dev-space Find what's eating my disk.
$antick
$antick free up disk space taken by worktrees and node_modules
```

Not sure which skill to use? Run `antick` with your task.

A skill only gives your agent instructions. The agent's own permissions still
decide what it can do. Audits and reviews report by default; ask for changes
when you want them.

### Plugins and adapters

The installer copies skill folders only. These are set up separately:

- **Claude Code and Codex:** plugin manifests in `.claude-plugin/` and
  `.codex-plugin/`, including marketplace files. They're in the Git repo, not the
  npm package.
- **OpenCode:** [.opencode/plugins/skills.mjs](.opencode/plugins/skills.mjs) adds
  the skills folder and a slash command per skill. See [opencode.json](opencode.json).
- **Pi:** [pi-extension/index.js](pi-extension/index.js) adds `/code-review`-style
  commands that forward to `/skill:code-review`. The `pi` field in `package.json`
  loads it.

## Contribute

Edit `skills/<name>/SKILL.md`; keep supporting guides next to it. When you add,
rename, or remove a skill, update `SKILLS.md`, `packs.json`, the plugin manifests,
`pi-extension/commands.json`, and `skills/antick/references/catalogue.md`. The
tests fail if any of them disagree.

```sh
npm test
npm pack --dry-run
```

The website lives in `website/`; see [website/README.md](website/README.md).

## License

[MIT](LICENSE)
