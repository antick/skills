# App separation, signing, and updates

## Separate development from the installed app

Keep the released app's existing identity. Give development a distinct display
name, bundle ID, visual indicator/icon, and application-data directory before the
framework initializes storage. Separate caches, logs, credential/keychain service
names, local sockets, single-instance locks, URL schemes, and login items where
used. Avoid registering development as the production protocol handler.

Development runs from source and must not consume or install production updates.
Release packaging must not include dev servers, debug endpoints, or dev updater
configuration. Verify both apps can run together and retain their own state.
Do not move, erase, or silently migrate the user's production data for testing.
Prefer the framework's supported data-path overrides; never repurpose HOME.

## Apple setup

Inspect existing identities and reuse the correct Developer ID Application
certificate and team. An Apple Developer membership alone does not prove a usable
certificate/private key or notarization credential exists. Use direct distribution,
not Mac App Store signing. Verify current requirements in Apple's documentation:

- https://developer.apple.com/developer-id/
- https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution

Configure the installed packager's supported hardened-runtime and entitlement
settings. Sign nested helpers, frameworks, native modules, and the final app in
the correct order. Do not use blanket deep-signing or disable validation to hide
incorrect packaging. Keep entitlements limited to the app's actual needs.

Store CI signing material and notarization credentials in GitHub secrets or an
approved secret store, never the repository. Use an isolated temporary keychain
on the runner, scoped access, and cleanup on failure. Reuse Apple's supported
notarization credential method; do not rotate healthy credentials unnecessarily.
Submit using supported tooling, wait for acceptance, inspect rejection details,
and staple/validate supported app and installer artifacts. A ZIP cannot itself
be stapled: package the correctly prepared app and follow the packager's sequence.
Never modify signed contents or regenerate an update payload after hashing it.

## Architecture and installers

Build a production arm64 app and a normal macOS installer, usually DMG, plus the
payload required by the existing updater. Check every shipped Mach-O binary,
including helpers, frameworks, native modules, and updater components, for arm64
and absence of x86_64 slices. A packager's arm64 flag is not sufficient evidence.
Use supported arm64 dependencies or rebuild them when needed. Do not strip a
signed dependency after signing; rebuild/re-sign and reverify the final bundle.

Include the real app icon, version/build metadata, bundled resources, Applications
installation affordance, and minimum macOS requirement. Keep installers and update
payloads generated from the same verified app. Do not omit ZIP/feed assets just
because the DMG installs successfully.

## Updater integration

Use the framework's maintained updater and verify APIs against the installed
version and official docs. Examples of relevant documentation:

- Electron: https://www.electron.build/auto-update/
- Sparkle: https://sparkle-project.org/documentation/publishing/
- Tauri: https://v2.tauri.app/plugin/updater/

Electron with electron-updater commonly needs DMG, ZIP, and generated macOS update
metadata. Sparkle uses an appcast and signed update payloads. Tauri uses its own
signed updater artifacts and endpoint contract. Preserve the chosen integration;
do not combine incompatible metadata or assume Apple signing replaces updater
signatures. Keep private updater keys secret and embedded public trust keys stable.

Public clients must download without a GitHub token, owner login, or private API
key. Keep stable and prerelease channels distinct. Version/build ordering must
match updater semantics and prevent accidental downgrades.

Implement Check for Updates and clear checking, current, available, downloading,
ready-to-restart, and failure states. Reuse existing UI and state modules. Handle
offline/rate-limit/download failures with a recoverable message. Coordinate
restart/install with unsaved work, background tasks, windows, and tray quit logic;
prevent duplicate downloads and development-triggered installs. Keep the app usable
when the update service is unavailable.
