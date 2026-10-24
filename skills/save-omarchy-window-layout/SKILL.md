---
name: save-omarchy-window-layout
description: Save the current Hyprland/Omarchy app-to-workspace assignments, tiled window order and sizes, and active workspace for restoration at login. Use only when the user explicitly requests the save-omarchy-window-layout skill.
disable-model-invocation: true
compatibility: Omarchy/Hyprland with jq, Python 3, and the configured workspace startup script.
---

# Save Omarchy window layout

Accept the host's explicit skill invocation (for example `$save-omarchy-window-layout`,
`/save-omarchy-window-layout`, or Pi's `/skill:save-omarchy-window-layout`) or an explicit request
to use this skill. Loading the skill for review or installation does not authorize
capturing or changing the desktop.

This is an Omarchy/Hyprland workstation skill, available from any harness with
local shell access. It requires Python 3, `hyprctl`, and the existing
`~/.config/hypr/hyprland.lua` import `require("hypr.workspace-layout")`. Login
restoration also requires Bash, jq, uwsm, and the configured startup integration.
The script manages only the app classes and launch commands in its `APPS` map;
inspect that map when using a different workstation. If the prerequisites are
missing, report them rather than creating or replacing the desktop setup.

On explicit invocation, run the bundled capture script; do not ask the user to
restate window names, workspaces, or dimensions:

```bash
python3 scripts/save-layout.py
```

Resolve the script relative to the installed skill directory, regardless of the
current working directory. Use its absolute path when invoking it from elsewhere.
It captures the current Hyprland state for the managed apps and updates:

- `~/.config/hypr/workspace-layout.lua` for app-to-workspace rules
- `~/.local/bin/omarchy-workspace-startup` for launch order, tiled sizes, and the active workspace

The script creates timestamped backups, reloads Hyprland, validates `hyprctl configerrors`, and prints the saved layout. Report that compact output to the user.

If the script reports unmanaged windows, mention that only their class names were skipped. Never include window titles because they can contain private information.

If it fails, report the exact failure without replacing the user's Hyprland configuration manually.
