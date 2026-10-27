# Schema and migration checks

Use the checks relevant to the discovered data model. Follow declarations through
actual writes and reads before treating a design choice as a defect.

## Integrity and modeling

- Identify business uniqueness and required fields. Compare application checks
  with enforced primary keys, unique constraints, nullability, and checks. A
  check-then-insert path can race; nullable uniqueness and collation semantics
  vary by engine and version. Establish the intended invariant first.
- Check relationship direction, optionality, deletion/update actions, orphan
  handling, and soft-delete behavior. In tenant-owned data, establish whether a
  child can reference another tenant's parent despite a valid foreign key.
  Inspect composite keys and application authorization together.
- Trace type conversions and boundary values: money precision and rounding,
  identifier size, timestamp/time-zone assumptions, string collation and case,
  enum evolution, JSON validation, and default values. Flag concrete lossy or
  invalid paths rather than preferring one type universally.
- Inspect views, triggers, generated columns, and stored routines for hidden
  writes, inconsistent derived state, and application assumptions they invalidate.
  Distinguish intentional denormalization with a repair/update contract from
  independently mutable copies that can diverge.
- For document/key-value stores, examine validators, document growth, embedding
  versus references, uniqueness, partition/shard keys, hot partitions, and atomic
  update boundaries using that engine's semantics. Do not transfer SQL rules
  mechanically to a different storage model.

## Migration history and rollout

- Compare migration order, recorded checksums, schema snapshots, generated client
  expectations, and deployment scripts. Separate drift proven by supplied or
  authorized metadata from drift suspected from conflicting source files.
- Inspect both fresh-install and upgrade paths. Consider existing nulls,
  duplicates, orphaned rows, or incompatible values before tightening constraints
  or converting types. Do not execute a full production scan to prove these.
- Trace compatibility while old and new application instances coexist. Renames,
  drops, enum changes, and altered defaults can require an expand/backfill/contract
  rollout. Identify which deployed caller breaks and when.
- Evaluate DDL locks, table rewrites, online/concurrent operation restrictions,
  transaction support, and failure recovery for the actual engine/version and
  table size. The word "online" alone does not establish zero blocking.
- For backfills, check bounded batches, deterministic progress, restartability,
  idempotency, concurrent writes, and reconciliation before switching reads.
  Distinguish a reversible schema change from an irreversible data conversion;
  a down migration is not a backup or proof of recoverability.
- Inspect retention and deletion paths, including soft-deleted rows, dependent
  records, and derived data. Where operations are in scope, assess backup/restore
  evidence, replica lag, failover, and recovery objectives. A configured backup
  is not evidence of a tested restore.

## Engine-specific evidence

Determine the deployed version before relying on version-dependent behavior.
Use official documentation for the actual engine and ORM; these are entry points,
not an instruction to load every manual:

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
  and [ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html).
- [MySQL ALTER TABLE](https://dev.mysql.com/doc/refman/8.4/en/alter-table.html)
  and [InnoDB online DDL](https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl.html).
- [SQLite foreign keys](https://www.sqlite.org/foreignkeys.html): verify effective
  enforcement for each application connection rather than assuming a declared
  foreign key is enforced.
- [MongoDB schema validation](https://www.mongodb.com/docs/manual/core/schema-validation/).
