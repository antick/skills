# SDK Consolidation

Create a small shared integration boundary where real consumers need one. Do not
build a universal SDK abstraction or hide provider features merely for uniformity.

## Map clients and contracts

Inspect instructions, installed SDK versions, manifests, lockfiles, and every
client constructor and caller. Record runtime (browser, server, worker, native),
credential owner, endpoint/region, tenant context, timeouts, retries, pagination,
streaming, cancellation, errors, telemetry, and connection lifecycle.

Distinguish safe process-wide connection reuse from user-specific credentials.
Never make a singleton that leaks one request's token or tenant into another.
Keep server SDKs and secrets out of browser bundles. Use the installed provider's
official documentation for thread safety, retry defaults, and disposal semantics.

## Choose the boundary

Unify construction/configuration first if call semantics already match. Add a
domain-level adapter only when multiple consumers need the same business contract.
Keep provider-specific options accessible when callers genuinely need them.
Avoid copying the full SDK surface or wrapping each method without a benefit.

Define what callers can rely on: successful result, typed failure categories,
cancellation, timeout budget, retry ownership, and resource cleanup. Preserve
public exports and API specifications when the wrapper serves an API boundary.
Do not conflate an SDK version upgrade with consolidation unless requested.

## Protect and migrate

Run baseline checks and add contract tests at the integration boundary. Cover:

- Success, malformed responses, authentication failure, rate limits, and timeouts.
- Cancellation during work and cleanup after failure or consumer disconnect.
- Pagination termination, empty pages, and streamed partial results if supported.
- Non-idempotent writes and ambiguous failures, with no automatic duplicate write.
- Concurrent requests for different users, tenants, regions, or endpoints.

Use a fake transport or provider sandbox as appropriate; mocking only the wrapper
cannot verify its mapping to the SDK. Do not call billable or production services
without authorization. Keep credentials out of fixtures and recorded responses.

Migrate one consumer group at a time. Put retries in one layer, bound total attempts
and elapsed time, honor provider guidance, and preserve idempotency keys. Preserve
error causes while redacting secrets. Dispose resources according to ownership;
one caller must not close a client still used by others.

Remove old wrappers and duplicate dependencies only after tracing all consumers.
Verify bundle/runtime compatibility, tests, types, lint, and builds. Report the
shared contract, remaining adapters, sandbox versus mocked evidence, and external
service behavior that remains unverified.
