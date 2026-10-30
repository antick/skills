# State Consolidation

Give each piece of state an explicit owner and lifecycle. Consolidation need not
mean one global store or a new state library.

## Inventory ownership

Read repository instructions, installed versions, callers, and tests. For every
state value in scope, record its owner, readers, writers, lifetime, identity/tenant
scope, persistence format, and reset conditions. Classify it as local interaction,
URL/navigation state, server data/cache, shared client state, or derived data.
Trace the event that changes it and the effect that publishes it elsewhere.

Identify demonstrated conflicts: stale copies, effects copying one store into
another, inconsistent invalidation, duplicate requests, identity leaks, or render
churn. Similar names alone do not prove shared ownership is appropriate.
Check current official documentation for the installed store/cache framework.

## Establish a migration contract

Run baseline checks. Protect observable transitions with tests before moving
ownership: initial loading, success, empty data, failure, retry, optimistic rollback,
logout/account switch, refresh, and persisted-state rehydration as applicable.
Include overlapping requests completing out of order and component unmounts.
Do not make tests depend on a private store layout or exact hook selection.

Choose the smallest owner that reaches all real consumers. Keep remote data in
the established server cache, transient form state local where possible, and
shareable navigation state in the URL when that is its existing contract.
Derive values instead of storing copies only after checking observable timing.
Do not turn editable drafts into live server state or remove intentional snapshots.

## Migrate incrementally

1. Define read/write interfaces and reset rules. Keep tenant and user identifiers
   in cache keys where the data contract requires isolation.
2. Move one flow, then migrate its consumers. Avoid a permanent two-way sync layer
   between old and new stores. If temporary bridging is needed, designate one
   writer and a removal condition.
3. Preserve cancellation, deduplication, retry, optimistic updates, subscriptions,
   and cleanup. Handle stale responses after identity changes explicitly.
4. Version persisted data when its shape changes. Test old data, corrupt data,
   and rollback compatibility; never silently clear user drafts to simplify code.
5. Delete old stores/providers only when imports, dynamic consumers, tests, and
   persistence readers are migrated. Library replacement needs task scope, not
   just a preference for a newer API.

## Verify

Run the available suite, type/lint/build checks, and representative UI transitions.
Check SSR hydration, multiple tabs, offline recovery, and platform lifecycle when
the application uses them. Measure render or request counts before claiming an
improvement. Report final ownership, deleted sync paths, storage compatibility,
remaining bridges, and untested runtime cases.
