# Desktop packaging and update behavior

Use this reference for Electron implementations. For another framework, preserve
its updater and translate these invariants using its official documentation.

## Keep development independent

Give development a distinct app name/bundle ID, user-data directory, keychain
namespace, single-instance identity and any app-specific filesystem root. Check
protocol handlers, login items and update channels too. Production must not accept
development license bypasses or arbitrary service/feed overrides. Test both apps
running at once; development should neither replace production nor consume its
license/profile. Do not migrate or erase existing profiles casually.

## Package the real runtime

Inspect the installed Electron/packager/Vite plugin versions and emitted main and
preload bundles. Keep native modules external to the JavaScript bundle and package
their native binaries/helpers for the target Electron ABI and CPU architecture.
Resolve runtime dependencies using the canonical packaged module location, not a
physical ASAR-unpacked path that changes a library's resource lookup.

A successful import is insufficient for native terminal support: spawn a real shell,
write a harmless command, observe output and exit. Verify database drivers, child
processes and other native features the app actually ships. Protect user data and
avoid testing arbitrary commands in their live project.

Use the installed packager's schema. A Vite/plugin combination may merge one option
namespace while ignoring another; inspect emitted external imports. Current online
electron-builder docs can differ from the installed major version (including signing
configuration and update-manifest signatures). Do not paste latest-major options
into an older app or silently disable newer verification requirements.

## Update controller

Keep privileged operations in the main process behind a narrow validated IPC bridge.
Use a single update controller to serialize check/download/install operations and
own event listeners. Define these states and their visible behavior:

| State | User behavior |
| --- | --- |
| Checking/current | Show truthful status; no dead click target |
| Available | Show target version and a download action |
| Downloading | Stable target/progress; prevent overlapping transfers |
| Ready | Offer restart and a Later action |
| Installing | Invoke the updater install/restart path once |
| Denied | Explain license/device/update-window policy and recovery |
| Failed | Safe error and bounded retry; retain accurate staged state |

Choose automatic checking/download policy with the product; do not copy another
app's five-minute timer or hidden-current button by default. A discoverable manual
check is useful when requested. Handle focus checks and startup checks without
clobbering active download state or producing a busy error for a normal user click.
Clean up listeners and timers; handle delayed native errors after the initial IPC
promise resolves.

For a download-then-restart UX, configure updater auto-download/auto-install-on-quit
behavior explicitly and test it. “Later” must match its wording: dismissing must not
unexpectedly invoke installation or restart. Native updater behavior on a later normal
quit can differ; document and test the pinned implementation instead of promising
that no later quit can install. Recheck online installation permission where required;
a low-level auto-install path must not bypass that policy.

## macOS restart trap

When using Electron's native updater, `quitAndInstall()` closes windows before the
ordinary `app.before-quit` path. Close-to-hide/tray handlers can therefore prevent
installation even though the download succeeded. Set the quitting state and perform
idempotent cleanup on native `autoUpdater.before-quit-for-update` as well as normal
quit. A wrapper's event surface may differ: inspect which emitter actually fires.
See [Electron's lifecycle documentation](https://www.electronjs.org/docs/latest/api/auto-updater/#event-before-quit-for-update).

Release terminal/DB/background resources without duplicate cleanup or indefinite
shutdown waits. Avoid a second generic relaunch after the updater already owns the
restart. In acceptance, observe process and on-disk version before using UI tooling
that might launch the app itself; otherwise a test can hide a failed automatic restart.

## Authenticity and transport

Preserve expected signing identity and bundle ID across updates. Use the updater's
signature/checksum and, where supported/required, signed-manifest verification.
A checksum from attacker-controlled metadata alone is not an authenticity boundary.
Keep signing keys separate from licensing proof keys; support deliberate rotation
with old-client compatibility when needed.

Read [the updater's documentation](https://www.electron.build/docs/features/auto-update/)
for the installed major version and inspect generated metadata. Do not ship a shared
private GitHub token to customers as a substitute for a licensed update service.
A DMG installs the app; macOS auto-updates commonly need a ZIP and associated
metadata/blockmap. Verify the exact requested formats rather than uploading only
the installer and claiming updates are ready.
