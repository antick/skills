# Query, concurrency, and access checks

## Query correctness and workload

- Trace ORM operations to generated SQL where available. Look for N+1 reads,
  lazy-loading in loops, unbounded materialization, excess projection, repeated
  aggregates, and bulk operations that silently become per-row work. Establish
  request frequency and data volume; a loop alone is not a performance finding.
- Check joins and aggregates for row multiplication, missing predicates,
  unintended inner joins, NULL behavior, and incorrect counts. Trace filter
  grouping and tenant scopes through raw SQL and query-builder escape hatches.
- Check pagination for deterministic ordering with a unique tie-breaker and
  behavior during inserts/deletes. Compare offset and cursor costs against the
  actual access pattern; do not demand cursor pagination for every bounded list.
- Match candidate indexes to equality/range predicates, joins, ordering, and
  selectivity. Inspect existing composite/partial/expression/covering indexes and
  engine capabilities. Account for casts, functions, collations, parameterized
  predicates, and write overhead. Do not infer redundancy from column prefixes
  alone: uniqueness, predicates, ordering, and access methods can differ.
- A sequential scan may be optimal for a small table or broad query. An unused
  index statistic may reflect a short observation window or rare critical job.
  State the evidence needed before proposing an index addition or removal.

## Plans and measurements

Prefer supplied plans and existing aggregate telemetry. For authorized plan
collection, first verify whether the selected command executes the statement.
Use bounded, representative parameters without disclosing customer values.

Record the engine/version, query shape, parameter distribution, row counts,
statistics freshness, and whether the plan is estimated or executed. Examine
row-estimation errors, rows visited versus returned, join loops, sorts/spills,
index predicates, and lock/wait evidence as supported by the engine. Do not sum
nested plan timings blindly or claim a speedup from optimizer cost units.

Verify rewrites preserve duplicates, NULLs, ordering, tenant filters, and
transaction semantics. Compare on the same representative dataset and conditions;
tiny fixtures and a single warm-cache run do not prove production performance.
If measurements are unavailable, report a supported structural defect or label
the optimization as a hypothesis with a specific next measurement.

## Transactions and concurrency

- Trace read-modify-write operations, check-then-insert, counters, inventory,
  balances, and state transitions. Show an explicit two-session interleaving
  before asserting a lost update, duplicate, oversell, or write-skew defect.
- Establish actual isolation levels, autocommit boundaries, connection usage,
  constraints, locks, and atomic update semantics. An ORM transaction wrapper
  does not prove every operation uses the same transaction or connection.
- Check lock ordering, long transactions, network calls while locks are held,
  deadlock/serialization retries, and timeout handling. Retries must preserve
  idempotency and retry the correct unit of work with a bounded policy.
- Trace database writes paired with payments, messages, or other external
  effects. Check commit/failure order, deduplication, and reconciliation; do not
  suggest wrapping network calls in a database transaction as atomicity proof.
- Where replicas or distributed stores are used, establish read-after-write,
  staleness, routing, and cross-partition guarantees required by callers.

## Access and data protection

- Trace untrusted values into SQL. Bind values; dynamic identifiers, sort keys,
  and operators need a safe construction path or allowlist. An ORM does not
  automatically make raw fragments safe. Confirm reachability and driver behavior.
- Check authorization for reads and writes, including jobs, admin/service paths,
  soft-deleted data, and tenant ownership changes. Distinguish application-enforced
  authorization from database-enforced policy; lack of row security alone is not
  a vulnerability when the architecture enforces access elsewhere.
- For row security, examine effective runtime roles, ownership/bypass privileges,
  enabled/forced policies, and both row visibility and permitted new values.
  Review privileged routines and views under their actual execution context.
- Compare runtime, migration, reporting, and backup privileges. Check transport,
  secret handling, sensitive-data logging, retention, and encryption configuration
  only within available evidence. Redact values rather than reproducing leaks.

## Primary documentation

Consult the matching engine/version and ORM documentation for conclusions:

- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html),
  [transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html),
  and [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
- [MySQL EXPLAIN](https://dev.mysql.com/doc/refman/8.4/en/explain.html).
- [SQLite query planning](https://www.sqlite.org/eqp.html).
- [MongoDB explain results](https://www.mongodb.com/docs/manual/reference/explain-results/).
