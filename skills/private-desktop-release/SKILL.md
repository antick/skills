---
name: private-desktop-release
description: Set up or operate private macOS desktop releases with Developer ID signing, Apple notarization, installers, licensed updates, device administration, and CI publication. Use for first-time distribution setup or a new private release, especially Electron apps; not for Mac App Store submission.
---

# Private Desktop Release

Create a repeatable private distribution system, or release through an existing
one. The outcome is an installable signed app, access-controlled updates, and
honest evidence that the installed update works. Signing and notarization alone
do not provide licensing, download privacy, or device administration.

## Choose the task

- **First setup or repair:** inspect the app, fill the missing parts, and verify the
  complete path. Read all references relevant to the missing parts.
- **Routine release:** inspect the existing runbook and current configuration, then
  use [release operations](references/release-operations.md) and
  [verification](references/verification.md). Reuse healthy Apple/storage setup.
- **Planning or diagnosis only:** produce the requested plan or findings without
  changing accounts, publishing, installing, or blocking devices.

Read repository instructions and Git status first. Preserve user changes and
follow the repository's commit policy unless the user overrides it. A skill
invocation does not itself authorize pushes, publication, account/legal actions,
production migrations, credential revocation, or availability tests. Honor scope
already authorized in the conversation; do not ask again for the same action.
Prepare concrete reviewable changes before requesting any missing approval.

## Map this app before building

Record a short release plan with the actual values and open decisions:

| Area | Inspect or decide |
| --- | --- |
| App | Framework, packager/updater and installed versions, bundle ID, executable, current version |
| Toolchain | Desktop and root package managers/lockfiles, Node/runtime pins, CI architecture |
| Channels | Production vs development identity, profiles, endpoints, installed users and update compatibility |
| Distribution | Requested OS/architectures, DMG/ZIP or existing formats, private audience |
| Access | Existing licensing/accounts, device seats, update entitlement, offline policy, admin controls |
| Services | API/database, private object storage, download page, release publication path |
| Apple | Correct personal/organization team, usable signing identity, notarization credentials |
| Automation | Repository, protected branch/environment, CI gates, immutable tag convention |
| Evidence | Existing installed baseline, safe test device/account, tests and release records |

Do not copy another app's domains, team IDs, keys, bucket, license policy, paths,
versions, package manager or runner label. For example, Feather's desktop may use
pnpm even when its root uses Bun; inspect both. Reuse its actual stack and account
model. Keep legitimate existing installations working when changing contracts.

Do not assume Electron. Keep another framework's signing/update integration and
consult its official docs; apply the same authorization and artifact invariants.
Verify version-sensitive packager options against installed source/schema and
current official documentation. Do not upgrade dependencies merely to copy an
example from newer documentation.

## Implement the missing layers

1. [Apple setup](references/apple-setup.md): create or reuse the signing identity,
   configure notarization and CI secrets, validate the correct team.
2. [Private access and administration](references/private-access.md): enforce
   licensed installer/feed access, private storage, device policy and audit history.
3. [Desktop integration](references/desktop-integration.md): separate development
   identity, package native resources, implement the update state and quit lifecycle.
4. [Release operations](references/release-operations.md): automate exact-commit
   CI, signing, verification, immutable publication and resumable retries.
5. [Verification](references/verification.md): test policy failures and the real
   installed update, then hand over a project-specific runbook.

Reuse existing modules and service boundaries. Add migrations and API contracts
where needed; admin UI is a client of server policy. Implement sensible failure
states instead of a happy-path-only demo. Carry out authorized independent work
while waiting for account access or another genuine external prerequisite.

## Required handoff

Leave the target project with working automation, documented secret *names*, a
release procedure linked from its agent instructions, and an acceptance record.
Separate implemented, locally tested, hosted-tested, production-published and
installed-tested results. Include concrete gaps and the next action for each.

Normal releases should require a version, verified source, tag and workflow run,
not repeated Apple setup. Do not publish extra versions just to demonstrate that
updating works. Test the prior installed release against the next real release;
if no signed baseline exists, prepare an agreed signed test baseline first.

Use [adaptation examples](references/adaptation-examples.md) to check that this
workflow fits the user's app and request. These are decision examples, not
permission to operate the named repositories or production systems.
