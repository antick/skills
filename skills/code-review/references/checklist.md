# Review checklist

Apply only the sections relevant to the change. Empty sections are valid.

## Requirements and correctness

- Every stated requirement and acceptance criterion is implemented.
- Changed paths handle relevant empty, null, error, retry, and boundary cases.
- Validation happens before mutation or external side effects.
- State transitions, return values, and error contracts match their callers.
- Concurrent work cannot overwrite, duplicate, or expose stale state.

## Security and privacy

- Authentication and authorization guard the actual operation and resource.
- External input is validated at the trust boundary.
- Queries, commands, templates, HTML, paths, and URLs are constructed safely.
- Secrets and sensitive data stay out of source, logs, errors, and responses.
- New data access preserves tenant, ownership, and permission boundaries.

## Errors and resources

- Errors remain observable and retain useful context.
- A catch does not silently turn failure into success.
- Locks, files, connections, transactions, timers, listeners, and child
  processes are released on success and every failure path.
- Partial failure cannot leave corrupt or misleading state.

## Performance and reliability

- No query or network request is repeated inside a growing loop without need.
- Algorithms and repeated lookups remain reasonable for real input sizes.
- Retries are bounded and safe; timeouts and cancellation are respected.
- Caches cannot serve data across the wrong user, tenant, version, or lifetime.

## Maintainability and scope

- Existing helpers and platform features are reused where they genuinely fit.
- New abstractions earn their cost through real reuse or a necessary boundary.
- No dead symbols, duplicate implementations, pass-through wrappers, or
  configuration added for hypothetical future needs.
- The change stays within the linked issue, ticket, or pull request intent.
- Public interfaces and stored data remain compatible, or the migration is
  explicit and tested.

## Tests, documentation, and UI

- Tests assert user-visible behavior and meaningful failure paths.
- Important acceptance criteria map to named tests that actually ran.
- Documentation, examples, and API contracts match changed behavior.
- UI changes preserve keyboard use, semantics, labels, focus, contrast, and
  responsive behavior where applicable.
