# Production safety

Apply only the sections needed by the requested behavior. Follow the project's
stack and documented policies; retention periods, vendors, token lifetimes, and
service choices are project decisions. Resolve missing policies that materially
affect security or data loss before implementing dependent behavior. A small
feature does not require adding every subsystem in this guide.

## Data lifecycle and recovery

- Define what deletion means for affected records, related data, stored files,
  caches, search indexes, and active sessions. Distinguish recoverable deletion
  from permanent removal, including who may restore data and until when.
- Implement required retention, export, cleanup, and deletion notices using the
  project's policy. Make cleanup safe to retry and safe against concurrent use.
- Account for backup retention and legal holds when relevant. Document how
  restores avoid reviving data that must remain deleted. Avoid promising immediate
  removal from every backup unless the system supports it.
- For storage or migration work affecting recovery, identify backup coverage,
  access controls, encryption, and restore procedures. Verify recovery with an
  isolated restore when authorized; distinguish a backup existing from a tested
  restore and report any unverified recovery step.

## Authentication and abuse

- Apply abuse limits at the relevant account, identifier, IP, or resource boundary
  for login, signup, recovery, verification resends, and expensive operations.
  Use shared enforcement when multiple server instances handle requests. Balance
  throttling and lockouts against attackers denying access to legitimate users.
- Keep account-existence responses consistent where disclosure enables abuse.
  Use unpredictable, expiring, single-use recovery and verification tokens;
  prevent leakage through logs and URLs forwarded to third parties.
- Require appropriate proof before linking identities or changing sensitive
  account data. An email match alone is insufficient proof to merge accounts.
  Preserve at least one usable login method when unlinking providers. Handle
  provider email changes, revocation, and session invalidation deliberately.
- For cookie-authenticated state changes, use the framework's CSRF defenses and
  appropriate Secure, HttpOnly, and SameSite cookie settings. Treat CORS as a
  browser access policy, not authorization. Configure trusted origins, HTTPS,
  and security headers for the actual deployment. Choose CSP rules that work
  with required assets without broad unsafe allowances.
- Add CAPTCHA, device tracking, anomaly detection, or extra authentication only
  when required by the threat model; consider privacy and recovery behavior.

## API mutations and concurrency

- Use server-side transactions, uniqueness constraints, atomic updates, or
  idempotency records as appropriate for invitations, quotas, subscriptions,
  payments, and other operations that must tolerate duplicates or races.
- Scope idempotency keys to the caller and operation, bind them to the request,
  and define replay, expiry, simultaneous requests, and failure behavior. A retry
  after a committed change must not repeat its side effects.
- Bound list sizes and validate filters and sorting. Use stable pagination for
  the expected data and access pattern. Preserve existing API compatibility and
  document version or deprecation changes when contracts change.

## Jobs, webhooks, and email

- When delivery must survive a request or process failure, persist work durably.
  Coordinate database changes and queued work, using an outbox or equivalent
  mechanism when losing either side would leave inconsistent state.
- Bound retries with backoff, timeouts, and appropriate rate limits. Make
  duplicate execution safe and failed work visible, with a controlled replay or
  dead-letter process. Do not assume a queue provides exactly-once effects.
- Authenticate provider webhooks and handle duplicate and out-of-order events.
  Track relevant email delivery failures and suppress repeated sends to invalid
  destinations according to policy. Separate essential account messages from
  optional messages and honor applicable preferences and unsubscribe rules.

## File storage

- Authorize access before issuing upload or download permission. For direct
  uploads, use short-lived, narrowly scoped signed URLs or an equivalent grant;
  keep storage credentials server-side. Object names do not prove ownership.
- Restrict object keys, size, type, and overwrite behavior using provider controls
  and post-upload validation where needed. Treat uploaded content as untrusted.
  Handle incomplete uploads, metadata mismatches, and abandoned files.
- Match asset CORS and CSP to supported clients. Add resizing or optimization
  only when required by actual device or performance needs.

## Operations and cross-device state

- Log useful request or job identifiers, outcomes, and failures while redacting
  passwords, tokens, signed URLs, and sensitive personal data. Add metrics and
  alerts for the new failure modes using existing monitoring tools.
- Separate process liveness from readiness to receive traffic. Check required
  dependencies with bounded cost and timeouts; avoid making optional provider
  failures restart healthy processes or exposing internal details publicly.
- When multiple clients or offline use are required, define conflict handling,
  reconnect behavior, stale writes, and logout or revocation across devices.
  Authenticate real-time connections and recheck access after permission changes.
- For extension or app login handoffs, use the platform's supported auth flow;
  validate message senders, origins, recipients, and redirect targets. Keep
  credentials out of untrusted page contexts and use appropriately scoped grants.

## Verification

Exercise relevant duplicate, concurrent, denied-access, expiry, retry, and partial
failure paths. Use meaningful tests at the boundary that owns the behavior.
Follow the main skill's authorization rules for external services and expensive
checks. State what was verified and what remains unrun; scanners and checklists
alone establish neither security nor legal compliance.
