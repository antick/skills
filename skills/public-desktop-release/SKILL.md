---
name: public-desktop-release
description: Set up or operate public desktop releases through GitHub Actions and GitHub Releases, with signed installers, automatic updates, and separate production and development apps. Defaults to notarized Apple Silicon macOS apps; use for end-to-end open-source distribution or a routine public release, not private licensing or App Store submission.
---

# Public Desktop Release

Turn the project into a properly installed, signed app that users can download
publicly and update, while the owner develops a separate app from the codebase.
Complete the authorized work through installation and verification; do not stop
at a proposal, generated workflow, or successful build.

## Scope and working defaults

- **Plan only:** if asked how this would work or to discuss first, inspect the
  project and explain the concrete setup without changing or publishing anything.
- **Set up and release:** implement missing pieces, run checks, publish and install
  within the user's authorization, and verify the complete path.
- **Routine release:** reuse healthy signing, packaging, and updater setup. Read
  [release operations](references/release-operations.md) and
  [verification](references/verification.md); avoid rebuilding the distribution system.

Default to public GitHub Releases and macOS **arm64 only**: no Intel or universal
builds. Preserve other existing platform support; do not silently add it to this
release or remove it from the project. Honor explicit platform overrides and use
that platform's official signing, packaging, and update guidance.

Use the existing framework, whether Electron, Tauri, Swift/Sparkle, or another
stack. Do not add private licensing, device seats, a paid download service, or an
App Store submission. Public source does not imply permission to change repository
visibility or publish unrelated assets.

Respect repository instructions, local changes, and authorization already given.
An explicit request to set up, publish, and install authorizes those steps; do not
ask again merely because they affect GitHub or the local installation. A bare
skill invocation or planning request does not authorize publication. Finish
independent work and prepare a concrete result before asking for genuinely missing
approval. Never treat sample prompts in this file as current authorization.

When account work needs a browser, use the user's **existing main Chrome session**,
not a new profile or separate login browser. If it is inaccessible, explain the
specific connection or login needed; continue independent work. Let the user
complete login, MFA, purchases, or legal agreements. Use available private secret
entry or secure local tooling; never request secrets in chat or print them.

## Inspect before choosing implementation

Read repository instructions, Git status, release docs, workflows, package/build
configuration, and updater code. Identify:

- Framework and installed tool versions; package managers and separate lockfiles.
- Public repository and release destination, default branch, current tags, version
  source, previous release, and installed baseline.
- Production bundle ID/name, signing team, updater trust keys, feed URL, minimum OS,
  installer formats, and existing compatibility promises.
- Dev identity, data directories, credentials, ports, protocols, login items,
  single-instance locks, and update behavior.
- Existing Apple signing/notarization credentials and GitHub permissions by name
  or presence only; do not dump their contents.

State the intended setup briefly, then act when implementation was requested.
Infer routine choices from the project. Ask only for missing decisions that change
identity, compatibility, access, or publication scope. Never copy another app's
IDs, team, URLs, credentials, version, or policy.

## Build and deliver

1. Read [app and signing setup](references/app-and-signing.md). Separate production
   and development, configure signing and notarization, and implement the updater
   using the installed stack's supported integration.
2. Read [release operations](references/release-operations.md). Build a repeatable
   GitHub workflow that binds the release to a tested commit and publishes complete,
   verified artifacts and update metadata.
3. Read [verification](references/verification.md). Verify the public download,
   installed production app, simultaneous development app, and installed update.
4. Leave a project-specific release runbook linked from its agent instructions:
   commands, secret names, version/tag rules, retry procedure, installer/feed URLs,
   and the next-release checklist. Include release notes and user installation,
   update, and minimum-system instructions in the project's existing docs/site.

Use shared configuration for channel identity and release values. Keep production
identity and updater trust stable across versions. Follow project test and API
contract rules. If dependencies are needed, pin exact compatible stable versions
at least 48 hours old, verify registry dates, and report any newer version skipped.
Do not upgrade unrelated dependencies for a release.

Report source commit, version/tag, workflow and release links, installer location,
architecture/signing checks, installation and update evidence, and concrete gaps.
Distinguish implemented, locally tested, hosted-tested, publicly published, and
installed-tested. Never describe an untested first-release updater as proven.
