# Error Handling Standardization

Make failures understandable and recoverable without losing their cause or
exposing internal details. Uniform formatting alone does not fix error behavior.

## Trace failure paths

Read instructions, API specifications, shared error types, boundary handlers,
client adapters, UI states, background jobs, and logging/telemetry setup. Follow
representative failures from origin to user response and operational evidence.
Record the existing public status codes, error codes, messages, and retry behavior.

Distinguish validation, unauthenticated, forbidden, missing resource, conflict,
rate limit, transient infrastructure, cancellation, and unexpected failures only
where those categories affect handling. Do not build an elaborate taxonomy with
no consumers or catch all exceptions and return success-shaped empty data.

## Define a compatible contract

Choose one representation per boundary using existing conventions. Keep stable
machine-readable codes separate from user-facing text and internal cause/context.
Define ownership of logging, translation, retry, and user recovery. Preserve
public response compatibility or explicitly migrate clients and OpenAPI together.

Keep useful cause chains internally with redaction. Do not expose stack traces,
queries, tokens, personal data, or account-existence clues in public responses.
Use existing correlation IDs where available; validate untrusted inbound IDs.
Treat cancellation separately from a failure that requires an alert or retry.

## Migrate at shared boundaries

1. Add or refine the common error constructors/mappers and type contracts. Convert
   third-party errors near the integration boundary while preserving their cause.
2. Update server/API handlers and background workers. Set appropriate status codes,
   rollback transactions, release resources, and preserve intentional job retries.
3. Update clients and UI to render actionable messages, preserve user input, and
   offer recovery only when it is meaningful. Unexpected errors still need a
   usable fallback; form errors belong with their relevant inputs.
4. Assign retry ownership to one layer, with a bounded budget and backoff. Retry
   only eligible operations; ambiguous non-idempotent writes need an idempotency
   strategy, not repeated submissions. Authentication failures need a clear exit.
5. Remove duplicate logging and blanket catches after checking all callers. Avoid
   one log per layer for the same failure while retaining useful boundary context.

Do not add an observability vendor or change alert routing without scope. Keep
intentional partial-success contracts explicit instead of converting every batch
into all-or-nothing behavior.

## Verify

Establish baseline checks and add fault-injection tests at relevant boundaries.
Test representative expected failures, unexpected exceptions, cancellation,
timeout, retry exhaustion, malformed upstream errors, and cleanup. Assert status,
machine code, redacted payload, user recovery, and absence of duplicate writes.
Check error UI with keyboard/screen-reader semantics where applicable.

Run the available suite, types, lint, and build. Report the error contract,
migrated callers, changed public behavior, retry/log ownership, and any external
telemetry or background-worker paths not exercised.
