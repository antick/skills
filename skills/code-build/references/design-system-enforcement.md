# Design System Enforcement

Make approved visual and interaction rules easy to follow and hard to bypass.
Preserve the existing brand unless a redesign is explicitly requested.

## Identify the authority

Read project instructions, theme configuration, token definitions, shared controls,
design documentation, and representative screens. Identify which source is
authoritative when designs and code disagree. Ask only where an unresolved choice
would change the product's appearance or behavior; continue independent inventory.

Map colors, typography, spacing, radii, elevation, responsive breakpoints, motion,
and interaction states to their shared definitions. Include dark/high-contrast
themes, density variants, platform adaptations, and intentional exceptions.
Distinguish raw primitives from semantic tokens: equal current hex values do not
prove two roles should share a token.

## Plan rules and migration

Inventory concrete drift with file locations and visible impact. Choose rules
the existing tooling can enforce reliably: prohibited imports, direct palette
usage, duplicated tokens, or unsupported component variants. Prefer AST-aware
linting for syntax-dependent rules; do not use broad text replacements that alter
data, illustrations, generated/vendor code, or third-party themes.

Define an exception mechanism with reason, owner, and review condition. Baseline
existing debt when necessary so new violations fail without forcing an unrelated
whole-app rewrite. Do not hide violations with blanket disables.

## Apply at the shared source

1. Correct or introduce semantic tokens in the project's common theme source.
   Preserve public token names through aliases if consumers need migration time.
2. Update shared components before their screens. Keep component APIs and keyboard
   behavior stable; component API redesign is a separate migration decision.
3. Migrate representative screens, then remaining in-scope consumers. Preserve
   responsive behavior and meaning conveyed by status colors or iconography.
4. Add focused enforcement checks to the existing lint/build pipeline. Exercise
   both a violating fixture and a permitted exception; a rule that rejects all
   values is not useful enforcement.

Do not add a styling framework, design tool dependency, or visual testing service
solely for enforcement. Use existing capabilities; explain missing verification
and obtain any required service/tool authorization before relying on it.

## Verify

Run tests, types, lint, and production build. Compare representative screens before
and after at relevant viewport sizes and themes, including hover, focus, disabled,
loading, validation, and long content. Check contrast and reduced motion where
tokens change them. Review screenshot differences; do not accept them blindly.
Report enforced rules, migrated surfaces, approved exceptions, remaining drift,
and visual/device checks not performed. Passing lint alone does not establish
visual consistency or accessibility.
