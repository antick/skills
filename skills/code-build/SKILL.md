---
name: code-build
description: Build applications, add features, and fix bugs using the project's actual stack, then commit the work in meaningful commits and open a draft pull request. Includes focused workflows for design-system enforcement, component standardization, localization, and web/mobile platform migration when requested.
---

# Code Build

Understand the real flow first, then stop at the first solution that fully works.

## Focused workflows

Read only the guide that matches the requested work. These guides supplement
the core workflow and preserve its scope and verification requirements.

| Requested work | Guide |
| --- | --- |
| Design System Enforcement | [Workflow](references/design-system-enforcement.md) |
| Component Library Standardization | [Workflow](references/component-library-standardization.md) |
| Internationalization and Localization | [Workflow](references/i18n-localization.md) |
| Platform Migration | [Workflow](references/platform-migration.md) |

## Establish the requirements

When the user supplies an issue, ticket, or pull request, read that exact item
and its relevant discussion with the available authenticated provider tools or
CLI before editing. Extract the requirements, the original reproduction steps,
and the acceptance criteria. For a task given directly in chat, use that request;
do not require an issue. If a supplied issue cannot be read, say so and ask for
the missing requirements instead of inventing them.

For a bug, trace the original failure through the affected code before editing
and fix its root cause. For an investigation-only request, follow the `code-debug`
approach: report the cause and the proposed fix without changing code.

Scope the change to the requirements. Do not expand a UI-only or backend-only task
merely because this skill covers both.

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

For every UI task, including visual fixes to existing screens, read and apply
[UI design guidance](references/ui-design.md) before editing. It supplements
the matching focused workflow; backend-only work does not need it.

For React or React Native code that adds or changes effects, custom hooks,
listeners, timers, subscriptions, or requests, read and apply
[React effect cleanup](references/react-effect-cleanup.md) so every started
resource is released on unmount.

Before writing UI code for a new screen, dialog, form, panel, or table action,
name the existing screen whose pattern you are copying. When no existing screen
fits, write a short layout sketch (entry point, overlays, and the actions shown
in each state) and wait for the user's approval before implementing it.

Add authentication, storage, payments, state libraries, and deployment services
only when the requested behavior needs them. Keep credentials on the appropriate
server or platform boundary and document required configuration with placeholders.
Use project migrations for schema changes and keep the repository's API
specification, such as an OpenAPI file, synchronized when adding, changing, or
removing API endpoints.

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
For browser checks in the user's own browser, use the `use-chrome` skill.

Add or update an end-to-end test only when a user journey actually changed or the
original reproduction steps are that journey; reuse existing journey coverage
where it already covers the path. Copy, token, styling, and layout-only changes
do not need a new end-to-end test. Finish focused checks before any expensive
suite, such as end-to-end, browser, database-backed, or full-suite runs. Ask at
most once before running one, and only when it matters for the result, unless
the user already agreed; report it as unrun if declined. Regenerate every derived artifact that CI compares with the source, such
as API specifications, schema snapshots, or generated inventories, with the
project's own commands.

Check the final diff for unrelated changes and missing files. Report what works,
which checks passed, and which runtime or external-service checks remain unrun.
A passing build alone does not prove the user journey works. Fix failures caused
by the change; distinguish existing failures from new ones.

Keep preview, deployment, publication, and other external actions within the
user's authorized scope. When a real service or device is unavailable, leave the
implementation ready to verify and state the exact remaining step.

## Commit and open a draft pull request

Invoking this skill authorizes committing, pushing a feature branch, and opening
a draft pull request. Commit along the way as described below, and finish every
implementation with a pushed branch and a draft pull request. Skip or limit this
only when the user says local-only, no commit, no push, or no pull request.

1. Work on a feature or fix branch created from the latest fetched default
   branch, unless the user names another base. When updating an existing pull
   request, including fix rounds, continue on its branch. Never commit directly to the
   default branch or another long-lived branch such as `main` or `develop`.
2. Commit as you complete each coherent piece of work, so the history shows
   meaningful steps that can be reviewed or reverted separately: for example a
   schema change, the service logic that uses it, and the UI that exposes it.
   A small change can be one commit. Do not split one idea across commits or
   bundle unrelated changes together. Write each message with the
   `commit-message` skill and stage only the files for that step.
3. Before pushing, run the focused checks above and regenerate derived artifacts.
4. Push the branch and open a draft pull request against the step 1 base with the
   `pr-description` skill. Link the verified issue. When updating an existing
   pull request, keep its current draft or ready state. Open a ready-for-review
   pull request only when the user asks for one.
5. Do not merge, deploy, or change issue or project status unless asked.

Report the draft pull request link, the commits, the checks run with their
results, and any check that could not run.

Match the user's requested explanation style. Simple code does not require an artificially short explanation.
