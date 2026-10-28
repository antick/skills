---
name: documentation-generation
description: Generate or update source-backed project documentation, API guides, setup instructions, and operational runbooks. Use when documentation must reflect actual code and verified commands rather than a generic template.
---

# Documentation Generation

Write documentation readers can use and maintain. Separate source-derived facts,
verified behavior, product intent, and unresolved assumptions.

## Choose the reader and source of truth

Read repository instructions and existing docs before creating files. Infer the
audience and requested deliverable from the task; ask only if the distinction
would materially change content, such as end-user help versus operator runbooks.
Use the established documentation location and format. Do not create a parallel
README, architecture guide, or policy that conflicts with an existing one.

Inspect relevant entry points, public APIs, configuration schemas, manifests,
scripts, workflows, migrations, tests, and examples. Record exact source paths
and the inspected commit. Use implementation and verified behavior for current
facts; tests and old prose may describe intent rather than reality.

## Write around real tasks

- Setup: prerequisites, supported versions, commands, configuration names with
  placeholders, expected result, and cleanup. Never include actual credentials.
- API: authentication, request/response schemas, errors, pagination, idempotency,
  and working examples. Use the existing OpenAPI generator/spec as authority;
  update `openapi.json` if the endpoint contract itself changes.
- Operations: trigger, target environment, required access, preconditions, exact
  steps, verification, failure recovery, and escalation. Clearly mark commands
  that mutate data, publish, rotate secrets, or deploy.
- Library usage: minimal real imports and supported contracts, including failure
  behavior and lifecycle/disposal where needed. Check packaged public exports.
- Explanations: connect the relevant modules and decisions with source links.
  Do not invent historical rationale; label inferred reasons or omit them.

Use shared terminology and existing date/format conventions. Prefer short runnable
examples over copied implementation. Keep generated reference material separate
from human-maintained explanation, and preserve user-authored sections when
regenerating. Do not overwrite approved docs with a boilerplate scaffold.

## Verify examples and claims

Inspect commands before running them. Execute safe examples and setup checks in
a disposable environment using the documented versions where feasible. Never
deploy, publish, reset real databases, or create accounts merely to validate prose.
Run existing doc/link/snippet checks and relevant tests when examples or generators
are executable. Check local links, file paths, environment variable names, and
consistency with actual scripts and public exports.

For unavailable services, provide prerequisites and mark the example unexecuted.
Do not replace a failing documented command with a plausible untested command
and call it verified. Fix documentation errors within scope; report unrelated
implementation defects separately unless fixes were requested.

## Deliver

Report created/updated documents, their audience, sources checked, commands/examples
executed, and remaining assumptions. Keep a single canonical explanation for each
topic and link to it from related pages. Avoid promising automatic synchronization
unless a real generator or CI check enforces it.
