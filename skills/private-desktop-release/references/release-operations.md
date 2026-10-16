# Release automation and routine publication

Set up once, then reuse. Adapt commands, tags and providers to the app. A desktop
release must not accidentally trigger unrelated web deployment or public hosting.

## Hosted workflow contract

Prefer the repository's existing CI conventions. For a new private release lane:

1. Accept a validated existing release tag through an explicit release trigger.
   Resolve its exact commit, require ancestry on the approved branch and successful
   trusted CI for that commit. Check package/tag agreement. Avoid races with a later
   branch head. Choose a currently supported runner and verify its actual architecture.
2. Install the project's pinned toolchain and frozen lockfiles, including a separate
   desktop package manager if present. Run release safety tests. Do not expose release
   credentials to untrusted PR code or bypass failed quality gates.
3. Use a restricted release environment and minimal workflow permissions. Provision
   signing secrets only for signing, storage credentials only where needed, and a
   narrowly scoped publication token for the internal release endpoint. Configure
   workflow concurrency so two releases cannot corrupt publication state.
4. Restore a complete private staging bundle for the same version/commit if one exists;
   otherwise build/sign/notarize/staple. Reverify restored bytes, signatures and proof
   binding before trusting them. Fail closed on a conflicting existing bundle.
5. Run the signed runtime smoke on the actual target architecture using a fresh
   disposable OS account or isolated hosted runner. Never wipe the owner's real
   profile to obtain a fresh first-launch test. Never add packaged license bypasses.
6. Verify final artifacts and record evidence: source commit, version, target, expected
   team/bundle identity, file sizes/digests, runtime result, and tool versions.
7. Atomically stage the exact verified artifacts/evidence in private storage before
   final publication. Do not expose private binaries through public CI artifacts or
   public GitHub releases. Keep this bundle while release retries may need it.
8. Upload final objects with conditional creation. Existing paths are acceptable only
   when immutable metadata and downloaded bytes match. Use read-back hashes/size checks
   before exposing metadata. The API publishes only after all required objects verify.
9. Clean temporary credentials even on failure. Retain secret-free diagnostics and
   evidence. Re-fetch published metadata and report the actual result.

An interrupted or partial upload must remain unavailable. Stream large verification
and restore downloads to private temporary files; enforce byte/time limits, cancel
failed transfers and remove incomplete files. Fit publication checks within the real
hosting request budget, or use a durable background job. Do not buffer huge bundles
or silently abandon half-completed work on a function timeout.

## New version, after setup

1. Inspect current source, installed baseline, package version, tags and release list.
   Complete intended changes in the development app; keep the production app intact.
2. Set the requested desktop version with the project's version command, regenerate
   its own lockfile, review the diff and run repository quality/release gates. Do not
   bump unrelated API/root versions or upgrade dependencies for a routine release.
3. Follow repository source-control policy. Push only when authorized, and wait for
   successful CI on the exact intended release commit.
4. Tag that commit using the project's immutable convention and dispatch the configured
   workflow. A pushed tag alone may not trigger the manual lane. Verify before acting.
5. Follow the workflow; re-fetch the live release and licensed installer result. Test
   previous-installed → new-installed through the app and record the launch event.
6. Report version, source, CI/release run, installer location, installed result and gaps.
   Update the app's runbook/agent notes and backlog when procedures or scope change.

Example only, **after** selecting the repository, exact successful commit, tag and
workflow and receiving required publication authorization:

```sh
git tag "$release_tag" "$release_commit"
git push origin "refs/tags/$release_tag"
gh workflow run "$release_workflow" --repo "$release_repo" --ref "$release_branch" -f "tag=$release_tag"
```

These variables are not preconfigured. Resolve actual values and the workflow input
name from the repository. Do not invent script names or run illustrative version
numbers. No Apple dashboard work is normally required: the workflow reuses its
certificate/key and automatically performs signing and notarization.

If a desktop version depends on API/database/portal changes, deploy and verify those
first within authorization, preserving compatibility with installed clients. Keep
service and desktop deployment workflows distinct. Do not create an App Store app
record or submit App Store builds for a private Developer ID release.

## Failures and retries

Classify the failed step before acting: credential/permission, packaging, runtime,
signing, notarization submission, ticket propagation, storage or publication.
Capture allowlisted operation names and exit/status codes, not raw secret-bearing
arguments or environment dumps. Inspect Apple's rejection details securely when
notarization fails; a rejection is not a transient network failure.

Use bounded retries with backoff and an overall deadline for plausible transient
failures. For a submitted notarization still processing, retain its submission ID
and query it instead of repeatedly resubmitting. Preserve a final failure as a
failure; never waive Gatekeeper, ticket validation, hashes or runtime checks.

Retry unchanged source using the same tag/commit and staged exact bytes. Do not bump
the version because Apple or storage was briefly unavailable. If code must change
after an immutable release tag was created, follow the established tag policy; do
not move tags or overwrite published objects. Explain why a higher corrective
version is needed before proceeding. Never silently reuse old evidence for new bytes.

Pause a faulty published release only within authorization. Preserve release/audit
history, first-publication time and object identity. Pausing prevents new grants;
issued URLs remain usable until expiry and downloaded bytes cannot be recalled.
Ship a higher corrected release for clients already on a broken version. Do not
promise a server-side pause will roll their installed app back.
