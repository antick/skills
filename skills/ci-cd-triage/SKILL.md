---
name: ci-cd-triage
description: Diagnose and repair failing CI builds, tests, packaging, or deployment pipelines. Use for failed workflow runs, local-versus-CI differences, broken artifacts, or deployment failures; security-only audits are a separate task.
---

# CI/CD Triage

Find the first causal failure for the exact run and commit. A green rerun alone
does not explain a failure or prove a deployment serves the requested revision.

## Establish run identity

Read repository instructions and current Git state. Obtain the failing run URL/ID,
provider, commit SHA, branch/ref, event, attempt, job/matrix, and environment from
available CI tools. Follow linked reusable workflows and local actions. If access
is unavailable, use provided logs and configuration and state that live status
is unverified. Do not invent logs from a generic error message.

Read failed steps and their preceding context before changing code. Trace the
first cause across dependent jobs; skipped jobs and missing artifacts are often
consequences. Preserve relevant redacted logs and reproduction conditions.

## Classify and reproduce

Separate source/test failures from dependency resolution, runner/tool versions,
permissions, credentials, service outages, cache behavior, artifact paths, and
deployment configuration. Compare the last successful run only if differences
in commit, event, environment, and matrix are accounted for.

Reproduce the failing command with the locked toolchain and equivalent environment
where feasible. Inspect scripts before execution; do not run deployment commands
locally as a diagnostic shortcut. Compare cold versus warm caches, generated-file
dependencies, working directories, case-sensitive paths, and platform assumptions.
Inspect secret names and scopes only, never values.

## Apply the smallest durable repair

- Fix source/test causes at their owner. Do not skip checks, weaken assertions,
  broaden permissions, or change protected branch rules to obtain green status.
- Correct task ordering and artifact production/consumption with explicit paths
  and provenance. Distinguish the built SHA from the deployed SHA.
- Correct caches with dependency/configuration inputs and separate trust levels.
  Do not delete every cache when a reproducible key or stale-output fix suffices.
- For transient infrastructure failures, state the evidence and use only a bounded
  rerun within authorization. Rerunning may republish or redeploy; inspect side
  effects first. Stop repeating the same failure without new evidence.
- For missing credentials or protected environments, prepare the exact required
  names/configuration and identify the account action needed. Do not mint secrets
  or replace an existing credential without authorization.

Use current official documentation for provider-specific syntax and supported
actions/tool versions. Validate workflow syntax with existing tools. If adding or
upgrading dependencies, use compatible exact stable versions at least 48 hours
old, verify release metadata, and report exceptions.

## Verify the result

Run available relevant tests, lint, type/build/package checks and workflow checks.
If pushing/rerunning is authorized, check the new run's exact SHA and affected
matrix, not an older green badge. For deployment repair, verify deployed revision,
health, and the affected user flow when authorized; build success is separate.
Use the host's monitoring tools when available instead of indefinite polling.

Report cause, fix, local evidence, hosted run links/status, deployed evidence, and
remaining blockers. A PR can be ready for review while CI is still pending; name
that state accurately. Never merge, publish, deploy, or change account settings
unless that action is included in the user's scope.
