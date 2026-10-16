# Verification and handoff

Choose evidence appropriate to the scope. A documentation-only change does not
require a real release. First-time implementation requires all applicable layers;
a routine release reruns its gates and installed acceptance without unnecessarily
repeating credential issuance or disruptive production policy tests.

## Automated policy tests

Exercise valid, absent, expired and revoked credentials; private grant missing;
update window boundaries; app block vs update-only block; deactivation; seat races;
wrong installation/product/platform/architecture; replay; paused release; invalid
manifest/object path; checksum/proof tampering; interrupted and expired downloads;
explicit online denial vs transient outage; offline expiry and clock changes.

Test roles on the server, not just hidden admin buttons. Verify installer lookup
consumes no seat, activation does, and history cannot cross customer boundaries.
Simulate failures between upload, verification and publication to prove partial
releases stay unavailable and retries preserve identity. Test update controller
concurrency, Later/restart and native shutdown ordering with meaningful regressions.

## Final artifact gate

Run the installed project's signing/verification commands against the exact final
files. Common macOS inspection commands (substitute the actual app path):

```sh
codesign --verify --deep --strict '/path/to/App.app'
codesign -dv --verbose=4 '/path/to/App.app'
spctl --assess --type execute --verbose=2 '/path/to/App.app'
xcrun stapler validate '/path/to/App.app'
xcrun stapler validate '/path/to/App.dmg'
```

Check expected team and bundle identity, hardened runtime, entitlements and target
architecture. Assess the DMG using the applicable disk-image/Gatekeeper command
for that macOS version. Validation is distinct from signing: do not use `--deep`
as a substitute for correctly signing nested components in build order.

Extract the updater ZIP and mount the DMG read-only. Compare app bytes, modes and
symlinks with the verified signed app; reject path traversal when extracting.
Hash all final artifacts after notarization/stapling and bind evidence to the source
commit. Detach mounts and clean only task-owned temporary paths. If unmount fails,
leave the mount/path for inspection instead of deleting through it.

## Runtime and installed acceptance

1. In an isolated account, launch the exact signed app without dev overrides. Verify
   production identity, accountless/license-gated behavior if applicable, blocked
   privileged operations, resources, native functions and clean quit/restart.
2. With permission to install, install the stapled DMG into Applications. Test normal
   downloaded/quarantined installation as well as command-line assessment; do not
   remove quarantine to bypass an issue. Activate with a test/owner license privately.
3. Preserve a known benign item of local data and verify normal quit/relaunch. Run
   the production and development apps together and confirm distinct profiles.
4. From an older signed installed baseline, find the new eligible release through
   the real private feed. Download; verify progress and ready state; choose Later;
   reopen the prompt and choose Restart once.
5. Observe that the updater itself replaces and relaunches the app. Check on-disk
   version and running process **before** any automation call that could launch it.
   Manual Quit, app launch or bundle copy cannot count as automatic restart proof.
6. Verify version, data, license state and an actual native operation after restart.
   Confirm authorized-download and client-reported-launch events in admin.
7. On explicitly authorized devices, exercise app/update blocks separately and
   recover access. Always attempt restoration and read it back, even after failures;
   report any restoration failure immediately. Prefer isolated test fixtures for
   wider denial/revocation checks rather than disrupting unrelated users.
8. Remove only temporary acceptance content and clear secret-bearing forms/results.
   Keep useful evidence without license keys, private URLs or unrelated user data.

Do not claim all platforms work from one arm64 Mac. Record which architectures and
OS versions actually ran. Time-bound offline tests can verify boundaries in code;
label a real elapsed-duration test unperformed when it was not run.

## Project deliverables

Leave these in the target project's existing structure:

- Release configuration and reusable build/verify/publish helpers, with secrets
  declared by name in examples and stored outside tracked files.
- API contracts/migrations, admin controls, installer page and desktop integration
  for the requested scope, with focused tests.
- A runbook linked from agent instructions: routine version/tag/CI steps, update UI,
  first-time Apple setup location, credential consumers, retries and incident recovery.
- An acceptance record: version/commit/target, CI and release links, artifact hashes
  and signature checks, actual installed behavior, admin read-back, remaining gaps.

Avoid claiming completion when a gate is blocked or only a mock passed. Explain the
specific missing credential, approval, service or test and complete independent work.
Do not make routine changes to an account just to produce another checklist tick.
