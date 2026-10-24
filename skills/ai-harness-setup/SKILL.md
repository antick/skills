---
name: ai-harness-setup
description: Set up missing AI tools and JavaScript runtimes with user confirmation, update existing installations, and report every result using OS-appropriate installation and update methods. Use only when the user explicitly requests the ai-harness-setup skill.
disable-model-invocation: true
compatibility: Local shell and network access on the target machine; desktop applications also require a supported graphical OS and architecture.
---

# AI harness setup

Use on an explicit request, including `$ai-harness-setup`, `/ai-harness-setup`, or
Pi's `/skill:ai-harness-setup`. Reviewing or installing this skill does not
authorize changing the machine. An invocation authorizes updating existing tools;
installing a missing tool requires the user's confirmation of the concrete plan.

## Coverage

Unless the user narrows the scope, inventory and report all 18 entries in
[the tool registry](references/tools.md), keeping CLI and desktop rows separate:

- Pi and OMP (Oh My Pi).
- Codex CLI and Codex Desktop (including the current official desktop product
  that provides Codex); Claude Code CLI and Claude Desktop with Claude Code.
- Orca CLI and Orca Desktop; Peekaboo (also spelled "peekaaboo" in requests).
- Grok CLI (Grok Build) and Grok Bot Desktop.
- Hermes CLI and Hermes Desktop; OpenCode CLI and OpenCode Desktop.
- Node.js **latest LTS**, Deno stable, and Bun stable.

Read the registry before choosing packages. It links the upstream identities,
platform caveats, and installation/update sources. Check those official sources
live each run; names, versions, OS support, and packaging can change. Do not
substitute a web dashboard or similarly named package for a requested desktop app.

For the owner's Arch/Omarchy workstation, also read
[the workstation profile](references/omarchy-workstation.md). Apply its paths only
when they match the actual installation. The confirmation rules and reporting
contract here take precedence over examples in that profile.

## Detect the actual target

1. Identify the target OS, release, CPU architecture, shell, Linux distro/libc,
   available package managers, and whether this is WSL, a container, SSH, or a
   local desktop. Inspect macOS with `sw_vers`/`uname`, Linux with
   `/etc/os-release`/`uname`, and native Windows with PowerShell OS/architecture
   information. Distinguish Windows-host apps from tools inside WSL; do not treat
   a Linux guest as the Windows host or install on another host without scope.
2. Inventory all entries before mutation. Check every PATH match (`type -a` or
   `Get-Command -All`), aliases/wrappers, package ownership, version-manager
   configuration, desktop bundles/package databases, and active processes. A GUI
   app can be installed without a CLI on PATH. Repair a broken PATH registration
   instead of creating a duplicate installation. Identify the executable and
   runtime backing the current harness.
3. Determine each available release and artifact for this OS/architecture from
   official documentation and signed feeds. Check minimum OS/libc/CPU needs and
   required GUI, licensing, sign-in, or permission steps. Use `unknown` when a
   version cannot be verified; a network error does not prove unsupported OS.

## Choose an installation and future update route

For existing tools, use their owning manager or official updater. Preserve
working pins, channels, and administrator policies unless a change is already
requested; explain a pin that prevents an update. Ask before switching managers,
reinstalling, migrating a legacy package, or adding a second copy.

For a new installation, prefer the official native installer with a working
built-in updater, or an official signed package repository integrated with the
OS's normal updates. Use an existing version manager for runtimes when suitable.
On macOS inspect vendor DMG/PKG and Homebrew ownership; on Windows inspect signed
EXE/MSIX/App Installer/Store or an upstream-listed package-manager route; on Linux
match the distro's supported signed repository/package or official AppImage.
Respect declarative environments such as Nix rather than writing around them.

Verify the actual update mechanism for the chosen format. A downloadable `.deb`
or `.rpm` alone does not establish a repository or automatic updates. A Homebrew,
WinGet, npm, mise, or self-update **command** is not necessarily unattended
auto-update. Prefer the route that preserves supported automatic updates, then
state whether future updates are automatic, OS-policy dependent, manual, or
unverified. Do not promise automation or create timers/services to imitate it.
If no supported route auto-updates, disclose the limitation and the exact future
update command in the proposed plan and final report.

Preserve real `.AppImage` launches when the vendor updater needs `$APPIMAGE`;
extracting and launching `AppRun` can disable it. Check install-directory
writability, launcher target, signatures/checksums, and updater ownership. Keep
existing exceptions only when required and disclose their manual update cost.

## Confirm missing-tool setup, then act

Prepare a concise plan for **all missing tools and dependencies**: tool/version,
OS and architecture, official source, exact installation commands, destination,
elevation, future update mechanism, and any required GUI steps. Identify coupled
installs: Orca CLI can require the desktop bundle; another desktop installer can
also add its CLI/runtime. Include these effects in the plan. Download and inspect
metadata/artifacts as useful, but do not execute an installer or change PATH,
repositories, shell configuration, or package state before confirmation.

Ask once for approval of this named set, allowing approval of a subset. A prior
explicit approval of those same concrete installations remains valid. General
"manage/update everything" language, silence, and elapsed time do not approve
missing installs. While waiting, continue independent inventory and authorized
updates; do not install dependencies indirectly through another installer. If
confirmation is unavailable, leave those tools pending and report `skipped` with
"awaiting installation confirmation". A refusal is `skipped` with "declined".

Then install only approved entries and dependencies; update existing entries
without asking again for routine updates. Resolve confirmed runtime prerequisites
first. For Node.js, select the newest release currently marked LTS in the official
release index, not the newest Current major or a hardcoded version. Set up or
update the user's global/default runtime without changing project pins or
lockfiles. Preserve runtimes and global CLI packages needed by active sessions;
stage a switch that would disrupt this session.

Use temporary working directories. Preserve data, credentials, sessions, and
settings. Keep one intended installation per tool; do not remove duplicates or
old runtimes while a process depends on them. A whole OS upgrade, switching to
prerelease channels, and unrelated environment changes need separate scope. If
an official route requires a full OS upgrade, report that prerequisite rather
than partially upgrading the system or silently substituting an unsupported build.

Use the host's supported elevation flow without collecting passwords. If only
GUI interaction, Store access, sign-in, platform permissions, or unavailable
privileges can complete a step, explain the terminal limitation and leave the
remaining step to the user. Do not bypass OS protections or purchase access.
Continue independent tools after a failure; avoid repeated blind retries.

## Verify and always report

Verify the command actually resolved in a fresh shell outside project pins and
its version; for desktop apps verify the installed bundle/package version and
launcher separately from its CLI/backend. Confirm updater configuration or
package ownership, not merely a download or successful installer exit. If a
running app still uses the old code, report the installed version and required
restart separately. A working CLI is not proof that its desktop app was installed.

Always end with the detected OS/architecture/environment and a Markdown table
covering all 18 default entries, even after partial failures or refusals. For an
explicitly narrowed request, keep other default rows as `skipped — out of scope`.
Include any extra tools/dependencies actually considered as additional rows.

| Tool | Before | After / latest | Status | Install/update route | Future updates | Notes / next step |
| --- | --- | --- | --- | --- | --- | --- |

Use only these statuses and report totals by status:

- `installed`: newly added and verified. Mention unfinished sign-in/GUI setup.
- `updated`: an existing installation changed and the new version was verified.
- `already current`: verified against the applicable channel; no update needed.
- `skipped`: declined, awaiting confirmation, out of scope, or intentionally pinned;
  state which. Do not label a pinned older version current.
- `unsupported`: official support/artifacts exclude this OS, architecture, or
  required desktop environment. Cite the upstream evidence and specific reason.
- `blocked`: installation/update cannot proceed because of privilege, network,
  missing dependency, terminal-only/GUI limitation, or unresolved identity. State
  the exact blocker and actionable next step, distinguishing it from OS support.
- `failed`: an attempted action or verification failed; include a concise error
  and resulting state. Do not claim a partial install succeeded.
- `staged`: verified artifact/update is prepared but activation/replacement is
  deferred. State what remains; it is not installed or updated yet.

Use `not installed`, `unknown`, and `not checked` honestly in version cells. Link
the official evidence for unsupported decisions and non-obvious installation
choices. Include the future update command when updates are manual. Never omit a
requested tool because it was unavailable or merge desktop and CLI rows to hide a
failure. Never print secrets, full process environments, or private window titles.
