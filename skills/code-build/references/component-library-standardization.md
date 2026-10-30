# Component Library Standardization

Create consistent reusable component contracts based on real consumers. Follow
the existing design system; do not invent new tokens or redesign screens as a
side effect of consolidating components.

## Inventory before choosing a winner

Read repository instructions, component exports, usage sites, stories/examples,
tests, and package boundaries. Group candidates by user purpose and behavior,
not name or markup similarity. Compare props, controlled/uncontrolled state,
events, refs, semantics, focus handling, variants, theming, and SSR support.

Record web/native differences and framework/runtime versions. A web button and a
native button can share design intent without sharing implementation. Preserve
specialized behavior when a generic primitive cannot express it clearly.
Choose an existing canonical component where possible, using accessibility,
actual consumer needs, and maintenance cost rather than popularity.

## Define the consumer contract

Create a migration table: old import/API, new import/API, behavior differences,
consumer group, and compatibility strategy. Prefer explicit composition over a
large collection of boolean props. Preserve form semantics, accessible names,
ref forwarding, keyboard behavior, and caller event ordering.

For a published or shared package, inspect exports, peer dependencies, declaration
files, CSS/assets, side effects, server/client boundaries, and tree-shaking.
Avoid bundling a second framework runtime. Changing a public API requires a
compatible adapter or an explicitly planned breaking migration.

## Migrate with evidence

Run baseline tests and add contract tests for the affected primitives. Include
controlled/uncontrolled use, disabled/loading states, validation, keyboard/focus,
and consumer composition. Use real DOM/native interactions where appropriate;
snapshot-only tests do not verify behavior.

Implement the shared component, migrate one representative consumer, and verify
it before bulk migration. Review codemod output for spread props, aliases, dynamic
imports, wrappers, and custom styles. Keep compatibility adapters small and give
them an explicit removal condition. Do not leave parallel libraries indefinitely.

Remove old exports only after tracing downstream consumers, including examples,
tests, lazy imports, and external consumers when known. If external usage cannot
be checked, preserve compatibility or report the breaking-change boundary.

## Verify and document

Run library and consuming-app tests, type/lint/build checks, and clean package
consumption where the library ships separately. Verify styles/assets and types
from packaged output, not just workspace source aliases. Compare representative
screens, themes, responsive states, and accessibility interactions.

Document supported variants and minimal usage in the project's existing docs or
stories. Report canonical APIs, migrated consumers, removed duplicates, remaining
adapters, and unverified external consumers or device platforms.
