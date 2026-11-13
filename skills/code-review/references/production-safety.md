# Production safety review

Apply only to behavior affected by the change and requirements it claims to
deliver. Follow documented project policies and the main skill's finding bar:
each finding needs a concrete trigger, impact, code evidence, and correction.
An absent subsystem, preferred vendor, arbitrary retention period, or unrun
scanner is not by itself a defect. Keep verification gaps separate from findings.

## Data lifecycle and recovery

- Trace deletion through related records, files, caches, search indexes, and
  sessions. Check that deleted data loses access as intended and cleanup cannot
  remove another user's data or race with a supported restore.
- Check retention, export, notices, grace periods, and permanent deletion against
  the actual policy. Include retries, partial cleanup, legal holds, and backup
  handling when affected. Identify restore paths that revive data required to
  remain deleted.
- For migration or storage changes, check recovery compatibility, backup access
  and encryption where affected, and available restore evidence. Distinguish
  source inspection, backup configuration, and an exercised restore.

## Authentication and abuse

- Trace realistic abuse of changed login, signup, recovery, resend, and expensive
  operations. Check whether limits can be bypassed across server instances or
  used to lock out victims. Check account-existence leaks where relevant.
- Check recovery and verification token expiry, single use, replay, and leakage.
  Trace sensitive account changes through required proof and session revocation.
- Check linking requires proof of account control, rather than only matching
  emails. Check provider email changes and unlinking the last usable login method.
- For cookie-authenticated state changes, inspect CSRF defenses and cookie modes.
  Check actual trusted origins, credentialed CORS, HTTPS, and CSP/header changes.
  CORS does not replace authorization, and SameSite alone is not a general CSRF
  strategy. Tie findings to a reachable exposure or broken supported flow.

## API mutations and concurrency

- Trace duplicate and simultaneous invitations, quota updates, subscription
  changes, and other sensitive mutations through database constraints and atomic
  operations. A read followed by a write may race even when each request is valid.
- Check idempotency key ownership, request binding, replay, expiry, simultaneous
  requests, and retries after a committed change. Look for duplicate side effects
  and responses that disclose another caller's result.
- Check list bounds, filter validation, stable pagination, and compatibility with
  existing callers when contracts or versions change.

## Jobs, webhooks, and email

- Trace failure between committing data and enqueueing work. Check durable
  delivery requirements, duplicate execution, retry limits, backoff, timeouts,
  rate limits, and observable failure or controlled replay.
- Check webhook authentication and duplicate or out-of-order event handling.
  Verify that queue retries cannot repeat irreversible effects.
- Check delivery failure handling, resend abuse, invalid-address suppression,
  and preference or unsubscribe behavior against the affected email category
  and project policy. Avoid assuming all email is mandatory or always needs a
  new queue service.

## File storage

- Check authorization before issuing signed access, including tenant and object
  ownership. A UUID or storage path is not an access control.
- Inspect signed URL scope, lifetime, overwrite behavior, size/type restrictions,
  and treatment of untrusted content. Trace incomplete uploads, metadata failures,
  and orphan cleanup where affected. Direct client uploads with a narrow grant
  can be valid; storage credentials must remain protected.
- Check asset CORS and CSP against supported clients and permissions, rather
  than recommending unrestricted origins to make requests succeed.

## Operations and cross-device state

- Check that new failures remain diagnosable without logging passwords, tokens,
  magic links, signed URLs, or sensitive personal data. Inspect changed health
  checks for information leakage, unbounded dependency calls, and restart loops
  caused by optional provider outages.
- For required sync or offline behavior, trace reconnects, stale writes,
  conflicting updates, logout, and permission revocation across clients. Check
  real-time subscriptions retain the correct access boundary.
- Check extension or app login handoffs authenticate message senders and validate
  origins, recipients, and redirects. Trace credentials into page contexts and
  storage; report a concrete exposure rather than prescribing a cookie bridge.

## Evidence

Look for meaningful tests of duplicate, concurrent, denied-access, expired,
retry, and partial-failure paths relevant to the diff. Run checks only within
the main skill's consent rules. State coverage limits precisely; a passing
scanner or checklist does not establish security or legal compliance.
