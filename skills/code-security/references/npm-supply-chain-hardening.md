# npm Supply Chain Hardening

Reduce the executable trust placed in dependencies and release infrastructure
while keeping builds reproducible. An audit request is read-only; a hardening
request authorizes relevant repository changes, not account changes or publishing.

## Inspect before executing

Read instructions, Git state, all workspace manifests, lockfiles, package-manager
configuration, lifecycle scripts, CI, and publish scripts before installing.
Record Node/package-manager versions and the actual manager used; npm registry
dependencies may be installed by pnpm or Yarn. Do not switch managers.

Trace direct and transitive dependencies, Git/tarball/file sources, registry scope
mapping, overrides, native binary downloads, and commands fetching remote tools.
Identify when untrusted package code runs beside credentials or write permissions.
Inspect configuration with secret values redacted; never dump complete auth files.

If compromise is suspected, stop executing affected packages. Preserve evidence,
identify exposed jobs and credentials by name, and propose containment. Do not
rotate tokens, delete caches/evidence, or test stolen credentials without approval.

## Apply controls that fit the toolchain

- Keep the lockfile and use the manager's frozen/immutable CI install. Review
  unexpected source, integrity, and transitive changes; never regenerate the whole
  tree simply to silence an audit warning.
- Configure private scopes explicitly to prevent unintended public-registry
  resolution. Verify registry hosts and lockfile destinations without exposing
  authentication. Integrity hashes detect changed bytes, not malicious intent.
- Review lifecycle scripts and downloaded executables. Use script restrictions or
  approval controls supported by the installed manager. Start restrictive in an
  isolated test install, inventory legitimate native/build requirements, then
  allow only justified execution. Do not globally disable scripts and assume the
  app still works, or approve every package to make installation pass.
- Keep install/build jobs away from deploy/signing/publish secrets. Grant writes
  only to the release job and pin third-party actions/tools appropriately.
- For dependency changes, check registry publication dates and official migration
  notes. Use exact direct versions at least 48 hours old, preserving intentional
  peer/workspace ranges. Document skipped newer releases and necessary overrides.
- Review package contents for secrets and unintended files. Inspect lifecycle
  hooks before even a pack dry run; packaging can execute code.

## Publishing, when in scope

Check supported trusted-publishing prerequisites, repository/workflow/environment
identity, release refs, and provenance generation/verification. Prefer short-lived
identity where supported. Provenance describes origin; it does not prove code is
safe. Account protections and credential revocation need explicit authorization.
Prepare a concrete change before asking; do not request replacement tokens when
an existing authorized credential is available. Never publish as a verification step.

Use current official [npm configuration](https://docs.npmjs.com/cli/using-npm/config/)
and [trusted publishing](https://docs.npmjs.com/trusted-publishers/) documentation,
plus the installed package manager's docs. Verify version support rather than
copying flags from another manager or release.

## Verify and report

In a disposable directory with no production credentials, perform a clean frozen
install under the new policy, build native dependencies, run tests/type/lint/build
checks, and inspect package contents. Confirm blocked scripts remain blocked and
approved build paths work. Use advisory and signature checks where supported;
classify unresolved findings by reachable impact rather than scanner count alone.
Report changed controls, legitimate exceptions, installation/build evidence,
publication checks not exercised, and any account actions awaiting authorization.
