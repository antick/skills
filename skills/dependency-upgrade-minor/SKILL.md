---
name: dependency-upgrade-minor
description: Scan JavaScript and TypeScript dependencies for patch and minor updates within each package's current major, classify each as safe or needing contained code changes, apply them when asked, and verify the project still works. Use when the user asks which packages can be updated, how risky routine updates are, or to apply non-major updates. Major and other drastic upgrades use dependency-upgrade-major; stale overrides and patches use dependency-override-cleanup.
---

# Dependency Upgrade (Minor)

Find which packages have patch or minor updates, decide how risky each one is,
and apply the ones that are worth doing now. Preserve existing features and
behavior. Never claim an update cannot break anything; report what was verified.

## Boundaries

- "Check", "scan", or "what can be updated" means report only. "Update" or
  "upgrade" authorizes Tier 1 and Tier 2 changes inside the requested scope.
- Stay within each package's current major. For a `0.x` package, the current
  minor counts as the major, so `0.3` to `0.4` is a major update. A major
  release, or any update classified as drastic below, is reported with a short
  note and left for `dependency-upgrade-major`.
- Do not remove or loosen overrides, resolutions, or patches as a side effect.
  Leave packages controlled by an override, resolution, or patch at their
  current version, and report them and any stale-looking entries for
  `dependency-override-cleanup`.
- Do not push, publish, or deploy unless the user asks.
- Use the project's existing package manager and lockfile. Do not switch package
  managers, create a second lockfile, or delete and regenerate the lockfile.
- Check Git status first and preserve existing user changes.

## 1. Understand the project

Read the repository's agent instructions and relevant documentation. Identify
the package manager, workspaces, runtime pins (`.node-version`, `.nvmrc`,
`engines`, Dockerfiles, CI setup steps), module format, test runner, and checks.
Unless the user narrows the scope, include `dependencies`, `devDependencies`,
and `optionalDependencies` across every workspace. Preserve `peerDependencies`
ranges in reusable libraries. Skip internal `workspace:` dependencies, local
paths, and Git references.

## 2. Establish a baseline

Run the available tests and the relevant build, type-check, and lint commands
before changing anything. Record existing failures so they can be separated from
problems the updates introduce. Never discard unrelated changes to get a clean
baseline.

## 3. Inventory

Use the package manager's machine-readable output, for example:

```bash
out="$(mktemp -d)"
pnpm outdated -r --format json > "$out/outdated.json"   # nonzero exit means updates exist
pnpm audit --json > "$out/audit.json"
```

Use the npm or Yarn equivalents when that is the project's manager. For each
package record the owning workspaces and dependency section, declared spec,
locked version, newest version within the current major, newest overall, the
publish date of each candidate, and whether it is direct or only transitive.
Registry, network, or authentication failures are coverage gaps, not "up to date".
Check overrides, resolutions, and patches for every candidate; a package they
control is reported, not updated. Check aliased registry packages
(`npm:<name>@<version>`) for an eligible exact version too.

A deprecated package needs a replacement, not a version bump. Handle only
trivial removals here, such as dropping an `@types/*` package once the library
ships its own types. Report any other replacement with the maintainer's
recommended successor for `dependency-upgrade-major`.

Group packages that must move together, such as a framework and its official
plugins, a library and its types package, a test runner and its adapters, a
build tool and its plugins, or an ORM and its migration tool. Classify and update
each group as one unit, and keep every workspace on the same version of a shared
package.

## 4. Select and classify

Check the live registry for versions and publish times; do not rely on
remembered versions. Select the newest stable release within the current major
that has been published for at least 48 hours, or longer when the repository
sets a stricter release-age policy. When an urgent security fix is younger than
the minimum age, explain the conflict and ask the user instead of overriding the
policy. Exclude prerelease, nightly,
canary, alpha, beta, and release-candidate versions unless the project already
uses that channel. When the newest release is younger than 48 hours, select the
newest eligible one and list the newer release as deferred with its publish date.

Read the changelog or release notes between the locked and target versions for
every candidate; do not infer risk from the version number alone. Check peer
dependency ranges, `engines` against the runtime pins, module format (a switch
to ESM-only breaks CommonJS consumers and CommonJS Jest setups), and TypeScript
type changes.

- **Tier 1, safe.** No breaking changes in the notes, peers still satisfied, same
  module format and engine range, or dev tooling whose configuration format is
  unchanged. Apply without code changes.
- **Tier 2, contained code changes.** A documented breaking change, such as a
  renamed option, changed return type, or deprecated API with a replacement,
  whose call sites are few, easy to find, and covered by tests. Apply with the
  code change and focused tests; the total change must stay reviewable.
- **Major or drastic.** A major version, framework or runtime platform change,
  ESM-only switch, engine bump beyond the deployed runtime, peer cascade across
  several packages, any update to packages that handle authentication,
  sessions, cryptography, sanitization, uploads, or audit behavior, a
  non-trivial deprecated-package replacement, anything needing data migrations or
  deployment ordering, or breaking changes spread across many call sites or
  without test coverage. Report it and point to `dependency-upgrade-major`.

When unsure between tiers, pick the higher one and say why.

## 5. Apply (only when asked to update)

Use exact versions for every updated registry dependency. Do not use caret,
tilde, wildcard, or `latest` specs; keep `peerDependencies` ranges in reusable
libraries. pnpm saves a tag or range as a caret range, so pass an exact version
with `--save-exact`, for example
`pnpm --filter <pkg> add --save-exact <name>@<version>` (`--save-dev` for dev
dependencies). Update manifests and the lockfile together.

When a dependency uses a pnpm catalog (`catalog:` or `catalog:<name>`), update
the version in the catalog in `pnpm-workspace.yaml`, keep the `catalog:`
reference in every manifest, and run `pnpm install`. Do not use `pnpm add` for
it; that replaces the catalog reference in one package and splits the versions.

1. **Tier 1, one commit.** Apply all Tier 1 updates together, then run the
   affected packages' lint, type checks, and unit tests. If an update fails,
   investigate: move it to Tier 2 and fix it there, or back it out and report it.
   Commit the remaining Tier 1 updates as a single commit.
2. **Tier 2, one commit per group.** Apply each group that needs code changes
   on its own: update it, make the code changes, add focused tests, run the
   affected checks, and commit it separately so it can be reviewed or reverted
   alone.
3. Regenerate generated contracts, such as an API specification, when an update
   changes an API surface, and include them in the matching commit.

Follow the repository's commit convention (`commit-message` when installed).

After the last group, rerun the security audit at the project's threshold and
confirm no new advisories.

Never change a test expectation just to make an update pass. A changed behavior
is a reason to move the update to `dependency-upgrade-major`. Do not use force,
`--legacy-peer-deps`, disabled checks, or weakened types to get past a failure.

## 6. Verify and review

- Confirm a frozen or immutable install succeeds, so manifests and the lockfile
  agree, and inspect the resolved tree for peer conflicts and unexpected
  duplicates.
- Run the tests and the relevant type-check, lint, and build commands. Compare
  with the baseline; fix failures the updates caused.
- Exercise affected behavior when an update touches runtime code paths.
- Inspect the full diff for unrelated edits, unexpected package removals or
  lockfile churn, disabled checks, weakened assertions, and accidental secrets.
- Give every dependency in scope an explicit outcome: updated, already current,
  deferred by release age, left for `dependency-upgrade-major`, or blocked with a
  concrete reason.

## Output

Lead with a summary: how many packages have updates, how many were (or can be)
updated in each tier, and the most important items left for the major workflow.

Then one table per tier with package or group, workspaces, current → target,
publish date, and the reason for its tier (cite the release-note entry). For
Tier 2, list the code changes made or required. Then list:

- major or drastic updates left for `dependency-upgrade-major`, one line each;
- deferred updates with their publish dates;
- overrides or patches that looked stale, for `dependency-override-cleanup`;
- coverage gaps and the checks that actually ran, with results.

Never describe an update as safe or tested if its checks did not run.
