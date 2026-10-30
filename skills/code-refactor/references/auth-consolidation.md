# Auth Consolidation

Unify ownership of authentication without merging identities or weakening access.
A request to consolidate code does not authorize changing providers, linking real
accounts, invalidating production sessions, or changing account settings.

## Map the current contract

Read project instructions and Git status. Trace every login entry point, callback,
session reader, token refresh, logout, recovery, MFA, invitation, and authorization
check in scope. Record identity keys, tenant selection, credential storage, cookie
attributes, expiry, redirect validation, and which layer enforces access.
Separate authentication (who someone is) from authorization (what they may do).
UI guards are not substitutes for server enforcement.

Make a caller-to-owner map. Distinguish genuinely duplicate implementations from
deliberate browser/server/native boundaries or different trust levels. Inspect the
installed provider SDK and current official documentation before moving callbacks
or token handling. Preserve public endpoints and existing provider configuration.

## Protect the behavior

Run baseline tests. Add focused tests in the existing setup for anonymous access,
valid sessions, expired/revoked sessions, insufficient permission, and cross-tenant
access. Include concurrent refresh, logout during a pending request, account
switching, callback replay, invalid return URLs, and failed recovery where relevant.
Use test identities; never read or print real tokens. If no suitable test setup
exists, explain the missing protection and agree a minimal setup before a broad
auth rewrite. Continue mapping and preparing independent changes.

## Consolidate by responsibility

1. Choose one owner for each responsibility, using the provider's supported APIs.
   Keep server verification separate from client session presentation.
2. Move shared verification and permission policy behind a small interface that
   receives explicit identity and tenant context. Do not introduce process-global
   mutable user state or persist server secrets in browser storage.
3. Centralize refresh coordination without changing expiry semantics. Ensure
   refresh failures terminate cleanly and do not create retry loops or resurrect
   a logged-out session. Clear user-scoped caches on identity changes.
4. Migrate one caller at a time. Keep temporary adapters only where they preserve
   a known contract; list their remaining consumers and removal condition.
5. Remove old paths only after checking all callers, background jobs, middleware,
   deep links, and platform entry points. Update API specifications if contracts
   intentionally change; separate those changes from behavior-preserving cleanup.

Preserve CSRF protections, OAuth state/nonce and PKCE where applicable, secure cookie
settings, and server-side revocation checks. Do not replace provider validation
with handwritten token parsing or mistake decoding for signature verification.

## Verify and report

Run affected tests, full available tests, type/lint/build checks, and the relevant
login-to-logout journeys. Verify two users and two tenants, not only the happy path.
Report the ownership map, removed duplication, compatibility adapters, commands
and results, and any provider/device flows not exercised. Source-level tests do
not prove live provider callbacks or existing-account continuity.
