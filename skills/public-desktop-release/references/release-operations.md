# GitHub release operations

## Set up the repeatable workflow

Inspect the repository's existing release triggers and version source. Prefer its
healthy conventions; choose tag-driven or explicitly dispatched publication and
document the exact trigger. A pushed tag is not proof the workflow started.

1. Resolve an immutable tag to the intended full commit. Check tag/app version
   agreement, approved-branch ancestry, and successful required CI on that commit.
   If release CI supplies those gates, complete them before signing/publication.
   Checkout that commit, not the branch's later head. Preserve existing version
   schemes and update build ordering.
2. Install pinned tools with frozen lockfiles. Verify the runner's actual architecture
   and run applicable tests/build checks. Use an arm64 runtime for the signed smoke;
   cross-compilation alone does not prove the app runs.
3. Keep signing and publication out of untrusted PR jobs. Use least-privilege job
   permissions, trusted pinned actions under repository policy, and scoped secrets.
   Serialize publication; avoid cancelling a run halfway through public exposure.
4. Build, sign, notarize, and verify the final app, installer, and updater payload.
   Generate checksums and update signatures/metadata from the final bytes. Record
   commit, version, architecture, signing identity, sizes, and tool versions.
5. Stage all required assets in a draft release where the existing tooling permits.
   Ensure feeds cannot advertise incomplete or inaccessible payloads. Check asset
   names, metadata URLs, digests, signatures, and version before publication.
6. Publish the complete release, setting stable/prerelease/latest deliberately.
   Publish a separately hosted feed only after its payloads are publicly accessible.
   GitHub publication and feed/site deployment are separate completion checks.
7. Download public assets without authentication and verify their bytes and feed
   references. Verify any README/site download links and report the workflow result.

Do not bundle secrets, signing keys, local profiles, or private test fixtures in
public artifacts. Use GitHub Releases for installers rather than expiring CI
artifacts. Do not embed a publication token in the app. Public source licensing
and bundled third-party notices must be preserved; ask rather than invent a
license or change repository visibility.

## Routine release

Inspect current Git status, installed baseline, latest release, tags, version and
changelog. Complete intended source changes without replacing the installed app
with development builds. Run the project's version command and update its relevant
lockfile/build number and release notes; avoid unrelated version bumps.

Follow repository source-control rules. Push and tag only within current user
authorization. Trigger the documented release lane for the exact tested commit,
monitor using host-native workflow tools when available, and inspect the final
release and feed. Then perform the installed checks in verification.md.

If backend changes are required, verify backward compatibility with installed
clients and deploy them first within scope. Do not trigger unrelated website or
service deployments simply because the desktop version changed.

## Failures and retries

Identify the failing phase: tests, build, architecture, signing, notarization,
upload, metadata publication, or installed update. Capture safe diagnostics.
Use bounded retries for transient failures; query an existing notarization
submission rather than creating duplicates while it is still processing.

Retry unchanged source with the same tag and verified staged bytes where supported.
Reverify restored artifacts against recorded commit, hashes, and signatures. If an
existing release asset differs, stop instead of overwriting it. Never move a
published tag or silently replace bytes already advertised to clients. A source
change after publication needs a higher corrective version under project policy.

If publication was interrupted, inspect the live release and feed before retrying;
a failed workflow may already have exposed files. Repair missing publication only
when it preserves the verified immutable payloads. For a bad public release,
prepare a corrective release and explain mitigation options. Do not silently
delete releases or promise that withdrawing metadata rolls back installed apps.
