# Antick Skills

25 skills for AI coding agents: code review, refactoring, security and database
audits, tests and CI, releases, documentation, workstation upkeep, and clear writing.

[Website](https://skills.potion.sh) · [Install](#install) · [All skills](SKILLS.md)

## Install

```sh
npx skills@latest add antick/skills --global
```

A menu opens. Pick the skills you want and the agents to install them in.
Restart your agents afterwards.

## Update

```sh
npx skills@latest update --global
```

## Remove

```sh
npx skills@latest remove --global
```

A menu opens. Pick the skills to remove. Use this to clear out skills that were
renamed: `repo-disk-cleanup` (now `reclaim-dev-space`), `save-window-layout` (now
`save-omarchy-window-layout`), and `update-ai-tools` or `manage-ai-tools` (now
`ai-harness-setup`).

These commands use the [skills.sh](https://skills.sh) CLI. It sends anonymous usage
data; set `DISABLE_TELEMETRY=1` to turn that off. Avoid its `--all` flag
with `--global`: it targets every agent the CLI knows, and some of them can't
install globally, so you get dozens of errors.

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
| [deep-wiki-html](skills/deep-wiki-html/SKILL.md) | Automatically create or refresh one offline HTML wiki and return a viewing link |
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

Installing copies skill folders only. These are set up separately:

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

To try your local changes, install from the checkout with `node scripts/install.mjs`.
It opens the same kind of menu; `--help` lists its options.

The website lives in `website/`; see [website/README.md](website/README.md).

## License

[MIT](LICENSE)
