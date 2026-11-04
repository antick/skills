# Antick Skills

38 portable AI agent skills for engineering refactors, security and
supply-chain hardening, tests and CI, accessible UI systems, platform and data
migrations, documentation, releases, personal interviews, and clear communication.

[Explore the website](https://skills.potion.sh) · [Get started](#install-from-a-checkout)

Each skill is a folder containing a `SKILL.md` and any supporting guides. The
installer copies those folders into your coding agent's skill directory. The
repository also includes adapters for OpenCode and Pi, plus plugin manifests
for Codex and Claude Code.

## Available skills

| Skill | Use it when you want to… |
| --- | --- |
| [code-review](skills/code-review/SKILL.md) | Review local changes or a pull request against its requirements and report confirmed problems. Read-only by default. |
| [submit-review](skills/submit-review/SKILL.md) | Publish completed review findings as one review of inline PR comments: tag the author and request changes on others' PRs, or post untagged comments on your own, then mark the PR draft. |
| [build-review-loop](skills/build-review-loop/SKILL.md) | Build several of your own issues in parallel with one builder and worktree each, then self-review every draft PR, post findings, and send fixes back until no actionable findings remain. |
| [code-build](skills/code-build/SKILL.md) | Build features, fix bugs, standardize UI, wire localization, and migrate platforms; commit in meaningful steps and finish with a draft PR. |
| [code-debug](skills/code-debug/SKILL.md) | Investigate a bug read-only and get the root cause, evidence, recommended fix, and the regression test that would catch it. |
| [sync-branch](skills/sync-branch/SKILL.md) | Bring a pull request or branch up to date with `main`, or a branch you name, by merging, resolving conflicts while keeping both sides' behavior, verifying, and pushing. |
| [commit-message](skills/commit-message/SKILL.md) | Get a concise commit message that follows the repository's convention, or Conventional Commits when it has none, grounded in the staged diff. |
| [pr-description](skills/pr-description/SKILL.md) | Get a pull request title and description in everyday language that still carries the paths, behavior changes, and checks reviewers need. |
| [create-issue](skills/create-issue/SKILL.md) | Create or refine a GitHub issue with gh that follows the repository's conventions, checks for duplicates, and is verified after saving. |
| [branch-status](skills/branch-status/SKILL.md) | Count remote branches and list merged ones that are safe to delete, with merge evidence. Read-only. |
| [spec-status](skills/spec-status/SKILL.md) | List unarchived OpenSpec changes whose implementation already reached the main branch. Read-only. |
| [code-security](skills/code-security/SKILL.md) | Audit security; remediate vulnerabilities and harden supply chains when requested. |
| [database-audit](skills/database-audit/SKILL.md) | Review schemas, migrations, SQL and ORM queries, indexes, transactions, and database access controls; report evidence-backed findings without applying changes. |
| [performance-audit](skills/performance-audit/SKILL.md) | Find reads, jobs, polling, and scripts whose cost grows with table size, prove each on synthetic volume, and rank the fixes. Read-only. |
| [github-actions-security-audit](skills/github-actions-security-audit/SKILL.md) | Audit GitHub Actions, CI settings, environments, and secrets across every public and private repo of an account; report per-repo findings with severity and fixes. Read-only. |
| [code-refactor](skills/code-refactor/SKILL.md) | Refactor shared flows, types, architecture, and performance with regression protection. |
| [soc2-readiness](skills/soc2-readiness/SKILL.md) | Assess SOC 2 readiness across code, infrastructure, and organizational controls; report findings, missing evidence, and remediation directly in chat. Read-only. |
| [code-audit](skills/code-audit/SKILL.md) | Find and rank unnecessary complexity across a repository, without applying changes. |
| [dependency-upgrade-minor](skills/dependency-upgrade-minor/SKILL.md) | Scan patch and minor updates, sort them into safe and contained-change tiers, apply them when asked, and verify behavior. Majors are left for dependency-upgrade-major. |
| [dependency-upgrade-major](skills/dependency-upgrade-major/SKILL.md) | Upgrade framework, runtime, toolchain, and other major versions with a migration plan, code and configuration changes, and full verification for each group. |
| [dependency-audit](skills/dependency-audit/SKILL.md) | Find outdated, end-of-life, and vulnerable dependencies across packages, Docker images, GitHub Actions, and runtime pins, with recommended targets. Read-only. |
| [dependency-override-cleanup](skills/dependency-override-cleanup/SKILL.md) | Find out why each override, resolution, patch, and audit waiver exists, prove which are stale, and remove them when asked. |
| [concise](skills/concise/SKILL.md) | Get a brief answer that keeps the result, reason, and important caveats. |
| [make-sense](skills/make-sense/SKILL.md) | Get a clear, natural explanation with as much detail as the subject needs. |
| [simplify](skills/simplify/SKILL.md) | Apply ASD-STE100 to explanations, instructions, and reports while preserving technical accuracy and exact code identifiers. |
| [public-desktop-release](skills/public-desktop-release/SKILL.md) | Publish signed Apple Silicon apps through GitHub with installers, automatic updates, and a separate dev app. |
| [private-desktop-release](skills/private-desktop-release/SKILL.md) | Set up Apple signing, notarization, private installers, licensed updates, device controls, and repeatable releases. |
| [vercel-domain-cleanup](skills/vercel-domain-cleanup/SKILL.md) | Fix permanent default Vercel and www redirects, clear DNS warnings, and verify every website. Reuse the existing Chrome session for Cloudflare when needed. |
| [reclaim-dev-space](skills/reclaim-dev-space/SKILL.md) | Report all in-scope worktrees, Docker resources, extra test databases, and agent-created artifacts in chat; highlight protected resources and clean only items confirmed after the report. |
| [save-omarchy-window-layout](skills/save-omarchy-window-layout/SKILL.md) | Explicitly save managed Omarchy/Hyprland workspaces, tiled window sizes, and the active workspace for restoration at login. |
| [ai-harness-setup](skills/ai-harness-setup/SKILL.md) | Update existing AI tools by default using OS-appropriate methods; report missing tools as skipped, and install only on explicit request with confirmation. |
| [test-suite-hardening](skills/test-suite-hardening/SKILL.md) | Fix flaky tests and strengthen behavior coverage. |
| [ci-cd-triage](skills/ci-cd-triage/SKILL.md) | Diagnose and repair failing builds and pipelines. |
| [accessibility-audit](skills/accessibility-audit/SKILL.md) | Find accessibility barriers and fix them when requested. |
| [documentation-generation](skills/documentation-generation/SKILL.md) | Write source-backed docs, architecture maps, and onboarding guides. |
| [interview](skills/interview/SKILL.md) | Learn personal context and save authorized memories. |
| [new-skill](skills/new-skill/SKILL.md) | Create, rename, or update skills so they match the existing set and every catalogue, manifest, and adapter stays in sync. |
| [use-chrome](skills/use-chrome/SKILL.md) | Have the agent work in your already-open Chrome over one long-lived connection, in background tabs, with one Allow prompt per connection and no substitute browser. |

`code-refactor` includes task-specific consolidation, strictness, workspace, and
performance guides. `code-security` includes remediation and supply-chain guides.
`documentation-generation` includes architecture mapping and contributor onboarding.

If you installed an earlier version of this PR, reinstall the parent skill folders
and preserve any custom edits before removing the superseded standalone folders.
The workflow coverage map links each consolidated capability to its new guide;
the installer does not automatically remove retired skill names.

`code-build` includes focused guides for Astro, Expo/React Native, Electron,
browser extensions, command-line tools, and Turborepo workspaces. Shared guidance
covers web clients, APIs, storage, authentication, and billing. It follows an
existing project's stack; the listed guides do not limit which projects it can
work on.

`save-omarchy-window-layout` and `ai-harness-setup` retain explicit-only invocation.
Use your host's skill syntax, such as `$save-omarchy-window-layout` in Codex,
`/save-omarchy-window-layout` in Claude Code or OpenCode, or `/skill:save-omarchy-window-layout`
in Pi. Hosts without invocation-policy support should follow the explicit-use
boundary in the instructions. `reclaim-dev-space` first reports the inventory
directly in chat, using an inline UI when supported or Markdown tables otherwise.
It creates no report file. The
report identifies cleanup candidates, important resources to keep, uncertain
items, provenance, estimated space, and proposed actions. Cleanup waits for the
user's confirmation of specific reported items, with explicit acknowledgement of
data loss for disposable test databases and storage. Every item is rechecked
before removal, then retained resources and actual space changes are verified.

`reclaim-dev-space` replaces `repo-disk-cleanup`. Preserve any customized old
installation before replacing it; the installer does not remove retired names.

`dependency-upgrade-minor` and `dependency-upgrade-major` replace
`upgrade-dependencies`. Preserve any customized old installation before removing
it; the installer does not remove retired names.

The window-layout skill was renamed from `save-window-layout` to
`save-omarchy-window-layout`. When reinstalling, preserve local customizations
before removing the old installed folder; retired names are not removed automatically.

These skills can be installed for every supported harness, but runtime
requirements still apply: window capture requires the existing Omarchy/Hyprland
Lua configuration and startup integration. `ai-harness-setup` detects the target
OS, architecture, installed tools, and update ownership before acting. It prefers
supported native updaters or signed package feeds. Bare invocation updates only;
missing tools and dependencies are reported without installation prompts. Installing
missing tools requires an explicit request and confirmation of the concrete plan.
The report includes manual-update limitations and unsupported platforms. Installation of the skill alone does not run scripts or update tools.

`ai-harness-setup` covers Pi, OMP, Codex CLI/Desktop, Claude Code CLI/Desktop,
Orca CLI/Desktop, Peekaboo, Grok CLI and Grok Bot Desktop, OpenMausBot Desktop,
Hermes CLI/Desktop,
OpenCode CLI/Desktop, Node.js latest LTS, Deno, and Bun. Each run ends with a table
for all 19 entries, including installed, updated, current, skipped, unsupported,
blocked, failed, or staged outcomes. See its [tool registry](skills/ai-harness-setup/references/tools.md)
for official sources and platform caveats. The owner's Omarchy exceptions remain
in a separate profile; they do not override OS support or install confirmation.

The skill was renamed from `update-ai-tools` and `manage-ai-tools` to
`ai-harness-setup`. Reinstall the new folder for each harness and remove old
installed folders only after preserving any local customizations; the installer
does not remove retired names.
Invoke it as `$ai-harness-setup`, `/ai-harness-setup`, or Pi's
`/skill:ai-harness-setup`, according to your host. To include installation, ask
explicitly, for example `$ai-harness-setup also install missing tools`. Absent
OpenMausBot is skipped even then unless you specifically ask to install it.

The [catalogue](SKILLS.md) lists the current skills, with a
[workflow coverage map](SKILLS.md#workflow-coverage) for the engineering and
interview workflows. Each linked `SKILL.md` is the source of truth for its behavior.

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
$database-audit Review my database schema, migrations, queries, and access controls; report findings without applying changes.
$soc2-readiness Assess this project for SOC 2 Type II readiness and report findings and missing evidence directly in chat.
$dependency-upgrade-minor Check which packages have patch or minor updates, apply the safe ones, and verify the project still works.
$dependency-upgrade-major Upgrade the major versions in this project, apply the required migrations group by group, and verify the project still works.
$code-debug Investigate this bug without changing code and report the root cause and fix.
$build-review-loop Build these issues in parallel, self-review each draft PR, and fix until clean.
$sync-branch Merge the latest main into this pull request, resolve conflicts, verify, and push.
$public-desktop-release Set up, publish, and install a signed Apple Silicon release of this app through GitHub, with automatic updates and a separate dev app. Use my existing main Chrome session for account setup.
$private-desktop-release Set up private macOS releases for this app using its existing stack.
$concise Summarize what changed and what still needs checking.
$make-sense Explain how this request reaches the database.
$simplify Write these instructions in ASD-STE100 Simplified Technical English. Keep code identifiers exact.
```

Skills provide instructions to the agent. Its tools, permissions, and your
project's instructions still determine what it can do. Review and audit requests report findings by default; implementation requests
authorize the relevant changes. `code-build` commits in meaningful steps, pushes a
branch, and opens a draft pull request unless you ask for local-only work.
`submit-review`, `sync-branch`, and `build-review-loop` post to GitHub or push
branches as part of their request; `code-debug`, `branch-status`, `spec-status`,
`dependency-audit`, and `performance-audit` only report. `code-security` separates read-only audits from
requested remediation and supply-chain hardening. `accessibility-audit` fixes findings only when fixes are requested.
`interview` uses the host's supported memory system only with save authorization;
installing it does not start an interview or save personal information. It never
uses a source repository as the default destination for personal notes.

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
`SKILLS.md`, `packs.json`, the host manifests, `pi-extension/commands.json`, and
the website catalogue (`website/src/lib/catalog.ts` or
`website/src/lib/engineering-catalog.ts`, plus `website/src/lib/skill-icons.ts`).
Update this README when installation or user-facing behavior changes.

Run the repository checks:

```sh
npm test
node --test website/tests/*.test.mjs
npm pack --dry-run
```

When the website's dependencies are installed, also run
`npm run check --prefix website`; it is the only check that catches a missing icon.

Tests cover catalogue consistency, skill metadata, installation into every
configured harness directory, standalone skill resource integrity and local links,
adapter registration/dispatch, and window-layout
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
in `website/src/lib/catalog.ts` and `website/src/lib/engineering-catalog.ts`.
The social preview source is `website/public/og.svg`, with `og.png` used by link previews.

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
