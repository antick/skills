---
name: database-audit
description: Review database schemas, migrations, SQL and ORM queries, indexes, transactions, and database access controls. Use for a database audit, data-integrity review, or query-performance assessment. Reports evidence-backed findings without applying changes by default.
---

# Database Audit

Find concrete risks to data correctness, query performance, and database security.
Adapt to the actual engine, version, ORM, workload, and deployment model; do not
impose a preferred schema style or assume every database behaves like PostgreSQL.

## Scope and operating boundaries

- Audit and report by default. Do not edit code, apply migrations, create indexes,
  change grants, or run maintenance unless the user requests those actions.
  Deliver findings in the conversation unless a report file is requested.
- Start with repository evidence. A connection string or available database tool
  does not authorize connecting to a live database. Use live access only within
  the user's authorized target and scope; otherwise continue a static audit and
  state what runtime evidence is missing.
- For authorized live inspection, use least-privileged access, metadata and
  existing aggregate telemetry, bounded statements, and engine-supported timeouts.
  Avoid extracting customer rows, secrets, or query literals containing personal
  data. Redact connection strings and sensitive values in reports and plans.
- Inspect scripts before running them. Do not run migrations, seeds, resets,
  benchmarks, or application startup merely to discover the schema. Use a
  disposable database for necessary reproductions and inspect test setup first.
- An execution plan is not necessarily passive: `EXPLAIN ANALYZE` and equivalent
  profiling modes execute queries. Even a `SELECT` can invoke side-effecting
  functions, acquire locks, or consume substantial resources. Use non-executing
  plans only after verifying engine semantics; request authorization for any
  execution outside the existing scope. A rollback does not undo every side
  effect or prevent load and locking.

## Workflow

1. **Establish scope and inventory.** Record the commit and dirty-worktree state,
   requested surfaces, engines and versions, ORM/driver, deployment topology,
   and evidence available. Infer these from manifests and configuration without
   printing secrets. For an unspecified audit, cover repository database usage;
   do not require a live connection. Identify authoritative DDL, migration
   history, ORM models, views, triggers, procedures, policies, query builders,
   raw SQL, background jobs, and relevant tests. Track reviewed, partly reviewed,
   unavailable, and not-applicable surfaces.
2. **Reconstruct the data contract.** Map important entities, relationships,
   tenant boundaries, business invariants, and write/read paths. Distinguish the
   intended schema, the schema produced by migrations, and any observed deployed
   schema. Generated models alone do not establish deployed constraints. Read
   [schema and migration checks](references/schema-and-migrations.md).
3. **Trace representative workloads.** Prioritize critical writes, frequent or
   slow reads, high-cardinality operations, and authorization boundaries. Follow
   callers through ORM-generated SQL, scopes, transactions, retries, and consumers.
   Read [query, concurrency, and access checks](references/queries-and-access.md).
   Cover requested areas even when performance telemetry is unavailable.
4. **Validate candidates.** For each issue, show the reachable call path, inputs
   or interleaving, violated invariant or affected workload, and practical impact.
   Check database constraints, upstream validation, framework behavior, and other
   counterevidence. Use existing tests or a minimal isolated reproduction when
   useful. For performance, distinguish estimated plans from actual measurements;
   record dataset size, parameter shape, statistics, and workload limitations.
   Verify version-sensitive engine or ORM claims against official documentation.
5. **Recommend proportionate fixes.** Preserve business semantics. Explain the
   smallest effective change, migration or rollout risks, and how to verify it.
   Recommend indexes from observed predicates, ordering, joins, and workload,
   accounting for write/storage cost and existing indexes. Do not prescribe
   an index per foreign key, normalization, partitioning, or caching by habit.
6. **Report and stop.** Rank confirmed findings by impact and likelihood. Keep
   hypotheses and measurement requests separate; do not fill a quota. Audit
   authorization alone does not authorize remediation.

## Report

Start with scope, evidence type (static, plan-estimated, or reproduced/measured),
and coverage limitations. For each confirmed finding include:

- **Severity and category:** critical/high/medium/low; integrity, performance,
  concurrency, migration, or access. Justify severity using reachable impact;
  do not label an unmeasured optimization a high-severity defect.
- **Evidence:** precise `path:line` locations or named database objects, relevant
  query/caller, and the failing input, interleaving, plan, or measurement.
- **Impact and conditions:** who or what is affected, under which workload or
  deployment conditions, and what is verified versus inferred.
- **Remediation and verification:** a concrete change, compatibility and rollout
  considerations, and a focused test or measurement that demonstrates success.

Finish with open questions and the highest-value next checks. If nothing is
confirmed, say so within the reviewed scope. Missing telemetry or live access is
a coverage limitation, not evidence that the schema is safe or a query is slow.
