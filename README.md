# Antick Skills

Fifteen portable AI agent skills for reviewing code, building with the project's
existing stack, auditing security, simplifying a codebase, upgrading dependencies,
setting up public and private desktop releases, fixing Vercel domains, cleaning
repository artifacts, maintaining an Omarchy workstation, updating AI tools, and
communicating clearly.

[Explore the website](https://skills.potion.sh) · [Get started](#install-from-a-checkout)

Each skill is a folder containing a `SKILL.md` and any supporting guides. The
installer copies those folders into your coding agent's skill directory. The
repository also includes adapters for OpenCode and Pi, plus plugin manifests
for Codex and Claude Code.

## Available skills

| Skill | Use it when you want to… |
| --- | --- |
| [code-review](skills/code-review/SKILL.md) | Review local changes or a pull request against its requirements and report confirmed problems. Read-only by default. |
| [code-build](skills/code-build/SKILL.md) | Build a feature, fix a bug, or start an app using the simplest suitable solution for the actual stack. |
| [code-security](skills/code-security/SKILL.md) | Audit application code, dependencies, GitHub Actions, and public-repository controls; report evidence-backed vulnerabilities with justified severity. |
| [github-actions-security-audit](skills/github-actions-security-audit/SKILL.md) | Audit GitHub Actions, CI settings, environments, and secrets across every public and private repo of an account; report per-repo findings with severity and fixes. Read-only. |
| [code-audit](skills/code-audit/SKILL.md) | Find and rank unnecessary complexity across a repository, without applying changes. |
| [upgrade-dependencies](skills/upgrade-dependencies/SKILL.md) | Upgrade package.json dependencies to stable releases at least 48 hours old, apply required migrations, and verify behavior. |
| [concise](skills/concise/SKILL.md) | Get a brief answer that keeps the result, reason, and important caveats. |
| [make-sense](skills/make-sense/SKILL.md) | Get a clear, natural explanation with as much detail as the subject needs. |
| [simplify](skills/simplify/SKILL.md) | Apply ASD-STE100 to explanations, instructions, and reports while preserving technical accuracy and exact code identifiers. |
| [public-desktop-release](skills/public-desktop-release/SKILL.md) | Publish signed Apple Silicon apps through GitHub with installers, automatic updates, and a separate dev app. |
| [private-desktop-release](skills/private-desktop-release/SKILL.md) | Set up Apple signing, notarization, private installers, licensed updates, device controls, and repeatable releases. |
| [vercel-domain-cleanup](skills/vercel-domain-cleanup/SKILL.md) | Fix permanent default Vercel and www redirects, clear DNS warnings, and verify every website. Reuse the existing Chrome session for Cloudflare when needed. |
| [repo-disk-cleanup](skills/repo-disk-cleanup/SKILL.md) | Inventory generated repository artifacts, stale worktrees, Docker caches, and Playwright downloads; clean only authorized categories while preserving database containers and volumes. |
| [save-window-layout](skills/save-window-layout/SKILL.md) | Explicitly save managed Omarchy/Hyprland workspaces, tiled window sizes, and the active workspace for restoration at login. |
| [update-ai-tools](skills/update-ai-tools/SKILL.md) | Explicitly update installed AI coding tools and desktop apps through their existing installation methods, preserving active sessions and verifying versions. |

`code-build` includes focused guides for Astro, Expo/React Native, Electron,
browser extensions, command-line tools, and Turborepo workspaces. Shared guidance
covers web clients, APIs, storage, authentication, and billing. It follows an
existing project's stack; the listed guides do not limit which projects it can
work on.

`save-window-layout` and `update-ai-tools` retain explicit-only invocation.
Use your host's skill syntax, such as `$save-window-layout` in Codex,
`/save-window-layout` in Claude Code or OpenCode, or `/skill:save-window-layout`
in Pi. Hosts without invocation-policy support should follow the explicit-use
boundary in the instructions. `repo-disk-cleanup` inventories by default and
requires authorization for destructive cleanup.

These skills can be installed for every supported harness, but runtime
requirements still apply: window capture requires the existing Omarchy/Hyprland
Lua configuration and startup integration. The tool updater includes the owner's
Arch/Omarchy workstation profile and checks installation methods before using it
on another machine. Installation alone does not run scripts or update tools.

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

The npm package name is `@antick/skills`, but the checkout instructions do not
depend on an npm release.

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
| `--yes`, `-y` | Skip prompts; required for installation without an interactive terminal. |
| `--all` | Install all skills for all configured agents and skip prompts. |

Quote `'*'` so your shell does not expand it into filenames. Always provide a
value for `--skill`, `--agent`, and `--cwd`.

**Existing files:** installation replaces the entire directory of each selected
skill, including local edits. Back up customized skills first. The installer
prepares every destination for a skill before replacing existing copies. A copy
failure leaves those copies intact; a failed swap restores them. If restoration
also fails, the error identifies the retained recovery directory. Skills that
finished installing before another skill fails remain installed.

When input or output is not a terminal, installation requires `--yes` or `--all`.
With that confirmation, omitted skills select all skills, and omitted agents
select detected agents or the built-in defaults. Use explicit selections in
scripts. `--list` and `--help` work without confirmation.

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

Destination parents must resolve inside the selected project, or inside the home
directory for a global installation. Links that redirect those parents outside
that scope are rejected before installation. The selected project itself may be
accessed through a symlink. Existing links at the individual skill location are
replaced without changing their targets.

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
$code-security Audit this repository and its GitHub Actions; report confirmed vulnerabilities with justified severities.
$upgrade-dependencies Update dependencies, apply required migrations, and verify the project still works.
$public-desktop-release Set up, publish, and install a signed Apple Silicon release of this app through GitHub, with automatic updates and a separate dev app. Use my existing main Chrome session for account setup.
$private-desktop-release Set up private macOS releases for this app using its existing stack.
$concise Summarize what changed and what still needs checking.
$make-sense Explain how this request reaches the database.
$simplify Write these instructions in ASD-STE100 Simplified Technical English. Keep code identifiers exact.
```

Skills provide instructions to the agent. Its tools, permissions, and your
project's instructions still determine what it can do. Review and audit skills
report findings; `code-build` and `upgrade-dependencies` perform implementation work.

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

Tests cover catalogue consistency, skill metadata, installation into every
configured harness directory, adapter registration/dispatch, and window-layout
capture with simulated Hyprland responses. The layout tests require Python 3
and Bash; they do not change the host desktop or run every coding agent. The package
check previews the files npm would ship; it does not publish anything. This
skills package has no third-party runtime or development dependencies. The
website has its own dependencies and lockfile.

## Website

The landing page at [skills.potion.sh](https://skills.potion.sh) lives in
`website/`. It uses Astro, Tailwind CSS, and shadcn/ui React components. Its
skill names and agent options come from the same catalogues as the installer.
The website and its dependencies are excluded from the published skills package.

Use Node.js 24 from the repository root:

```sh
npm ci --prefix website
npm run dev --prefix website
npm test --prefix website
npm run build --prefix website
```

Site copy and links live in `website/src/lib/site.ts`; skill descriptions live
in `website/src/lib/catalog.ts`. The social preview source is
`website/public/og.svg`, with `og.png` used by link previews.

Vercel project `antick-skills` builds from the **repository root**, using the
checked-in `vercel.json`. Do not set the root directory to `website`: the build
also reads the repository's catalogues. Output is `website/dist`. Cloudflare
manages DNS for `skills.potion.sh`. The website needs no application environment
variables.

### Release deployments

Automatic Git deployments are disabled with `git.deploymentEnabled: false` in
`vercel.json`. PR updates and merges to `main` do not deploy once their commits
contain this configuration. Update older branches too if they still have the
previous configuration.

The [release workflow](.github/workflows/deploy-release.yml) deploys only when a
**stable GitHub Release** is published, including a prerelease promoted to stable.
Pushing a tag alone, saving a draft, publishing a prerelease, or editing release
notes does not deploy. The workflow checks out the release's commit, runs tests,
builds in GitHub Actions, and uploads prebuilt output to production. Vercel does
not run a second build. Release jobs are serialized; a running deployment is not
cancelled by another release.

Before the first release, add a `VERCEL_TOKEN` secret to the repository's existing
**Production** GitHub environment. Create a Vercel token with access to the team
owning `antick-skills`; never commit the token. The workflow already contains the
non-secret team and project IDs. Keep environment deployment rules compatible
with release tags and restrict who can create or move release tags.

Merge the workflow and configuration before creating the release tag, then
publish a non-prerelease release for that tag in GitHub Releases. Check the
`Deploy website release` Actions run for the result. Publishing a release for
an older commit without this workflow will not install the workflow retroactively.
To retry a failed deployment, rerun that release's failed Actions job. Automated
release creation must use an identity that can trigger subsequent workflows;
events created with the workflow's default `GITHUB_TOKEN` generally do not.

The existing production site stays live between releases. Manual CLI/dashboard
deployments remain possible for recovery; they are not automatic release triggers.
For immediate coverage of old branches without the new configuration, disconnect
the project's Git integration in Vercel after configuring the release credentials;
CLI deployments still work.

References: [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration)
and [GitHub Actions deployment guide](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel).

## License

[MIT](LICENSE).
