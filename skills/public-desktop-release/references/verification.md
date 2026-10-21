# Verify the actual distribution path

Run the repository's tests, build, and release checks. Keep each evidence layer
separate; workflow success does not prove installation or updating.

## Artifact and public-access checks

- Inspect final signed app identity, team, version, hardened runtime, nested code,
  arm64-only Mach-O contents, and required resources.
- Validate signatures, notarization and stapled tickets where supported using
  Apple's tools such as codesign, spctl, and stapler. Do not disable Gatekeeper.
- Download installer and update assets from the published URLs without owner
  credentials. Verify checksums, sizes, update signatures, version and feed URLs.
  Check stable/prerelease routing and any external feed independently.

## Installation and isolation

Use the public installer on the target Apple Silicon machine. Verify ordinary
browser-download/quarantine behavior, installation into Applications, first launch,
version, icon, core functionality, permissions, quit/relaunch, and persistence.
Do not remove quarantine as a workaround or claim a curl-only launch proves the
normal downloaded-installer experience.

When installation is authorized, preserve the existing app and user data, and
coordinate a running app's quit. Never overwrite an unrelated app with a similar
name. Use an isolated OS account or safe test profile for destructive scenarios.
Launch the source development app alongside production and verify distinct
identities, independent data, single-instance behavior, and no production updater
in development. Check applicable login-item and protocol registration behavior.

## Installed update

Use a real prior signed installation with compatible updater identity and trust.
Have it discover and download the newly published release through the actual
updater, then restart/install and verify the new version, preserved data, working
core behavior, and continued channel separation. Verify the no-update state and
recoverable network failure without disrupting the user's machine or public feed.
Exercise relevant quit/tray/background-task paths and unsaved-work handling.

For a first release with no signed baseline, verify installation and updater
configuration, but report the installed upgrade as unproven. If a complete update
test is required now, prepare a clearly identified signed baseline and controlled
feed with the user's authorization. Do not publish gratuitous public versions,
fake version success, or alter real user data merely to demonstrate an update.
A controlled-feed test is useful but is not proof of the public feed path.

## Handoff evidence

Record the source SHA, tag/version, CI and release URLs, installer/feed URLs,
artifact hashes, target architecture, signing/notarization results, installed
version and upgrade result. Link the release runbook from project agent docs.
Document commands and secret names, never secret values.

For any blocked stage, name the missing access, account step, hardware, baseline,
or failed check and the exact next action. Continue independent authorized work.
Do not claim completion for publication, installation, or updates without evidence.
