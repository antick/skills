---
name: code-build
description: Build applications, add features, and fix bugs using the project's actual stack. Use for implementation requests, including new projects that need a stack selected, with the simplest safe solution that fully meets the request.
---

# Code Build

Understand the real flow first, then stop at the first solution that fully works.

## Identify the project

1. Read the project instructions and inspect the working tree before editing.
2. Inspect manifests, lockfiles, framework configuration, entry points, scripts,
   and deployment files. Identify the affected package, language, framework,
   runtime, package manager, data layer, UI conventions, and available checks.
   Dependencies alone are clues; confirm how the application actually runs.
3. Classify the work as a new project, an existing feature or fix, or an explicit
   migration. Preserve the existing stack unless the request requires changing it.
4. Trace the requested behavior from its entry point through storage and external
   boundaries. Identify existing components and helpers to reuse.

For a new project or a requested stack decision, read
[stack selection](references/stack-selection.md). Ask only for missing choices
that materially affect the result, such as target devices or hosting constraints.
Otherwise state a reasonable assumption and proceed.

## Select the matching stack guide

Use repository evidence to select a guide: configuration, the running entry point,
and the package that owns the change. A product keyword alone does not select a
framework. Each guide helps decide where the behavior belongs, how to build it,
and what must work before the task is complete.

| Detected stack or project | Guide |
| --- | --- |
| Astro: blogs, documentation, content sites | [Astro static](stacks/astro.md) |
| Expo and React Native mobile applications | [React Native application](stacks/react-native.md) |
| Electron desktop applications | [Electron desktop](stacks/electron.md) |
| Chrome and compatible browser extensions | [Chrome extension](stacks/browser-extension.md) |
| Command-line tools and scripts | [CLI tool](stacks/command-line.md) |
| Turborepo and pnpm workspaces | [Turborepo monorepo](stacks/workspaces.md) |

Combine guides when the feature spans applications, such as an Expo client
calling a backend API. A monorepo guide supplements its application guides.
Keep one working example from the repository as the implementation reference.
For a new project, use the selected version's official scaffold as the starting
point. Derive dependencies and directories from actual requirements rather than
turning a guide into a package list or a folder-generation checklist.

For shared behavior, read the relevant sections of [web and API guidance](references/web-and-api.md),
[apps and tools guidance](references/apps-and-tools.md), or
[workspace guidance](references/stack-selection.md). These hold common boundary
checks; the individual guides supply the stack's build path.

These are starting points, not an exhaustive list of supported frameworks.
For another stack, follow its existing conventions and consult the official
documentation for the installed version. Do not substitute a listed framework
just because a guide exists for it.

## Build the requested behavior

For an existing project, extend the nearest working pattern. For a new project,
use the selected framework's official initializer when useful, inspect what it
generates, and keep only the pieces the request needs. Verify initializer options
against current official documentation; do not invent setup scripts.

For work spanning several parts, outline the affected files, contracts, and
verification steps briefly. Start with one working path through the necessary
layers, then complete every requested behavior, error state, and edge case.
Scale planning to the task; routine changes need no separate plan file or
approval checkpoint. Use available agents only when delegation is authorized.

Add authentication, storage, payments, state libraries, and deployment services
only when the requested behavior needs them. Keep credentials on the appropriate
server or platform boundary and document required configuration with placeholders.
Use project migrations for schema changes and keep `openapi.json` synchronized
when adding, changing, or removing API endpoints.

When adding or updating dependencies, verify compatibility and release dates
from official registries. Choose the newest compatible stable release at least
two days old, pin exact versions, and update the existing lockfile with the
project's package manager. Preserve unrelated dependency versions. If release
metadata is unavailable, report the limitation instead of guessing.

## Ladder

1. Confirm the requested behavior needs to exist.
2. Reuse an existing helper, component, type, or pattern.
3. Prefer the language standard library.
4. Prefer a native browser, operating-system, database, or framework feature.
5. Prefer an already-installed dependency.
6. Write the minimum new code that safely completes the request.

When two solutions are equally small, choose the one that handles real edge cases correctly.

## Working rules

- Trace the affected flow and callers before editing.
- Fix shared root causes once instead of patching each symptom.
- Prefer deletion, direct code, and existing conventions over new layers.
- Add an abstraction when there are multiple real consumers or a required boundary, not for hypothetical reuse.
- Keep configuration for values that genuinely vary; keep fixed behavior local.
- Preserve validation at trust boundaries, data-loss protection, security, accessibility, and hardware calibration.
- Leave the smallest relevant runnable check for non-trivial logic and run the available tests.

## Verify and finish

Run the available tests and relevant lint, type, build, or packaging checks from
the affected project. Exercise the changed behavior in the actual browser,
runtime, simulator, or packaged application when available. Include a failure
path where input validation, permissions, or external services affect the result.

Check the final diff for unrelated changes and missing files. Report what works,
which checks passed, and which runtime or external-service checks remain unrun.
A passing build alone does not prove the user journey works. Fix failures caused
by the change; distinguish existing failures from new ones.

Keep preview, deployment, publication, and other external actions within the
user's authorized scope. When a real service or device is unavailable, leave the
implementation ready to verify and state the exact remaining step.

Match the user's requested explanation style. Simple code does not require an artificially short explanation.
