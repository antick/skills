---
name: code-hardening
description: Audit a repository with a fixed 20-check codebase hardening checklist covering duplication, secrets, error handling, APIs, money, dates, and database access. Use for a repeatable hardening checklist or its explicitly requested fixes; focused security, database, and simplification audits use their dedicated skills. Read-only dry run by default.
---

# Code Hardening

Work through all 20 checks in order. Confirm practical problems from repository
evidence and report coverage honestly; a matching pattern alone is a candidate.

## Scope and operating boundaries

- Establish the repository and target branch from the request and available
  context. Ask for whichever is missing; never guess another repository or
  switch a dirty checkout. Record the commit and existing local changes.
- Establish the delivery mode: read-only findings, a local diff for review, or
  fixes with a pull request. Ask when the requested mode is unclear. Reuse an
  explicit choice already made; audit authorization alone permits no edits,
  commits, pushes, PRs, migrations, or publication of findings.
- Start with a read-only dry run, including when fixes are requested, then apply
  only fixes covered by the agreed mode. A dry-run-only request stops at the
  report. Deliver findings in chat unless a report file is requested.
- Ask before sweeping changes unless that exact scope is already authorized.
  Sweeping means changing architecture, shared public contracts, stored-data
  representation, or moving or rewriting behavior across many modules. Present
  the affected areas, compatibility risks, and verification plan first. Routine
  call-site updates for an authorized fix do not need another approval.
- Inspect scripts before executing them. Use local or disposable environments
  for necessary reproduction. Live services, database changes, secret rotation,
  and external scanners require authorization covering that operation. Redact
  secret values; never test discovered credentials against a service.

## Workflow

1. **Map the repository.** Read project instructions, manifests, source roots,
   entry points, tests, schemas, middleware, shared helpers, and SDK setup.
   Identify generated, vendored, inaccessible, and excluded areas. Include
   tracked configuration and available Git history in the secret check; record
   shallow or unavailable history as a coverage gap.
2. **Run every check below in order.** Search each relevant source root and read
   candidates with their callers, shared controls, configuration, and tests.
   Check framework and SDK behavior against official documentation when the
   conclusion depends on a version-specific feature. Finish each check with
   confirmed findings or an explicit coverage outcome before moving on.
3. **Validate and rank.** Establish the trigger, reachable path, concrete impact,
   and counterevidence. Deduplicate common causes; assign each finding a stable
   ID and primary check, and cross-reference other checks without double-counting.
   Label evidence as static or reproduced. Keep unresolved candidates separate
   from confirmed findings. Length and style preferences alone are not defects.
4. **Fix only within scope.** In an authorized fix mode, use the smallest change
   that preserves required behavior and existing shared boundaries. Leave
   sweeping or uncertain fixes proposed. Run relevant tests and the project's
   required checks; add regression coverage when needed to demonstrate the fix.
   A fix is counted as fixed only after verification; report failed or unavailable
   checks and unverified edits as unresolved. Recheck the affected checklist
   items after edits. Follow repository commit rules and the agreed delivery mode.
5. **Report all 20 checks.** Use the output contract below even when an item is
   irrelevant or evidence is unavailable. Never promise exhaustive discovery or
   describe limited inspection as proof that the repository is safe.

## Ordered checklist

1. **Duplicate utilities.** Compare behavior, callers, and contracts before
   proposing reuse; preserve intentionally separate platform or trust boundaries.
2. **Committed secrets.** Inspect tracked configuration, source, and available
   history. Distinguish placeholders and public identifiers from credentials;
   identify locations without exposing values. Propose rotation and history
   cleanup separately; removing the current value does not revoke a credential.
3. **Functions over 400 lines.** Use syntax-aware tools when available, or inspect
   candidate boundaries manually. Report maintainability or correctness impact,
   rather than recommending splits solely to meet a line count.
4. **Components over 200 lines.** Check mixed responsibilities and reusable
   behavior. Preserve cohesive components; use project limits when stricter.
5. **Dead code.** Trace exports, dynamic registration, scripts, side effects,
   and external consumers. A search with no callers is not removal proof.
6. **Silent or empty catches.** Trace failure handling and caller expectations;
   distinguish intentional best-effort operations from lost errors or success
   responses after failure. Avoid logging secrets or swallowing required errors.
7. **UI API loading and error states.** Follow requests through shared hooks,
   suspense boundaries, components, and retry paths. Confirm which user-visible
   pending or failed state is missing, including recovery from a failed action.
8. **Database queries in route handlers.** Check duplicated business rules,
   missing transaction boundaries, and access-control drift. Direct queries
   alone do not justify adding a service layer.
9. **Synchronous I/O in request handlers.** Trace reachable blocking file,
   process, or network operations and the runtime's concurrency model. Separate
   startup work from request-time work; describe the affected workload.
10. **List endpoints without pagination.** Check effective result caps, bounded
    reference data, streaming, and intended export behavior. Identify unbounded
    growth and preserve ordering and clients when proposing pagination.
11. **Inconsistent API responses.** Compare equivalent endpoints, error shapes,
    documented contracts, and client assumptions. Preserve intentional protocol
    differences, streaming, and existing compatibility guarantees.
12. **Inexact money representation.** Trace parsing, arithmetic, rounding, and
    persistence. Use appropriate exact decimals or integer minor units with
    currency-aware scale; do not assume every currency uses cents. Flag unsafe
    floating-point calculations when a concrete precision failure is possible.
13. **Ambiguous or incorrect dates.** Trace storage, serialization, parsing, and
    time zones. ISO 8601 strings and native date types can both be valid; preserve
    date-only values and local scheduling semantics. Find ambiguous formats,
    lost offsets, or comparisons that violate the intended contract.
14. **External calls without suitable resilience.** Inspect timeouts, cancellation,
    SDK retries, retryable failures, bounded backoff, and jitter. Retry writes
    only when repeat execution is safe or protected against duplication. Avoid
    stacked retries and retrying permanent errors.
15. **Stale comments.** Show the contradiction with current behavior or tests;
    preserve comments explaining intent, compatibility, or historical constraints.
16. **Unvalidated user input.** Trace each trust boundary through shared schemas,
    framework validation, database constraints, and the eventual consumer. Show
    which unchecked value reaches an operation and the resulting impact.
17. **API routes missing auth checks.** Trace middleware, wrappers, policies,
    authentication and authorization, including tenant and resource ownership.
    Separate intended public routes from reachable unauthorized operations.
18. **Missing indexes on frequent queries.** Match predicates, joins, ordering,
    existing composite or partial indexes, and workload evidence. Missing live
    telemetry limits confidence; do not prescribe an index per queried column.
19. **N+1 queries.** Trace per-item lookups and actual ORM loading behavior,
    batching, caching, and bounds. State how query count grows; distinguish
    static evidence from measured plans and timings.
20. **Repeated third-party SDK initialization.** Compare lifecycle, configuration,
    credentials, tenants, and runtime boundaries. Consolidate only equivalent
    instances whose duplication causes cost, inconsistency, or lifecycle errors.

## Output

Start with repository, branch, commit, delivery mode, and inspected scope. List
exclusions, history limits, and missing runtime evidence. Include every confirmed
finding within that scope, ordered by severity and linked to its check number:

- **ID, severity, check, and location:** precise `path:line` references.
- **Trigger and impact:** the reachable scenario and what breaks or is exposed.
- **Evidence:** relevant callers and controls, static or reproduced results,
  and remaining uncertainty.
- **Fix and verification:** the concrete change, compatibility considerations,
  test or measurement, and status: fixed, proposed, or unresolved.

Finish with exactly one table row per checklist item, numbered 1 through 20:

| Check | Fixed | Proposed | Unresolved | Coverage | Evidence or reason |
| --- | --- | --- | --- | --- | --- |

Counts refer to distinct findings owned by that check; cross-references do not
increase totals. Coverage is reviewed, partial, not verified, or not applicable.
For a fully reviewed check with no confirmed findings or unresolved candidates,
write **none found within the inspected scope** in the last column. For partial,
not verified, or not applicable checks, explain the gap or reason instead. A
positive finding may coexist with incomplete coverage. Never use zero counts to
imply a check passed. In a dry run, fixed counts are zero and no files change.

State what changed, tests run and results, unresolved decisions, and the agreed
diff or PR location when applicable. Deeper security, database, performance, or
simplification work can use `code-security`, `database-audit`, `performance-audit`,
or `code-audit`; those skills are optional and do not replace any checklist row.
