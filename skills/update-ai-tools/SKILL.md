---
name: update-ai-tools
description: Update installed AI coding tools, desktop apps, Bun, and pnpm using their actual installation methods. Use only when the user explicitly requests the update-ai-tools skill.
disable-model-invocation: true
compatibility: Local shell access and network access; the bundled workstation profile requires Arch Linux/Omarchy with mise and pacman/yay.
---

# Update AI tools

Accept the host's explicit skill invocation (for example `$update-ai-tools`,
`/update-ai-tools`, or Pi's `/skill:update-ai-tools`) or an explicit request to use
this skill. Reviewing or installing the skill does not authorize tool updates.

## Choose the installation routes

Inventory executable paths, installed versions, package ownership, and running
agent sessions before choosing an update method. Use the user's existing package
manager or official updater; verify current releases against official sources.
Work in a temporary directory outside the current repository.

For the owner's Arch/Omarchy workstation, read
[the workstation profile](references/omarchy-workstation.md) before updating. It
preserves the tool list, mise and package routes, AppImage launchers, Corepack
setup, and wrapper fixes from the original skill. Confirm the profile matches the
machine before applying its paths, channel choices, or pin overrides. On another
machine, follow the detected installation methods and the user's requested tools;
do not impose the profile's machine-specific overrides.

## Preserve the working environment

- Update the requested tools, preserving data, settings, and active sessions.
  Keep the executable and runtime backing the current harness until it exits.
- Keep project dependencies, lockfiles, and package-manager pins unchanged.
  A whole OS upgrade is outside this skill's scope.
- Verify downloaded artifacts using official checksums or signatures when
  available. Stage updates when replacing an installation would disrupt a session.
- For AppImages using electron-updater, preserve a real `.AppImage` launch with
  `$APPIMAGE` set. Follow documented exceptions for installations whose bundled
  CLI requires extraction, such as the workstation's Orca installation.
- Use the host's supported authorization flow when elevation is required. If
  interactive authorization cannot be completed, report the update as blocked.
  Never collect passwords or print tokens, full process environments, or private
  window titles.

## Verify and report

Check the version actually selected on PATH after each update. Separate desktop
and CLI installations when they can differ. A download is staged until installed
and verified; running desktop apps may still need a restart.

Report a table with `Tool`, `Before`, `After / latest`, `Status`, and
`Notes / next step`. Use `updated`, `already current`, `staged`, or `blocked` and
explain required restarts or unresolved failures. On the owner's workstation,
cover the complete tool list in the profile without asking the user to repeat it.
