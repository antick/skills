---
name: upgrade-dependencies
description: Upgrade package.json dependencies to the latest eligible stable versions, handle breaking changes and migrations, and verify that the project still works. Use when the user asks to update, upgrade, or modernize dependencies in a JavaScript or TypeScript project.
---

# Upgrade Dependencies

Upgrade the project's dependencies, make any required code or configuration changes,
and verify the result. Preserve the project's existing features and behavior unless
the user explicitly requests a change.

Do not claim that an upgrade cannot break anything. Explain what was verified and
any remaining gaps.

## 1. Understand the project

Before making changes:

- Read the repository's agent instructions and relevant documentation.
- Check Git status and preserve existing user changes.
- Identify the package manager from the repository configuration and lockfile.
- Inspect all package.json files, including workspace packages.
- Identify the application's runtime requirements, framework, build tools, scripts,
  tests, and CI checks.
- Look for overrides, resolutions, patches, and dependencies that must stay
  compatible with each other.

Use the project's existing package manager. Do not switch package managers or create
a second type of lockfile.

Unless the user specifies a narrower scope, include dependencies, devDependencies,
and optionalDependencies across the project.

For reusable libraries, preserve appropriate peerDependencies compatibility ranges.
Do not blindly replace peer ranges with exact versions.

## 2. Establish a baseline

Run the available tests and the relevant build, type-check, and lint commands before
upgrading.

Record existing failures so they can be distinguished from problems introduced by
the upgrade.

If the baseline fails, investigate enough to understand the failure. Continue
independent upgrade work when possible, but do not present the final result as
fully verified while relevant failures remain unresolved.

Never overwrite or discard unrelated changes to obtain a clean baseline.

## 3. Select target versions

Check the live package registry for release versions and publication times. Do not
rely on remembered versions.

For each dependency:

- Select the latest stable version that has been published for at least 48 hours
  at the time of the check.
- If the newest stable release is younger than 48 hours, select the newest eligible
  stable release and report the skipped release.
- Exclude prerelease, nightly, canary, alpha, beta, and release-candidate versions
  unless the project intentionally uses that release channel.
- Check supported runtime versions, peer dependencies, and compatibility with
  related packages.
- Read official release notes and migration guides for breaking changes, required
  migrations, or important behavior changes.

Use exact versions for registry dependencies being upgraded. Do not use caret,
tilde, wildcard, or "latest" specifications.

Preserve workspace references, local paths, Git references, and package aliases
according to their existing purpose. Check whether aliased registry packages need
an eligible exact version.

Do not choose an older version merely to avoid migration work. Investigate whether
the required migration can be completed within the project.

If the latest eligible version cannot be used, explain the concrete blocker and
the version retained or selected.

## 4. Plan compatible upgrades

Group packages that need to move together, such as:

- A framework and its official plugins.
- A library and its types package.
- A test runner and its adapters.
- A build tool and its plugins.
- An ORM and its migration tools.

Upgrade in manageable groups so failures can be traced to their cause.

Identify required changes before installing, including:

- Removed or renamed APIs.
- Changed defaults or behavior.
- Configuration and script changes.
- Runtime or compiler requirements.
- Database or stored-data migrations.
- Build, test, and CI changes.

Proceed with the work authorized by the user's upgrade request. Ask for clarification
only when a required decision materially changes product behavior, scope, or a
destructive operation.

## 5. Upgrade and migrate

Update the manifests and regenerate the existing lockfile using the project's
package manager.

Keep unrelated manifest fields and scripts intact unless the upgrade requires
a change.

Do not:

- Delete the lockfile as a routine upgrade technique.
- Use force or legacy-peer-deps to hide compatibility problems.
- Disable checks, weaken types, or skip tests to make the upgrade pass.
- Add unexplained overrides or resolutions.
- Perform unrelated refactoring.
- Run unreviewed remote migration scripts.

Resolve dependency conflicts by fixing the underlying compatibility issue.

Apply necessary migrations to code, configuration, scripts, tests, and
documentation. Inspect official codemod changes before accepting them.

Preserve existing user-visible behavior, stored data, and public contracts.

Follow repository conventions:

- Reuse existing components, utilities, and configuration.
- Put shared constants and formatting in appropriate common files.
- Keep code files within the repository's size limits.
- Update openapi.json if an API endpoint or contract changes.

Prepare and verify database or stored-data migrations in a safe local or test
environment. Do not apply production migrations, deploy, publish, or push unless
explicitly authorized.

## 6. Verify the result

After upgrading:

- Confirm installation succeeds with the updated lockfile.
- Use the package manager's frozen or immutable install mode to check that the
  manifests and lockfile agree.
- Inspect the resolved dependency tree for peer conflicts, invalid packages, and
  unexpected duplicate versions.
- Run all available tests and the relevant type-check, lint, and production build
  commands.
- Run required repository-specific checks.
- For publishable packages, verify package contents with the appropriate pack or
  dry-run command.
- Check relevant security advisories and report unresolved findings.

Exercise the application behavior affected by the upgrades.

For UI or framework upgrades, start the application and verify affected flows in a
real browser when available. For backend upgrades, exercise affected API, database,
and integration paths in a safe environment.

Add or update focused regression tests when migrations change meaningful behavior
or reveal a coverage gap. Do not add superficial tests that only repeat the
implementation.

Fix regressions introduced by the upgrade and rerun the affected checks.

Passing tests does not prove untested behavior. Clearly identify unavailable browser
checks, integrations, credentials, devices, or environments.

## 7. Review the final changes

Inspect the complete diff for:

- Unrelated edits or accidental formatting churn.
- Unexpected package removals or lockfile changes.
- Missing migrations or documentation.
- Disabled checks or weakened assertions.
- Accidental secrets or generated artifacts.

Confirm that every dependency in scope has an explicit outcome: upgraded, already
current, skipped because of release age, or blocked with a concrete explanation.

Do not describe the task as complete if required migration work or upgrade-caused
failures remain unresolved.

## 8. Report the outcome

Give a concise summary covering:

- Dependencies upgraded and significant version changes.
- Required code, configuration, or data migrations completed.
- Verification performed and its results.
- Existing failures and remaining verification gaps.
- Dependencies retained or blocked, with reasons.
- Whether any latest releases were skipped because they were less than 48 hours old.

Link a detailed report if the dependency list is large.
