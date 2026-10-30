# Routing Refactor

Preserve the ways people and external systems reach a screen. A working internal
link is not proof that refresh, shared URLs, and native deep links still work.

## Map the route contract

Read instructions, installed router/version, route declarations, layouts, links,
guards, middleware, loader/actions, redirects, and platform link configuration.
Build a table of current path/pattern, owner, parameters, query/hash behavior,
auth rules, entry modes, and proposed destination. Include static files, API routes,
locale/base paths, trailing slash behavior, error routes, and external links.

For mobile, map stack/tab/modal ownership, back behavior, restoration, deep links,
and authenticated/anonymous roots. For web, inspect SSR, hydration, direct requests,
server rewrites, canonical URLs, and crawler-visible redirects where relevant.
Consult official documentation for the installed router; do not replace it unless
the user requested a migration.

## Protect entry and exit paths

Run baseline checks and add route-level tests before moving routes. Cover direct
entry, internal navigation, refresh, back/forward, not-found, malformed/encoded
parameters, query/hash preservation, and guarded destinations. Include login
return flows and permission denial. Native coverage includes cold-start deep links,
warm links, system back, and restoration after process death where supported.

Record intentional URL changes separately. Preserve existing external contracts
with compatible redirects or aliases when required; do not silently break saved
links, emails, callbacks, or integrations.

## Migrate in bounded groups

1. Define route ownership and reusable navigation helpers in the project's existing
   structure. Centralize meaningful route construction without creating a second
   routing framework.
2. Move a coherent route subtree and update callers, layout data boundaries, guards,
   and lazy imports together. Keep authorization enforced on the server/API too.
3. Validate return URLs and redirects; prevent loops and open redirects. Preserve
   HTTP method/status semantics for endpoints and update OpenAPI when APIs change.
4. Preserve navigation state only where its lifetime remains valid. Clear protected
   history/state on logout according to the established product contract.
5. Remove old routes only after checking dynamic links, generated routes, analytics,
   sitemaps, hosting rules, and mobile association/configuration files.

Do not flatten nested layouts if it changes data fetching, error boundaries,
focus restoration, scroll position, or browser history semantics unintentionally.

## Verify and report

Run the available suite, types, lint, and production build. Exercise the route
matrix in the actual runtime; check production-style serving for rewrites and
direct requests, and device/simulator deep links when available. Verify focus,
page titles, loading/error states, and preserved state through navigation.
Report the route mapping, compatibility redirects, changed contracts, and any
hosting/device checks not performed. Local client navigation cannot establish
production rewrite or app-link correctness.
