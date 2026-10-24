# Tool identities, installation sources, and update routes

This registry defines the 18 default report rows. Check the linked official
sources at execution time for current support, artifacts, package names, release
channels, and update behavior. This is routing guidance, not an installer script
or permission to install. Never execute an install command during inventory.

## Default registry

| Report row | Official identity and sources | Installation and update decisions |
| --- | --- | --- |
| Pi | [Pi](https://pi.dev/) and [upstream installation guide](https://github.com/earendil-works/pi/tree/main/packages/coding-agent) | Check the official shell/PowerShell installer for macOS, Linux, and Windows; it manages its dependencies and supports `pi update`. The current npm identity is `@earendil-works/pi-coding-agent`; older `@mariozechner` installs need ownership/migration checks. Do not silently replace one with the other or claim the update command is automatic. |
| OMP (Oh My Pi) | [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi), linked [omp.sh](https://omp.sh/) installer | Check native shell/PowerShell installers and platform binaries; Bun, Homebrew, mise, and declarative routes can have different ownership. Preserve the current route for updates. Verify `omp` and its installed help; do not confuse it with Pi or assume identical commands. |
| Codex CLI | [Official CLI guide](https://learn.chatgpt.com/docs/codex/cli) | Inspect official standalone installers for macOS/Linux and Windows. npm/Homebrew/mise-owned installs remain manager-owned. Check supported self-update behavior in the installed release or rerun the official installer as documented; verify the resolved `codex` version. |
| Codex Desktop | [Official desktop guide](https://learn.chatgpt.com/docs/app), [Linux installation](https://learn.chatgpt.com/docs/linux/linux-app) | Detect both older Codex bundles and the current official ChatGPT desktop product providing Codex. Select the vendor's supported platform artifact/updater or signed distro repository. Record that product identity in the report. Do not install a community wrapper as an official app. Arch's official route can entail a full OS upgrade; surface that prerequisite separately. |
| Claude Code CLI | [Official setup and updates](https://code.claude.com/docs/en/setup) | Native installation on supported macOS/Linux/Windows has background updates. Prefer it for fresh installs when suitable. Homebrew, WinGet, and distro-managed installations have different update ownership; preserve that ownership and disclose manual/OS-policy behavior. Verify `claude --version` and updater health with documented diagnostics. |
| Claude Code Desktop | [Claude download](https://claude.com/download), [Linux beta](https://code.claude.com/docs/en/desktop-linux) | This is Claude Desktop with Claude Code, not a separate npm CLI package. Use signed platform installers; on supported Debian/Ubuntu, prefer Anthropic's apt repository. Check the distro matrix before offering Linux installation: an existing Arch repack is a different, unsupported distribution route, not proof of upstream Arch support. Verify the app independently of `claude`. |
| Orca CLI | [Stably Orca CLI](https://www.onorca.dev/docs/cli/overview) | Ships with Orca Desktop; inspect CLI registration and the installed bundle before declaring it missing. Include any required desktop installation in the confirmation plan. Linux may use `orca-ide` because bare `orca` can be a screen reader. Verify executable identity and matching app/CLI versions; do not install an unrelated package named `orca`. |
| Orca Desktop | [Stably Orca](https://github.com/stablyai/orca), linked [official downloads](https://onorca.dev/) | Choose the current signed/released artifact for macOS, Windows, or Linux and verify its update ownership. Prefer an installation preserving the supported updater and bundled CLI. An existing extracted Linux tree can require manual replacement; disclose that tradeoff instead of promising in-app updates. |
| Peekaboo | [Official install guide](https://peekaboo.sh/install.html), [upstream releases](https://github.com/steipete/Peekaboo/releases) | Normalize the spelling "peekaaboo" to Peekaboo. This is macOS UI automation; check the minimum OS release and architecture. The guide recommends signed/notarized `openclaw/tap/peekaboo`; update with that tap's `brew upgrade` route. CLI and menu-bar app are separate installs: propose the CLI by default and ask before adding the app. Report other OSes unsupported unless upstream adds support; do not substitute similarly named ports. |
| Grok CLI (Grok Build) | [Official installation](https://docs.x.ai/build/overview), [CLI reference](https://docs.x.ai/build/cli/reference) | Resolve the current shell/PowerShell installer for the detected platform. Native releases document `grok update`; existing npm/mise packages must be updated through their owner. Verify `grok version`/installed help and all PATH matches. Do not confuse the CLI with Grok Bot, a web shortcut, or an unofficial npm namesake. |
| Grok Bot Desktop | [Official setup](https://docs.x.ai/grok-bot/get-started), [deployment and release feeds](https://docs.x.ai/grok-bot/deployment) | Official macOS/Windows/Linux clients have distinct artifacts. Follow the vendor's release feed/download links, including vendor-linked Cursor delivery domains. The app checks updates; Linux deb/rpm packages can be package-manager owned. Prefer a supported self-updating format where suitable. Sign-in/plan access is a separate readiness step; do not install a browser PWA as a replacement. |
| Hermes CLI | [Nous Research installation](https://hermes-agent.nousresearch.com/docs/getting-started/installation), [support matrix](https://hermes-agent.nousresearch.com/docs/getting-started/platform-support) | Use the official installer or supported desktop-managed runtime for this OS/architecture; inspect upstream's current update instructions before changing it. PyPI/pipx, AUR, and Homebrew installs are not equivalent supported routes. Existing unsupported installs need a migration proposal and confirmation. Preserve `HERMES_HOME`, configuration, sessions, and backend ownership. |
| Hermes Desktop | [Nous Research desktop](https://hermes-agent.nousresearch.com/docs/user-guide/desktop), [platform support](https://hermes-agent.nousresearch.com/docs/getting-started/platform-support) | Inspect signed macOS bundles, Windows MSIX/App Installer update sources, and actual Linux release assets. Linux packaging and Intel Mac release coverage can differ from the marketing overview. An existing CLI can provide `hermes desktop`, which may build/download a UI; include those dependencies and side effects in confirmation. Report unavailable prebuilt packages or manual-build/GUI blockers explicitly. A web dashboard is not Desktop. |
| OpenCode CLI | [Official V2 guide](https://opencode.ai/v2/docs/) | Detect V1/V2 first: both use `opencode`, so they cannot coexist under the default command. Verify the selected channel before using an installer, package manager, or standalone binary. V2 docs identify `@opencode/cli` and separate platform binaries; Windows package-manager support can differ. Preserve existing V1 until a V2 migration is approved. Verify the installed updater/owner rather than assuming npm or a mise backend follows V2. |
| OpenCode Desktop | [Official V2 desktop downloads](https://opencode.ai/v2/docs/#desktop) | Select the current desktop artifact for macOS/Windows/Linux and architecture. Verify desktop version, CLI version, launcher, and update channel independently. For updater-based Linux AppImages, keep the actual `.AppImage` path rather than extracted `AppRun`; use its release manifest/checksum and preserve writable stable installation paths. |
| Node.js latest LTS | [Official release lifecycle](https://nodejs.org/en/about/previous-releases), [download/index](https://nodejs.org/dist/index.json) | Resolve the highest version currently marked LTS; never substitute Current or hardcode a major. Prefer the user's existing supported version manager for global/default Node, or an official platform installation with a clear update owner. Preserve project version files and active runtimes, and check global CLI packages after a runtime switch. A version manager is not automatic updating. |
| Deno | [Official installation and updates](https://docs.deno.com/runtime/getting_started/installation/) | Check macOS/Linux/Windows support and the exact architecture. Use the official shell/PowerShell installer for a fresh standalone install or the existing supported manager. Standalone `deno upgrade` and manager-specific upgrade commands have different ownership; preserve it and report future updates as manual unless automation is actually configured. |
| Bun | [Official installation and updates](https://bun.sh/docs/installation) | Check supported OS, architecture, libc, and CPU features. Prefer the official native installer for a fresh standalone install or the existing supported manager. Use `bun upgrade` for standalone builds, the owning manager otherwise. Select stable, not canary; verify the selected `bun` outside project-specific wrappers. |

## Platform and update checks

- Read the current upstream matrix and inspect the actual release artifact for
  the OS, minimum OS version, architecture, libc, and CPU. A project's general
  claim of Linux support is not evidence for every distro or a prebuilt GUI.
- Treat Windows/WSL, remote/headless hosts, and local graphical sessions as
  separate targets. Record a missing desktop session as an environment limitation;
  a supported downloadable GUI artifact can still be installed if explicitly
  approved, with launch verification left pending. Do not fake a GUI success.
- Verify future updates per installed format: app updater, signed package feed,
  Store/App Installer, version manager, or manual command. Report organizational
  update policy without overriding it. Self-update capability alone does not
  prove unattended automatic updates are enabled.
- Do not guess package IDs in Homebrew/WinGet/Scoop/Chocolatey or Linux repos.
  Verify publisher, upstream URL, stable channel, and supported artifact before
  presenting installation commands for confirmation.
- Prefer official packages over custom repacks. If upstream lacks a supported
  terminal installation, report `unsupported` or `blocked` with its specific
  cause; offer a manual next step, not an unapproved replacement project.

## Previously covered workstation extras

Retain updates for existing pnpm, Cursor CLI/Desktop, Antigravity desktop/IDE/CLI,
T3 Code Nightly, and Herdr on the owner's workstation when within the request's
scope. Report them as extra rows; they never replace one of the 18 defaults.
Missing extras are not an invitation to expand setup: propose them only when
requested and obtain the same missing-install confirmation. Consult the
[workstation profile](omarchy-workstation.md) for matching local installations.
