---
name: dependency-upgrade-major
description: Carry out major and other drastic dependency upgrades in JavaScript and TypeScript projects, such as framework, runtime, or toolchain majors, ESM-only switches, peer cascades, and security-sensitive packages, with a migration plan, code and configuration migrations, and full verification per group. Use when the user asks to upgrade to a new major version or to apply the drastic upgrades a scan flagged. Routine patch and minor updates use dependency-upgrade-minor.
---

# Dependency Upgrade (Major)

Upgrade packages across major versions, make the required code, configuration,
and data changes, and verify the result. Preserve existing features and behavior
unless the user explicitly requests a change. Never claim an upgrade cannot
break anything; explain what was verified and what remains unverified.

## Scope and authorization

Invoking this skill approves the upgrades in the requested scope: the named
packages, or every eligible major and drastic upgrade when no scope is given.
Drastic upgrades include:

- major versions of any package;
- framework, runtime, compiler, test runner, bundler, ORM, monorepo tool, or
  package-manager majors;
- switches to ESM-only in packages consumed by CommonJS code or CommonJS Jest;
- engine bumps beyond the deployed runtime, and peer cascades across packages;
- packages that affect authentication, sessions, cryptography, sanitization,
  uploads, or audit behavior;
- replacing a deprecated or abandoned package with its successor;
- upgrades that need data migrations, infrastructure changes, browser
  verification, or deployment ordering.

Still ask before running data migrations against shared or production systems,
deploying, publishing, pushing, or making a product-visible behavior change. Patch and
minor updates that need no migration belong to `dependency-upgrade-minor`; do
them here only when a group requires them. Packages that handle authentication,
sessions, cryptography, sanitization, uploads, or audit behavior always belong
here, including their patch and minor updates.

## 1. Understand the project

- Read the repository's agent instructions and relevant documentation.
- Check Git status and preserve existing user changes.
- Identify the package manager from the configuration and lockfile, and use it.
  Do not switch package managers or create a second lockfile.
- Inspect every package.json, including workspaces, and the runtime pins
  (`.node-version`, `.nvmrc`, `engines`, Dockerfiles, CI setup steps).
- Identify the framework, module format, build tools, scripts, tests, and CI.
- Note overrides, resolutions, and patches that constrain the upgrade. Do not
  remove or loosen them for other packages; report stale ones for
  `dependency-override-cleanup`. For a package this skill is upgrading, update,
  re-create, or remove its own patch or override as part of that group's
  commit, and say why. pnpm fails install on a patch that no longer matches. If
  that cannot be done safely, mark the package blocked and tell the user what
  is needed.

For reusable libraries, preserve appropriate `peerDependencies` ranges. Do not
blindly replace peer ranges with exact versions.

## 2. Establish a baseline

Run the available tests and the relevant build, type-check, and lint commands
before upgrading. Record existing failures so they can be separated from
problems the upgrade introduces. If the baseline fails, investigate enough to
understand it; do not present the final result as fully verified while relevant
failures remain. Never discard unrelated changes to get a clean baseline.

## 3. Select target versions

Check the live registry for versions and publish times; do not rely on
remembered versions.

- Select the latest stable version published at least 48 hours ago, or longer
  when the repository sets a stricter release-age policy. When the newest
  release is younger, select the newest eligible one and report the skipped
  release. When an urgent security fix is younger than the minimum age, explain
  the conflict and ask the user instead of overriding the policy.
- Exclude prerelease, nightly, canary, alpha, beta, and release-candidate
  versions unless the project intentionally uses that channel.
- Do not choose an older version merely to avoid migration work. If the latest
  eligible version cannot be used, explain the concrete blocker and the version
  retained or selected.
- Use exact versions for upgraded registry dependencies. Preserve workspace
  references, local paths, Git references, and aliases according to their
  purpose, and check aliased registry packages (`npm:<name>@<version>`) for an
  eligible exact version.

## 4. Plan each group before changing it

Group packages that must move together: a framework and its official plugins, a
library and its types package, a test runner and its adapters, a build tool and
its plugins, an ORM and its migration tool. Keep every workspace on the same
version of a shared package. Order groups so foundations (runtime, compiler,
framework) move before the packages that depend on them.

For each group, write a short migration plan before installing:

- breaking changes from the official release notes and migration guides between
  the locked and target versions;
- removed or renamed APIs, changed defaults, configuration and script changes,
  runtime or compiler requirements, and stored-data or schema migrations;
- the call sites affected, found by search rather than assumed;
- official codemods to run, and how their output will be inspected;
- the checks that will prove the group works, and how to roll it back.

## 5. Upgrade and migrate one group at a time

Update the manifests and the existing lockfile with the project's package
manager. With pnpm, pass an exact version with `--save-exact`; a tag or range is
otherwise saved as a caret range.

When a dependency uses a pnpm catalog (`catalog:` or `catalog:<name>`), update
the version in the catalog in `pnpm-workspace.yaml`, keep the `catalog:`
reference in every manifest, and run `pnpm install`. Do not use `pnpm add` for
it; that replaces the catalog reference in one package and splits the versions.

Do not:

- delete or regenerate the lockfile as a routine technique;
- use force or `--legacy-peer-deps` to hide compatibility problems;
- disable checks, weaken types, or skip tests to make the upgrade pass;
- change a test expectation unless the user confirmed the new behavior is
  intended and it is documented;
- add unexplained overrides or resolutions;
- run unreviewed remote migration scripts, or refactor unrelated code.

Resolve conflicts by fixing the underlying compatibility issue. Apply the
migration to code, configuration, scripts, tests, and documentation. Inspect
codemod changes before accepting them. Follow repository conventions, reuse
existing helpers, and update generated contracts such as `openapi.json` when an
API changes. Prepare and verify data or schema migrations in a local or
disposable environment only.

Verify each group before starting the next (step 6), then make one commit per
group with the repository's commit convention (`commit-message` when installed).

## 6. Verify each group and the final result

- Confirm installation succeeds, and that a frozen or immutable install accepts
  the manifests and lockfile.
- Inspect the resolved tree for peer conflicts, invalid packages, and unexpected
  duplicate versions.
- Run all available tests and the relevant type-check, lint, and production build
  commands, plus required repository checks. Compare with the baseline.
- For publishable packages, check the contents with a pack or dry-run command.
- Check security advisories and report unresolved findings.
- Exercise the affected behavior. For framework or UI upgrades, start the app and
  check affected flows in a real browser, using `use-chrome` when the user's own
  browser session is needed, and run the relevant end-to-end tests. For backend
  upgrades, exercise affected API, database, and integration paths safely.
- Add focused regression tests when a migration changes meaningful behavior or
  reveals a coverage gap. Do not add tests that only repeat the implementation.

Fix regressions the upgrade caused and rerun the affected checks. Passing tests
do not prove untested behavior; name unavailable browsers, integrations,
credentials, devices, or environments.

## 7. Review the final changes

Inspect the complete diff for unrelated edits, formatting churn, unexpected
package removals or lockfile changes, missing migrations or documentation,
disabled checks, weakened assertions, and accidental secrets or generated
artifacts. Give every package in scope an explicit outcome: upgraded, already
current, deferred by release age, or blocked with a concrete reason. Do not
report the task as complete while required migration work or upgrade-caused
failures remain.

## Output

Lead with a summary of the groups upgraded, deferred, and blocked. For each
group, copy this structure exactly, with a blank line between labels:

```markdown
**Package:** name or group, current → target

**Why it is drastic:** The breaking changes and what they touch here.

**Migration done:** The code, configuration, and data changes made.

**Verification:** The checks run and their results, including browser or E2E runs.

**Remaining risk:** Unverified paths, deployment ordering, and how to roll back.
```

Then list existing failures, skipped releases younger than 48 hours, overrides
or patches reported for `dependency-override-cleanup`, the commits created, and
the verification still required. Link a detailed report if the list is large.
