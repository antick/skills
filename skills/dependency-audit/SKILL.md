---
name: dependency-audit
description: Audit dependency freshness, support status, and security advisories across package manifests and lockfiles in every ecosystem, Docker images, GitHub Actions, and runtime or toolchain pins. Use when asked to find old packages, check dependency freshness, find end-of-life runtimes, or assess upgrade candidates. Read-only; applying upgrades uses dependency-upgrade-minor or dependency-upgrade-major.
---

# Dependency Audit

Report what is outdated, unsupported, or affected by a known advisory, and what
the smallest safe upgrade would be. Outdated does not mean vulnerable, and no
known advisory does not prove safety.

## Scope and boundaries

- Default to the whole repository, including nested workspaces, infrastructure,
  automation, and hidden configuration. Honor a narrower requested scope and
  trace its shared pins and consumers. No issue or pull request is required.
- Read the repository's agent instructions and follow its package-manager,
  version, release-age, and approval policies.
- Read-only. Do not update manifests or lockfiles, install packages or scanners,
  execute downloaded code, build, pull, or run images, change workflows, or open
  issues or pull requests. Use existing read-only tools and upstream metadata.
- Never expose registry credentials, secret values, or private URLs containing
  tokens in commands, diagnostics, or reports.
- When the user also wants upgrades, finish the inventory first. Package updates
  then use `dependency-upgrade-minor` or `dependency-upgrade-major`; other sources
  such as images, actions, and runtime pins use `code-build`. An audit request
  alone does not authorize changes.

## Discover dependency sources

Use `rg --files --hidden` and focused content searches. Include tracked files
that ignore rules would hide; exclude `.git`, installed dependencies, vendored
code, caches, and build output. Keep lockfiles in scope. Inspect real references
rather than assuming filenames are the whole inventory.

| Source | What to inspect |
| --- | --- |
| Package manifests and locks | Root and nested `package.json`, all dependency sections, resolved lock versions, workspace catalogs, overrides and resolutions, patches, Git or URL aliases, `packageManager`, and `engines`. Other ecosystems when present: Python, Go, Rust, Ruby, Java, .NET, PHP. |
| Containers | Every Dockerfile stage, external `FROM` and `COPY --from` images, tags and digests, build arguments, OS packages and tool downloads, Compose services, and image references in infrastructure code. |
| GitHub Actions | `.github/workflows/`, local and composite `action.yml`, remote actions and reusable workflows, `docker://` actions, job and service containers, setup-tool versions, matrices, runner images, and install or download commands. |
| Runtime and tool configuration | Version-manager files (`.node-version`, `.nvmrc`, `.tool-versions`, `.python-version`), package-manager configuration, infrastructure provider and module constraints and locks, deployment configuration, and hardcoded runtime or CLI versions. |

Resolve local reusable workflows, composite actions, Docker stage aliases, YAML
anchors, variables, and checked-in defaults to their source. Local paths and
`workspace:` dependencies are internal references, not outdated packages. For a
runtime-provided or private value that cannot be resolved safely, record the
location and mark the version unverified. Separate active references from
examples, fixtures, and historical documentation, and state the exclusions.

Record each external dependency's ecosystem, declared constraint or pin, resolved
version, digest, or SHA when known, direct or transitive role, and owning files.
Deduplicate upstream queries while keeping every consumer and divergent pin. For
transitive packages, keep the parent chain so the fix names the direct
dependency or override that controls it.

## Verify current versions and upgrade candidates

Check live official registries, image publishers, upstream release notes and
migration guides, support schedules, and maintainer advisories. Record the audit
date and link the evidence; never recall or guess latest versions.

- Distinguish the declared range, resolved lock version, newest stable release
  within the declared range, newest stable release overall, and recommended
  target. Check peers, runtime engines, platform support, and coupled framework
  and tool versions before calling a candidate compatible. For exact pins, name
  a compatible patch or minor candidate separately when one exists. Exclude
  prereleases unless the project uses that channel.
- Apply a 48-hour minimum release age (or the repository's stricter policy) to
  recommended targets. Show newer releases as deferred with their publish date.
  If an urgent security fix conflicts with the policy, explain the conflict and
  ask the owner rather than silently overriding it.
- For Docker, compare the right publisher, variant, architecture, and supported
  release line. Distinguish a newer version from a refreshed digest under the
  same tag. A tag such as `latest` or `22-alpine` does not prove a deployed image
  is current, and repository pins alone do not establish deployed image contents.
- For GitHub Actions, resolve each pinned commit against upstream release tags
  and commit evidence; version comments are only hints. Check the action's
  runtime and runner requirements, changed inputs and outputs, and upgrade notes.
  Recommend a verified full commit SHA, never replacing an immutable pin with a
  floating tag. Report ambiguous release mapping.
- For runtimes, database images, OS distributions, and toolchains, distinguish
  supported or LTS releases from the newest release and flag confirmed
  end-of-life. Cross-check package, Docker, CI, and deployment pins for drift.
- Match advisories to the actual resolved version and affected range. Include the
  advisory ID, severity, fixed version, affected consumers, and known
  applicability. Keep unverified reachability separate from a confirmed version
  match. Explain deprecated packages and their replacement or migration needs.
- Account for overrides and patches before recommending a transitive upgrade or
  removal. Prefer a supported parent upgrade; do not recommend blanket overrides
  that ignore peer or runtime compatibility. Stale entries belong to
  `dependency-override-cleanup`.

Use the smallest sufficient read-only queries, batching repeated lookups. Check
exit status and returned data: an outdated or audit command may exit nonzero for
findings, while authentication, registry, or parse failures are coverage gaps.
Unavailable tools or network access do not make dependencies current.

## Output

Lead with the most useful findings in plain language, then the audit date,
scope, and coverage by source category. Prioritize confirmed security issues and
unsupported releases, then compatible updates, then migration-heavy upgrades.
Do not assign security severity merely because a version is old.

Use a concise table with dependency and source, declared and resolved versions,
latest within range and latest overall, recommended target, the skill that would
apply it (`dependency-upgrade-minor`, `dependency-upgrade-major`, or `code-build`),
and the reason. Use `unknown` or `not applicable` where appropriate. Include
exact file locations and upstream evidence links; group duplicate consumers
without hiding them.

For findings that need explanation, copy this structure, with a blank line
between labels:

```markdown
**Issue:** What is outdated, unsupported, vulnerable, or unresolved, with evidence.

**Impact:** Why it matters here, including compatibility and exposure limits.

**Solution:** The smallest upgrade or investigation, affected files, migration needs, and the checks required before treating it as safe.
```

Separate confirmed findings, release-age deferrals, and verification gaps. List
sources checked with no findings and sources not checked. Never claim a complete
audit while a discovered source category remains unassessed. End by stating that
the audit made no changes.
