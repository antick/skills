---
name: performance-audit
description: Find reads, background jobs, polling, and scripts whose cost grows with table size instead of with the page shown, a fixed cap, or the work actually due; prove each finding with code, indexes, policies, and query plans on synthetic volume; and report ranked fixes. Use when asked whether something will get slow as data grows, for a scalability or query-growth audit, or to check a change for unbounded reads. Read-only; fixes use code-build and a single reported slowdown uses code-debug.
---

# Performance Audit

Find work whose cost keeps growing as the data grows, prove it, and rank the
fixes by how often the work runs times how fast its input grows.

## Boundaries

- Read-only. Do not edit code, create migrations or indexes, file issues, or
  change data unless the user separately asks; fixes then go through `code-build`
  and the repository's approval rules.
- Measure only on a local or disposable database that mirrors production schema,
  policies, and roles. Load synthetic rows only inside `BEGIN … ROLLBACK`. Never
  write to shared, staging, or production environments.
- Remote evidence, such as query statistics or slow-query logs, is read-only and
  needs the user's authorization. Report counts, timings, and plans, never row
  contents or personal data.
- Never recommend deleting audit or compliance history to save time. Separate
  storage growth from read cost.

## 1. Map growth

1. List the tables that grow with use: one row per visitor, request, message,
   event, order, appointment, upload, or audit entry. Note which are never
   deleted and which state flags are never cleared (for example a `*_pending_at`
   kept after sending, or records that stay in an open status forever).
2. Mark bounded tables and say why: catalogs, staff accounts (headcount),
   tenants, reference directories (sized by the outside world, not by usage).
3. Find how often each path runs: client polling (`setInterval`, effects that
   refetch), scheduled jobs and their intervals, list endpoints, imports, and
   batch scripts. Frequency times growth decides severity.

## 2. Hunt the patterns

Search the API, background jobs, scripts, client code, and migrations. For each
hit, read the full query and every caller before calling it a finding.

- **Exact totals on lists:** `count(*)` beside a page. Bound it with a capped
  count (count up to a limit and report "N+") or drop the total.
- **Unsortable order:** `ORDER BY CASE WHEN $direction …`, or one CTE feeding
  both the page and the count, which materializes every match. Use a fixed
  direction per statement, an ID tie-breaker, and a separate capped count.
- **Deep or unbounded paging:** `OFFSET` with no cap, list endpoints or JSON
  aggregation with no `LIMIT`. Prefer keyset pagination for deep lists.
- **Missing or unusable indexes:** filters and orders without a matching index
  (`(tenant_id, created_at, id)` is a common list index); columns cast or wrapped
  in the predicate (`id::text ILIKE`, `lower(email) =` without an expression
  index); `VALUES` or `LATERAL` expansions that hide a column from the planner;
  foreign-key lookups made by jobs without an index.
- **Row-level security:** non-leakproof predicates (`ILIKE`, `LIKE`, most casts
  and functions) cannot be used as index conditions under row-level security,
  while plain equality on UUID and text can. Check `pg_policies` and
  `pg_proc.proleakproof`. Policies can also apply to security-definer owners, so
  results as a local superuser can mislead.
- **Jobs reading history:** due-work queries without an index on the due column,
  or whose set grows because finished rows keep their flag.
- **Per-row loops in transactions:** one statement or audit call per row inside a
  locked transaction, and N+1 queries in request handlers. Prefer set-based
  statements and batched inserts.
- **Client amplification:** effects whose dependencies restart an interval or
  refetch on every state change, and duplicate concurrent requests.
- **Bulk scripts:** staging tables queried before `ANALYZE`; updates that rewrite
  rows already in the target state (missing a `WHERE` guard on the current value).
- **Batches without progress:** selections that return the same first rows on
  every run.

Translate these patterns to the actual engine and ORM; verify engine-specific
claims against official documentation. Some engines commit implicitly on
statistics or schema commands (MySQL's `ANALYZE TABLE` does), so check that the
rollback still holds there.

## 3. Prove each candidate

1. Confirm the indexes (`pg_indexes`), policies (`pg_policies`), and grants the
   query meets. A partial index is used only when the planner can prove the
   query predicate implies the index predicate.
2. Load a realistic synthetic volume in a rolled-back transaction, `ANALYZE` the
   tables, then run the repository function as the application's runtime role
   with its tenant or session settings, and `EXPLAIN (ANALYZE, BUFFERS)` its
   statements. Application code usually opens its own pooled connection, which
   cannot see uncommitted rows: run the function on the same transaction or
   client by passing the transaction handle, or capture its SQL and run that
   inside the transaction. Never commit the synthetic rows. Reuse an existing test helper that explains every statement when
   the repository has one.
3. Keep distributions realistic: rare filter values as rare as in production,
   one-to-one relationships kept one-to-one. Skewed seeds change the plan. Rows
   created by triggers are invisible to later parts of the same statement, and
   tiny tables are scanned whatever the indexes.
4. Record before and after timings at two volumes. A finding is **measured** when
   you timed it and **static** when it rests on code and plan shape; say which.

`EXPLAIN ANALYZE` executes the statement. Run it only on the disposable database,
and never on statements with side effects outside the rolled-back transaction.

## 4. Rank

Order by frequency times growth: per-tab polling, then list pages, frequent jobs,
daily jobs, then manual scripts. A correctness or cross-tenant data issue found on
the way ranks above every performance item.

## Output

Start with a one-line verdict and the volumes tested. Then one entry per finding,
most severe first, with a blank line between labels:

```markdown
### <Severity>: <path in plain words>

**Where:** `path/to/file.ts:line`

**Runs:** How often, and who or what triggers it.

**Grows with:** The table and what drives its growth.

**Evidence:** Measured or static; plan shape; timings at each volume.

**Fix:** Index, query change, cap, or batching, and the approvals it needs.

**Regression test:** The behavior or plan shape to assert.
```

Finish with **Checked and fine** (with why each path is bounded), **Gaps**
(volumes not tested, missing statistics such as `pg_stat_statements`,
environments not checked, and plan effects of uncommitted rows, such as an empty
visibility map that makes index-only scans look worse than in production), and a statement that the audit made no changes.
