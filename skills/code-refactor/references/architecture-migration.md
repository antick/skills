# Complex refactors and architecture cleanup

Use when a refactor crosses modules, changes dependency direction, extracts shared
behavior, or replaces a legacy subsystem. Keep the parent skill's baseline,
regression protection, official-documentation, and verification requirements.

## Map before moving

Trace actual callers, exported contracts, dependency cycles, ownership, shared
mutable state, side effects, and runtime boundaries. Include background jobs,
dynamic imports, plugin discovery, generated code, tests, and external consumers.
Distinguish a deliberate boundary from accidental layering. Similar code may have
different trust, lifecycle, or compatibility requirements.

State the concrete maintenance problem and target dependency direction. Draw a
small current/target graph when it clarifies the change. Prefer deleting needless
indirection or reusing an existing owner before introducing interfaces and layers.
Do not impose a named architecture pattern without a demonstrated benefit.

## Plan a compatible sequence

Define the old-to-new contract mapping, migration units, shared ownership, and
verification per unit. Identify changes to public APIs, persisted data, event
schemas, ordering, and error behavior. Preserve them unless a change was requested.
For a multi-release transition, account for old/new callers running together.

Use temporary adapters only to bridge real consumers. Give each an owner and
removal condition. Avoid two independent writers or permanent synchronization
between old and new implementations. When shadow comparisons are useful, prevent
the shadow path from producing writes, notifications, billing, or other side effects.

## Execute and retire

Protect a representative vertical flow before extracting shared behavior. Migrate
one consumer group, run its tests and downstream checks, then continue. Keep each
step reviewable; do not mix mechanical moves with unrelated behavior fixes.
Inspect codemod output for dynamic paths, serialization names, and hidden consumers.

Before deletion, search imports, configuration, registration tables, reflection,
workflows, generated artifacts, docs, and external contracts. An unused static
export is not enough evidence that a runtime entry point is dead. Remove stale
flags, adapters, tests of retired internals, and dependency entries only when their
consumers are gone; preserve tests of required behavior.

## Verify the boundary

Exercise success, failure, cleanup, concurrency, and compatibility at the moved
boundary. Run downstream consumers and cold builds when module/package layout
changes. Verify architectural rules using existing dependency tooling if useful;
a diagram is not enforcement. Report the final graph, reduced duplication,
remaining bridges, intentional behavior changes, and unverified external callers.
