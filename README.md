# Antick Skills

Five portable AI agent skills for reviewing code, building with the project's
existing stack, simplifying a codebase, and communicating clearly.

Each skill is a folder containing a `SKILL.md` and any supporting guides. The
installer copies those folders into your coding agent's skill directory. The
repository also includes adapters for OpenCode and Pi, plus plugin manifests
for Codex and Claude Code.

## Available skills

| Skill | Use it when you want to… |
| --- | --- |
| [code-review](skills/code-review/SKILL.md) | Review local changes or a pull request against its requirements and report confirmed problems. Read-only by default. |
| [code-build](skills/code-build/SKILL.md) | Build a feature, fix a bug, or start an app using the simplest suitable solution for the actual stack. |
| [code-audit](skills/code-audit/SKILL.md) | Find and rank unnecessary complexity across a repository, without applying changes. |
| [concise](skills/concise/SKILL.md) | Get a brief answer that keeps the result, reason, and important caveats. |
| [make-sense](skills/make-sense/SKILL.md) | Get a clear, natural explanation with as much detail as the subject needs. |

`code-build` includes focused guides for Astro, Expo/React Native, Electron,
browser extensions, command-line tools, and Turborepo workspaces. Shared guidance
covers web clients, APIs, storage, authentication, and billing. It follows an
existing project's stack; the listed guides do not limit which projects it can
work on.

The [catalogue](SKILLS.md) lists the current skills. Each linked `SKILL.md` is the
source of truth for its behavior.

## Install from a checkout

Use Node.js 24 and Git for the commands below. The installer uses Node's built-in
modules; no dependency installation or build step is needed.

```sh
git clone https://github.com/antick/skills.git
cd skills
node scripts/install.mjs --list
```

Until the repository is public, cloning requires access. The npm package name is
`@antick/skills`, but the checkout instructions do not depend on an npm release.

Install one skill into a target project, replacing `/path/to/project` with that
project's directory:

```sh
node scripts/install.mjs --skill code-build --agent codex --cwd /path/to/project --copy --yes
```

Repeat `--skill` and `--agent` to select several:

```sh
node scripts/install.mjs --skill code-review --skill concise --agent codex --agent claude-code --cwd /path/to/project --copy --yes
```

For a guided selection in an interactive terminal:

```sh
node scripts/install.mjs --cwd /path/to/project
```

To make a skill available across projects for a selected agent:

```sh
node scripts/install.mjs --skill code-build --agent codex --global --copy --yes
```

Restart the coding agent or open a new session after installing.

### Options

| Option | Behavior |
| --- | --- |
| `--list`, `-l` | Show the skill catalogue without installing anything. |
| `--help`, `-h` | Show command help. |
| `--skill`, `-s <name>` | Select a skill; repeat for more. Use `--skill '*'` for all skills. |
| `--agent`, `-a <id>` | Select an agent; repeat for more. Use `--agent '*'` for all configured agents. |
| `--cwd <directory>` | Set the target project directory. Defaults to the current directory. |
| `--global`, `-g` | Install under the home directory instead of a project. |
| `--copy` | Use independent copies for agent-specific destinations. |
| `--yes`, `-y` | Skip interactive prompts. |
| `--all` | Install all skills for all configured agents and skip prompts. |

Quote `'*'` so your shell does not expand it into filenames. Always provide a
value for `--skill`, `--agent`, and `--cwd`.

**Existing files:** installation replaces the entire directory of each selected
skill, including local edits. Back up customized skills first. There is no
rollback if copying fails. When input or output is not a terminal, the installer
does not prompt, even without `--yes`; omitted skills select all skills, and
omitted agents select detected agents or the built-in defaults. Use explicit
selections in scripts.

### Agent destinations

The installer has directory mappings for these agents. This is a list of
configured installation targets, not a claim that every host/version has been
tested end to end.

| Agent | `--agent` value | Agent | `--agent` value |
| --- | --- | --- | --- |
| Amp | `amp` | Antigravity | `antigravity` |
| Claude Code | `claude-code` | Cline | `cline` |
| Codex | `codex` | Continue | `continue` |
| Crush | `crush` | Cursor | `cursor` |
| Droid | `droid` | Gemini CLI | `gemini-cli` |
| GitHub Copilot | `github-copilot` | Goose | `goose` |
| Kilo Code | `kilo` | OpenCode | `opencode` |
| Pi | `pi` | Roo Code | `roo` |
| Windsurf | `windsurf` | Zed | `zed` |

Every installation creates a primary copy under `.agents/skills/<name>` in the
target project, or `~/.agents/skills/<name>` for a global installation. Additional
agent directories receive copies or relative symlinks. The installer uses copies
when `--copy` is set or there is only one distinct agent destination. Otherwise
it uses symlinks, falling back to copies if creating a link fails.

For example, project-level Claude Code skills also go into `.claude/skills`,
while global Codex skills also go into `~/.codex/skills`. See
[install-agents.json](scripts/install-agents.json) for every path and detection
marker. Detection checks whether configured paths exist; it does not verify that
the agent can load the skill.

### Manual installation

Copy a complete folder from `skills/` into the skill directory supported by your
agent. Keep its `references/`, `stacks/`, and `agents/` folders when present;
copying only `SKILL.md` leaves its supporting guides behind.

## Use a skill

Ask for a skill by name in your agent, using its supported invocation syntax.
For example, in Codex:

```text
$code-review Review my uncommitted changes against the requested behavior.
$code-build Add search to this Astro site using its existing conventions.
$code-audit Find the largest safe simplifications in this repository.
$concise Summarize what changed and what still needs checking.
$make-sense Explain how this request reaches the database.
```

Skills provide instructions to the agent. Its tools, permissions, and your
project's instructions still determine what it can do. Review and audit skills
report findings; `code-build` performs implementation work.

### Host integrations

The folder installer installs skill files only. It does not configure or install
the following runtime adapters or plugin manifests:

- **OpenCode:** [.opencode/plugins/skills.mjs](.opencode/plugins/skills.mjs) adds
  this package's skills path and a slash command for each skill. The included
  [opencode.json](opencode.json) shows the local plugin configuration. Paths in
  another project must point to that project's actual package location.
- **Pi:** [pi-extension/index.js](pi-extension/index.js) registers commands such
  as `/code-review`, forwarding them to `/skill:code-review`. Busy sessions queue
  the request as a follow-up. The `pi` field in `package.json` declares both the
  extension and the skill directory for package loading.
- **Codex and Claude Code:** their manifests are in `.codex-plugin/` and
  `.claude-plugin/`. Local marketplace metadata is also included. These files
  are available in the Git checkout; they are not included in the npm tarball.

## Update or remove

Update the source checkout, then repeat your original installation command.
Back up local skill changes before reinstalling. Updates replace selected skill
directories and do not automatically remove skills that were renamed or retired.

There is no uninstall command. Remove only the skill folders or links you want
to uninstall from the chosen agent's directory. Remove the primary copy under
`.agents/skills` only when no other installed agent still uses it. If you loaded
an adapter through host configuration, remove that configuration separately.

## Contribute and verify

Edit the canonical instructions in `skills/<name>/SKILL.md` and keep supporting
guides beside them. When adding, renaming, or removing a skill, synchronize
`SKILLS.md`, `packs.json`, the host manifests, and `pi-extension/commands.json`.
Update this README when installation or user-facing behavior changes.

Run the repository checks:

```sh
npm test
npm pack --dry-run
```

Tests cover catalogue consistency, skill metadata, local installation, and
adapter registration/dispatch. They do not run every coding agent. The package
check previews the files npm would ship; it does not publish anything. This
repository has no third-party runtime or development dependencies.

## License

[MIT](LICENSE).
