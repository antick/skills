---
name: github-actions-lock
description: Set up, verify, and maintain GitHub Actions workflow dependency lockfiles with gh actions-lock. Use for actions.lock onboarding, stale lockfiles, reviewed dependency updates, or lockfile verification in CI; security audits and general pipeline failures are separate tasks.
---

# GitHub Actions Lock

Make workflow action dependencies reproducible with a generated
`.github/workflows/actions.lock` and a CI check that verifies it.

## Establish scope and support

Read repository instructions, Git state, workflows, local/composite actions,
reusable-workflow calls, update-bot configuration, and any existing lockfile.
Check the target GitHub host and feature availability against current
[GitHub documentation](https://docs.github.com/en/actions/how-tos/secure-your-work/lock-workflow-dependencies).
The extension supports github.com and Enterprise Cloud data-residency hosts,
not Enterprise Server. If runtime lockfile support is unavailable, retain full
commit SHA pins and explain the limitation.

Use an authenticated `gh`. Install `github/gh-actions-lock` if needed for the
requested setup. Read `gh actions-lock --help` for the installed version before
choosing flags; the extension is pre-1.0. A verification-only request uses
read-only modes and leaves workflows and lockfiles unchanged.

## Generate or maintain the lockfile

Run from the repository root, scoped to named workflows when requested:

```sh
gh extension install github/gh-actions-lock  # only when missing
gh actions-lock
gh actions-lock --verify
```

- Review existing refs before locking them. Generation records current upstream
  code; it does not establish that the code is safe. Preserve the requested
  action versions rather than bundling unrelated upgrades.
- The generator can rewrite workflow refs to exact version tags. Review the
  entire diff, including changed commits and source repository identities.
  Generate the lockfile with the tool rather than editing it by hand.
- Plain runs preserve existing pins and resolve new dependencies. Rerun after
  workflow or action-dependency edits. Only a full-directory run prunes deleted
  workflow entries; report any workflows outside the requested scope.
- To advance moved refs, inspect upstream history and the proposed dependency
  change before using `--relock`. An unreachable locked commit, misleading SHA,
  or replaced repository needs investigation, not an automatic refresh.
  `--accept-moved` requires the user's informed decision after that investigation
  and must never run in CI or scheduled automation.
- Read each finding's remediation and linked documentation. Separate a stale
  lockfile from authentication, access, or network failures; retrying access
  errors does not justify changing dependency pins.

## Account for coverage boundaries

- External reusable-workflow calls at `jobs.<id>.uses` still need full SHA pins.
  Their action dependencies use the source repository's lockfile, so inspect
  source coverage separately.
- Workspace actions referenced by `./` are outside lockfile coverage. If they
  use remote actions, generation can block. Evaluate `--migrate-local-actions`
  only when running the action at the workflow commit (`$/`) preserves the
  intended behavior; `./` instead uses the checked-out workspace. If retaining
  `./`, follow GitHub's documented dependency-coverage procedure and report the
  exception. `--ignore-local-actions` alone does not supply missing runtime pins.
- Container images still need immutable digests; downloaded tools, runner images,
  inputs, and secrets are separate controls. Keep full SHA pins for uncovered
  remote action references.
- Check allowed-action policies: after onboarding they evaluate locked SHAs,
  so tag-only allowlist entries can stop matching. Report necessary policy
  changes without broadening account permissions as part of local setup.

## Add verification and updates

Adapt GitHub's current
[verification workflow](https://github.com/github/gh-actions-lock/blob/main/.github/workflows/verify-lockfile.yml)
to the repository's branches and CI conventions. Pin the extension installation
to a reviewed release, use minimal read permissions and
`persist-credentials: false`, and run `gh actions-lock --verify` on pull requests
and default-branch pushes. A scheduled verification can detect upstream changes.
The check should fail on blocking findings rather than silently regenerate pins.
Actions in other private repositories need a token that can read them; inspect
required scopes without printing credentials.

Preserve existing Dependabot or Renovate configuration. Enable GitHub Actions
updates when setup calls for it; confirm current lockfile support for the bot.
Dependabot maintains entries for onboarded workflows but does not onboard new
ones. Preserve update cooldowns. For existing zizmor checks, use a release with
lockfile support (v1.32.0 or newer) instead of suppressing pinning findings.
Organization-wide enforcement is a separate rollout from repository onboarding.

## Verify and report

Regenerate after adding the verification workflow, then run online
`gh actions-lock --verify` and available workflow lint/security checks.
`--verify-local` checks coverage offline and is not a substitute for online
verification. Review lockfile changes as executable dependency changes and keep
workflow edits and their lockfile in the same commit.

Report covered workflows, changed pins, uncovered dependencies, CI/update-bot
configuration, checks actually run, and access or platform limitations. Local
verification does not establish that hosted CI passed. Follow repository rules
for commits and PRs; installing this skill alone authorizes no repository changes.

## Sources

Based on GitHub's MIT-licensed
[gh-actions-lock skill](https://github.com/github/gh-actions-lock/blob/main/skills/gh-actions-lock/SKILL.md).
Consult the [extension](https://github.com/github/gh-actions-lock) for current
behavior and [lockfile enforcement guidance](https://docs.github.com/en/actions/how-tos/administer/enforce-workflow-lockfiles)
when planning a policy rollout.
