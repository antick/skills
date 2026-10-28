---
name: monorepo-restructure
description: Restructure monorepo applications and packages while preserving imports, builds, tests, and deployment artifacts. Use for package extraction, workspace moves, dependency-boundary cleanup, or task-graph restructuring.
---

# Monorepo Restructure

Move ownership and packaging deliberately. A successful source import in a warm
workspace does not prove a package works after a clean install or deployment.

## Inventory the actual graph

Read instructions, Git state, workspace definitions, package manifests, exports,
lockfiles, project references, task runner, CI filters, deployment roots, and tests.
Map applications/packages, public consumers, runtime boundaries, generated outputs,
and build/test dependencies. Include scripts, Docker contexts, lint configs,
CODEOWNERS, docs, and path-based release rules that depend on existing locations.

Identify the requested improvement and current failure/cost. Do not convert to a
different package manager or task runner unless requested. Verify installed-tool
semantics with official documentation, especially workspace linking and caching.

## Define target boundaries

Create an old-to-new path/package/export table and dependency graph. Extract only
code with real shared consumers or a required isolation boundary. Keep browser-safe
code separate from server/native-only dependencies. Avoid circular dependencies,
deep imports into private source, and framework runtime duplication.

For published packages, preserve names, public exports, types, assets, and peer
contracts or plan an explicit compatible release migration. Check external consumers
before removing exports. Internal path aliases must not conceal an undeclared
package dependency or replace the actual published interface.

## Move in coherent steps

1. Run baseline checks. Move a package or responsibility with its tests, fixtures,
   configuration, generated inputs, and documentation. Preserve unrelated changes.
2. Update workspace membership, manifests, imports/exports, and the existing
   lockfile. Do not hand-edit resolved dependency records or delete the lockfile.
3. Update task ordering and cache inputs/outputs. Include relevant environment and
   configuration changes; keep persistent dev tasks outside ordinary cached builds.
4. Update CI path filters, working directories, artifacts, containers, deployment
   roots, and release/version tooling. Preserve production identifiers and secrets.
5. Remove temporary aliases and old directories after checking callers, dynamic
   paths, generated files, docs, and packaging. Keep compatibility shims only with
   a named consumer and removal condition.

Do not combine restructuring with unrelated dependency upgrades. If a necessary
new package/version is in scope, verify compatibility and use exact stable versions
at least 48 hours old, preserving intentional peer/workspace ranges.

## Verify cold and downstream

Use a disposable clean checkout/directory to install from the lockfile and build
without existing generated files or caches. Never delete the user's working data
to simulate a cold build. Run affected packages and downstream consumers, the
full available tests, types, lint, and production packaging.

Verify package exports/types/assets from packed output where applicable, task
ordering, cache invalidation, and inclusion of workspace dependencies in deployment
artifacts. Validate configuration without deploying unless authorized.
Report the new ownership graph, moved paths, compatibility changes, exact cold
build evidence, and hosted/deployment checks that remain unrun.
