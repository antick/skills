# Owner's Arch/Omarchy workstation profile

Use only after detecting a matching Arch/Omarchy installation and inspecting its
actual paths. This profile preserves local installation exceptions, not a global
OS support matrix. Read [the tool registry](tools.md) and current upstream sources
before choosing a route: package names, support, and channels have changed since
the original Pi-only skill. The main skill's missing-install confirmation and
all-tool report contract apply throughout.

## Managers, versions, and runtime changes

- Inspect `mise ls --installed`, `~/.config/mise/config.toml`, executable ownership,
  and `type -a` results. Existing tools include Pi, OMP
  (`github:can1357/oh-my-pi`), Codex, Claude Code, Grok, Hermes, Bun, and optional
  Cursor/OpenCode wrappers. Do not invoke an install-capable wrapper merely to
  inventory a missing tool; inspect the file/manager first.
- For a requested update of an existing mise-owned tool, inspect the dry run and
  use its exact tool ID. The owner's update preference permits
  `--minimum-release-age 0` for those updates; do not change unrelated tools or
  global policy. Codex has historically been pinned: explain a retained pin or
  use `--bump` only when moving that pin has been approved. Prefer official native
  self-updating routes for fresh installs when appropriate, with confirmation;
  do not force a new tool into mise just because another tool uses it.
- Node.js latest LTS and Deno are now explicit default targets alongside Bun.
  Resolve Node's current LTS from upstream and inspect how global npm CLIs depend
  on each installed Node version. Preserve project `packageManager` and runtime
  pins. Stage any default switch that would disrupt a running harness; verify
  global CLI resolution after activation. Do not delete an in-use older runtime.
- Grok historically exists both as mise `npm:@xai-official/grok` and as a Node
  global installation. Inspect both and their current upstream status; updating
  the shadowed copy alone does not update the command on PATH. Propose migration
  or duplicate removal rather than silently adding a third copy.
- Legacy Hermes `pipx:hermes-agent` is not a current upstream-supported installer.
  Preserve the existing environment until an official-route migration, its data
  handling, and its dependencies have been proposed and confirmed.
- Existing OpenCode uses a custom `http:opencode` mise backend for V2, while older
  generic backends/packages can resolve V1. Inspect the config and current V2
  documentation before touching it; do not let an updater downgrade the channel.

## Desktop packages and platform limits

- Inventory `pacman -Q`, available repo/AUR metadata, and official feeds for each
  installed app. An Arch repack is not an upstream-supported distro package.
  Codex/ChatGPT Desktop now has official Linux repository guidance; compare that
  with an existing `openai-codex-desktop` package before proposing migration.
  Claude Desktop's official Linux distro matrix must be checked rather than
  assuming the old local `claude-desktop-bin` repack is supported.
- Prefer vendor-signed repositories/native self-updaters for fresh installs;
  explain and confirm any migration from a working local repack. If installation
  or update requires a full Arch system upgrade, report it as a separate
  prerequisite. Do not perform a partial system upgrade or broaden this task to
  all OS packages. Build any approved local package as the normal user.
- Never install a community Claude/Codex wrapper under the official product row.
  Peekaboo's macOS requirement does not become satisfied by Omarchy. Grok Bot
  Desktop and Hermes Desktop are separate rows from their existing CLIs; resolve
  current official Linux availability and dependencies before proposing setup.

## Real AppImages and the Orca exception

T3 Code Nightly and OpenCode Desktop have used these stable paths:

- `~/.local/opt/t3code-nightly/t3code-nightly.AppImage`, wrapper
  `~/.local/bin/t3code-nightly-appimage`, desktop entry
  `~/.local/share/applications/t3code-nightly.desktop`.
- `~/.local/opt/opencode-desktop/opencode-desktop.AppImage`, wrapper
  `~/.local/bin/opencode-desktop`, desktop entry
  `~/.local/share/applications/opencode.desktop`.

Preserve real `.AppImage` execution for electron-updater; extraction followed by
`AppRun` can leave `$APPIMAGE` unset and break updates. Check `fuse2` and the
existing FUSE-aware wrapper; when the runtime supports it,
`APPIMAGE_EXTRACT_AND_RUN=1` preserves AppImage semantics without direct `AppRun`.
Any missing prerequisite installation belongs in the confirmation plan. Verify
updater logs and print only the `APPIMAGE` environment entry when necessary,
never the full process environment. Use current official feeds and verify their
checksums before replacement; a staged file is not an installed update.

Orca historically uses an extracted tree at `~/.local/opt/stably-orca` because
`resources/bin/orca-ide` launches the CLI from that tree. Wrappers
`~/.local/bin/stably-orca` and `~/.local/bin/orca-ide` point into it. Bare `orca`
can resolve to the Linux screen reader. Inspect the current bundle and CLI guide;
register the bundled CLI when missing rather than installing a namesake package.
This extracted GUI installation does **not** have the normal AppImage updater:
report manual replacement unless a supported self-updating route is verified.
Propose a migration separately if it can preserve CLI access and data.

Before replacing an Orca tree, inspect processes and daemon children. Close the
GUI gracefully only when no active agent/session would be lost. Do not stop an
active agent or the current terminal; stage the update when safe replacement is
impossible. Keep both Orca report rows even when a single artifact updates both.
Remove obsolete trees only after all dependent processes have exited.

## Wrapper and permission checks

User-local wrappers can call `mise use -g ...; exec mise x ...`. If their own
wrapper directory is first on PATH, `mise x tool -- tool` can recursively invoke
the same wrapper and hang. Inspect any changed wrapper for this recursion. The
local guard removes only `$HOME/.local/bin` from PATH before `exec mise x`:

```bash
export PATH="$(printf '%s' "$PATH" | tr ':' '\n' | grep -vxF "$HOME/.local/bin" | paste -sd: -)"
```

Preserve existing wrapper backups in `~/.local/state/mise-wrapper-backups/`.
Avoid duplicating shell startup lines when an upstream post-install command is
shown again. Any newly required PATH or wrapper setup is part of the approved
installation plan.

Use an interactive user-visible elevation flow, such as the host's authorization
UI or an available polkit prompt, when needed. Never collect passwords or treat a
failed noninteractive sudo probe as proof that installation is impossible. If no
interactive authorization is available, report the exact operation as blocked.
Keep GUI restarts and installed versus currently running versions distinct.

## Previously covered extras

For existing installations within scope, retain pnpm, Cursor CLI/Desktop,
Antigravity desktop/IDE/CLI, T3 Code Nightly, and Herdr updates. Verify their
current official sources rather than carrying old version numbers forward.

- pnpm has used Corepack under mise-managed Node. Inspect ownership before
  updating the global default, and check outside a project: a repo's
  `packageManager` can intentionally select another version. A Node LTS switch
  can change Corepack availability; include missing prerequisites in the plan.
- Cursor CLI and OpenCode have had newer mise-managed copies than distro
  packages. Check actual current versions; do not overwrite PATH with an older
  repo binary. Antigravity desktop, IDE, and CLI are distinct installed products;
  do not recreate duplicate `agy install` shell startup lines.
- T3 Code Nightly Desktop is separate from the `npm:t3` CLI; the latter needs an
  explicit request. Herdr has used an Omarchy package; compare official releases
  before claiming it is current. Keep separate CLI/desktop rows for extras too.
