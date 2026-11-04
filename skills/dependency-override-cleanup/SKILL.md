---
name: dependency-override-cleanup
description: Find stale or harmful dependency overrides, resolutions, patched dependencies, and audit waivers in JavaScript projects, explain why each entry exists, prove which can be removed, and remove them when asked. Use when asked which dependency pins, overrides, resolutions, patches, or advisory waivers are stale or can be cleaned up. Reports only unless asked to clean up; package updates use dependency-upgrade-minor or dependency-upgrade-major.
---

# Dependency Override Cleanup

Dependency workarounds are added for a reason that can expire. Find the entries
that no longer serve a purpose, and the ones that now cause harm, such as an
override that forces a package older than its consumer requires.

| Package manager | Where the workarounds live |
| --- | --- |
| pnpm | `overrides`, `patchedDependencies`, and `auditConfig` ignores in `pnpm-workspace.yaml` (older pnpm versions also read the root `package.json` `pnpm` field); patch files under `patches/`. The bundled script supports lockfile version 9 |
| npm | `overrides` in the root `package.json`; `patch-package` patches |
| Yarn | `resolutions` in the root `package.json`; `.yarn/patches` and `patch:` protocol entries |

## Modes and boundaries

- "Check" or "audit" means report only. Do not edit manifests, lockfiles, or
  workspace files in the user's checkout during discovery. Simulations run only
  in a separate scratch worktree in a temporary directory, removed afterwards.
- "Clean up" authorizes removing the entries the report proves removable, after
  the report is complete. Changing or raising an entry, or removing one that is
  uncertain, needs the user's confirmation for that entry.
- Read the repository's agent instructions and its dependency, release-age, and
  verification policies first.

## 1. Inventory and purpose

1. Ensure dependencies are installed with a frozen lockfile.
2. For pnpm, run the bundled `scripts/check-overrides.mjs` from the workspace
   root. `<this-skill>` below is the path of this skill's installed folder.

   ```bash
   out="$(mktemp -d)"
   node <this-skill>/scripts/check-overrides.mjs > "$out/override-audit.txt"
   ```

   It reads pnpm's resolved configuration, every installed package's declared
   ranges, and the lockfile, and classifies each override:

   | Status | Meaning |
   | --- | --- |
   | `REDUNDANT` | Every consumer's declared range already excludes versions below the target. Removal candidate. |
   | `NO_CONSUMERS` | Nothing in the graph matches the selector. Removal candidate. |
   | `FLOOR_STILL_NEEDED` | Some consumer still accepts older versions. Keep unless no older version is vulnerable. |
   | `FORCES_ABOVE_RANGE` | The target is newer than a consumer allows, usually a security bump the parent has not adopted. Keep until the parent widens its range. |
   | `DOWNGRADES_BELOW_RANGE` | The target is older than a consumer requires. Either stale (raise or remove it) or a deliberate compatibility pin. Always investigate. |
   | `UNCLASSIFIED` | The override value is not a semver range (alias, URL, or `link:`). Investigate by hand. |

   It also reports each patched dependency (still in the lockfile? latest
   upstream version and publish date) and each audit waiver. For npm and Yarn,
   apply the same classification by hand: compare each entry's target with the
   declared ranges of every consumer (`npm ls <name>`, `yarn why <name>`) and the
   locked versions.

3. Find why each non-redundant entry exists before judging it. Read inline
   comments next to the entry, then trace the commit that added it:

   ```bash
   git log --format='%h %ad %s' --date=short -S'<override key>' -- pnpm-workspace.yaml package.json
   ```

   Read that commit's message, linked issue, and any spec or decision record.
   Classify the purpose as a security floor, a compatibility pin (module format,
   engines, peer alignment), or a version alignment across a package family.

## 2. Simulate removal

For candidates, or for a full sweep when requested, measure what removal would
do in a scratch worktree, never in the user's checkout:

```bash
base="$(mktemp -d)"
scratch="$base/override-sim"
git worktree add --detach "$scratch" HEAD
(cd "$scratch" && pnpm install --frozen-lockfile)
node <this-skill>/scripts/check-overrides.mjs --simulate "$scratch" > "$base/override-sim.txt"
git worktree remove --force "$scratch"
rm -rf "$base"
```

For each override, the simulation removes it, re-resolves the lockfile, and
reports the versions now locked plus any advisories the audit did not report
before. `--lockfile-only` keeps already-locked versions where ranges allow, so
"no new advisories" alone does not prove a floor is unnecessary; combine it with
the range status from step 1. For npm or Yarn, remove the entry in the scratch
worktree, refresh the lockfile only, and compare the lockfile and audit output.

## 3. Verify every proposed removal

A clean audit is not enough. For each entry you recommend removing:

- Diff the lockfile after removal. List new or changed versions and their publish
  dates; each must be at least 48 hours old (or meet the repository's policy).
- Check the new versions for module-format changes (ESM-only packages break
  CommonJS consumers and CommonJS Jest), raised `engines` requirements against
  the runtime pins and Dockerfiles, and peer-dependency changes.
- Find the workspace code that reaches the package (`pnpm why -r <name>`,
  `npm ls <name>`, `yarn why <name>`) and run those packages' focused tests,
  lint, and type checks.
- Separate failures caused by the removal from failures that already exist on
  the base branch; check the latter in a clean scratch worktree.

Example: an override that pins a transitive HTML parser below its consumer's
range reports `DOWNGRADES_BELOW_RANGE`, and removing it adds no advisory, yet it
is load-bearing because the newer major is ESM-only and the CommonJS test runner
fails without the pin. Record such findings as an inline comment next to the
entry so later audits do not flag it again.

## 4. Patches and waivers

- Patched dependency: removable when upstream publishes a fixing release that
  meets the release-age rule, or when the patched version leaves the graph.
  pnpm fails install on an unused patch, so remove the patch file and its
  `patchedDependencies` entry together with the upgrade. During cleanup this
  skill may make that in-range upgrade itself, following the release-age rule;
  an upgrade to a new major goes to `dependency-upgrade-major`.
- Audit waiver: removable when the advisory no longer matches any resolved
  version. Check by temporarily removing the ID in the scratch worktree and
  rerunning the audit. A waiver tied to a local patch stays until the version
  changes, because audit tools match versions, not patch contents.
- Update any spec, decision record, or documentation that names the entry's
  removal condition when the entry goes.

## 5. Clean up (only when asked)

After the report, remove the entries proven removable, one group at a time (an
override with its patch or waiver, or one package family). For each group:
remove the entry, run the package manager's install to update the lockfile (the
lockfile records overrides), then run a frozen install, the focused checks from
step 3, and the audit. Commit the group with the repository's commit convention
(`commit-message` when installed) only after those pass. Back out and report any
group that fails. Add an inline comment to every entry
that must stay, stating why and its removal condition.

## Output

Lead with what can be removed now, then what should change, then what must stay.
Use one table per category with the entry, current status, purpose and evidence
(commit, comment, advisory), removal condition, and the verification run.

For each removal or change, copy this structure exactly, with a blank line
between labels:

```markdown
**Entry:** The file and the override, resolution, patch, or waiver key

**Issue:** What the entry does today, with evidence.

**Impact:** What removing or changing it changes (lockfile, runtime, tests).

**Solution:** The exact edit and the focused checks needed.
```

Then state which checks ran, which failed and why, and either that no files in
the user's checkout changed or exactly which entries were removed, with commits.
