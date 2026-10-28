---
name: typescript-strictness
description: Enable or strengthen TypeScript checking and fix resulting errors without hiding unsafe behavior. Use for strict-mode migrations, nullability, unchecked indexing, implicit any, or unsafe assertion cleanup.
---

# TypeScript Strictness

Make the type system describe real behavior. A smaller error count achieved with
casts, suppressions, or excluded files is not a successful strictness migration.

## Establish the effective configuration

Inspect instructions, installed TypeScript/framework versions, every relevant
tsconfig and its inheritance, project references, generated code, and build/test
type-check paths. Determine which files are actually checked. Use the compiler's
effective configuration and project commands rather than assuming the root config
controls every package. Record baseline diagnostics grouped by cause and package.

Check [official TSConfig documentation](https://www.typescriptlang.org/tsconfig/)
for the installed compiler. `strict` is a family of checks; options such as
`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` need separate decisions.
Do not upgrade TypeScript or enable unrelated lint rules just to reduce errors.

## Choose a bounded migration

Agree the target options from the request and existing conventions. For a broad
migration, order packages by dependency and change coherent groups. A staged
configuration may be useful, but the final report must name every remaining
override and excluded scope. Never claim the whole repo is strict because a
small new config passes.

Prioritize shared model and boundary errors before patching individual callers.
Separate compiler-only corrections from changes to runtime behavior, especially
new defaults, early returns, and previously crashing paths.

## Fix root causes

- Parse untrusted input into validated domain types. `unknown` forces inspection;
  `as SomeType` and generic JSON helpers do not validate data at runtime.
- Model missing, null, empty, and optional values according to the real contract.
  Do not replace a meaningful absence with an arbitrary default or non-null `!`.
- Use discriminated unions and exhaustive handling for genuine variants. Narrow
  at the boundary instead of spreading optional properties through every layer.
- Check indexed lookups and array bounds. Preserve failure behavior or explicitly
  test an intentional change; an empty fallback can silently discard work.
- Correct generics and callback variance at the shared definition. Do not cast
  every consumer to accommodate a wrong library wrapper.
- Keep third-party/generated code changes in the generator, supported declaration
  augmentation, or a narrow adapter. Document upstream declaration defects with
  evidence rather than enabling broad `skipLibCheck` or `any` escapes.

Existing justified suppressions may remain. New ones need a precise reason and
removal condition, with a narrow scope. Do not rewrite tests to assert internal
types while losing their runtime checks.

## Verify

Run every affected project's actual type-check command plus the full available
tests, lint, and production builds. Add meaningful negative type cases using
existing type-test tooling where public API constraints changed. For runtime
guards and changed control flow, test valid, malformed, and missing inputs.
Check exported declaration compatibility for libraries and framework-generated
types for applications. Report target options, effective coverage, remaining
escapes, baseline versus final diagnostics, and runtime behavior changes.
