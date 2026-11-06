---
name: electron-app
description: Build and improve Electron desktop apps with secure process boundaries, native macOS behavior, deliberate text selection, and packaged-runtime verification. Use for Electron implementation and native desktop polish; release publication belongs to the desktop-release skills.
---

# Electron App

Build desktop software that respects platform conventions and keeps privileged
operations behind a small, validated interface. Preserve the project's renderer
framework, packaging tools, and supported operating systems.

## Establish the application

1. Inspect repository instructions, entry points, Electron version, preload,
   renderer, storage, tests, and packaging configuration. For new apps, confirm
   target platforms and choose a supported official scaffold; verify current
   commands and API compatibility in official documentation before using them.
2. Identify the affected journey and which process owns each operation. Keep
   windows, menus, OS integration, and privileged I/O in main; expose named
   capabilities in preload; keep presentation and interaction in the renderer.
3. For macOS targets, read [native behavior](references/native-behavior.md) and
   account for every row when building a new app. For a focused fix, apply the
   affected rows without silently redesigning unrelated features. Record any
   intentional product exception. For other platforms, use their own conventions
   rather than copying macOS window controls or shortcuts.
4. Read [selection and input](references/selection-and-input.md) before adding or
   changing app chrome, settings, navigation, or editors. Treat accidental text
   highlighting across controls as a defect, while preserving intentional copying.

## Build across the boundary

- Keep `nodeIntegration: false`, `contextIsolation: true`, and renderer sandboxing
  enabled. Use a restrictive production CSP and keep remote or untrusted content
  away from privileged preloads. Follow the installed Electron version's
  [security guidance](https://www.electronjs.org/docs/latest/tutorial/security).
- Expose one bridge method per capability through `contextBridge`, with typed
  arguments/results where the project uses TypeScript. Never expose raw
  `ipcRenderer`, arbitrary channels, shell commands, or unrestricted file access.
  Validate payloads, sender frame, expected window, and trusted loaded URL/origin
  in main. A matching origin alone is insufficient for opaque `file:` origins.
- Deny unexpected navigation and new windows. Parse and allowlist external URL
  schemes and destinations before `shell.openExternal`; reject privileged or
  executable schemes. Apply explicit permission handling to the app's sessions.
- Give subscriptions an unsubscribe function; strip IPC event objects from
  callbacks. Initialize window state after renderer readiness so early focus or
  theme events are not lost. Dispose listeners when windows or views close.
- Keep main responsive: move costly computation or blocking I/O off its event
  loop. Handle renderer failure with recoverable UI and protect unsaved work.
- Use durable user-data storage outside the install directory. Resolve bundled
  assets and preload paths in both development and packaged execution. Verify
  native modules against the actual Electron ABI and target architecture.

## Verify the desktop journey

Run the project's focused tests, type checks, build, and applicable packaging
checks. Exercise an actual Electron window when available; browser-only rendering
cannot prove native behavior. Use existing Electron automation where present.

Check the changed journey and one meaningful failure path, including invalid IPC
input where the bridge changes. Check the selection matrix in its reference and
applicable native-behavior rows. Repeat opening and closing secondary windows to
catch leaked listeners and duplicate handlers. Launch the packaged app to verify
assets, storage, and native integration independently of a development server.

On each supported platform, record what was actually exercised. If macOS or a
packaged artifact is unavailable, report that precise verification gap rather
than claiming native behavior passed. Add behavioral regression coverage for
non-trivial changes; avoid tests that only assert CSS strings or implementation
structure.

## Deliver within scope

Report changed process boundaries, native behaviors, checks performed, and exact
remaining runtime checks. Follow the repository's commit and PR instructions;
invoking this skill alone does not authorize publishing, pushing, or deployment.
For requested distribution work, use `public-desktop-release` or
`private-desktop-release` when available; otherwise follow the existing release
setup and official tooling docs within the user's authorization.
