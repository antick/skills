---
name: security-remediation
description: Fix confirmed security vulnerabilities with regression evidence and a bounded rollout plan. Use to remediate audit findings, authorization flaws, injection, unsafe data handling, or vulnerable dependencies; not for a report-only audit.
---

# Security Remediation

Close a reachable vulnerability while preserving legitimate use. Treat scanner
output and prior reports as candidates to verify, not automatic patch instructions.

## Confirm the failure and scope

Read instructions, Git state, the finding, affected versions, deployment assumptions,
and relevant callers. Trace attacker-controlled input, trust boundary, required
privileges, sensitive operation, and impact. Check upstream validation, access
rules, and runtime configuration for counterevidence. Consult primary advisories
and current official documentation for version-sensitive claims.

Separate an actively suspected compromise from preventive remediation. Preserve
evidence and identify containment needs; do not erase logs, rotate credentials,
change accounts, or disclose a vulnerability publicly without authorization.
Use redacted examples and synthetic data. Never test discovered credentials or
send exploit traffic to production just to prove reachability.

## Establish a regression

Use a disposable environment and the existing test setup. Demonstrate the failing
security invariant before patching, then assert both the denial and absence of
forbidden side effects. Examples include cross-tenant reads/writes, bypassed role
checks, unsafe path traversal, replayed webhooks, and untrusted input reaching an
interpreter. Keep exploit fixtures minimal and non-destructive.

Test a legitimate request alongside the malicious or unauthorized request so
blocking all traffic cannot count as a fix. If reproduction is unavailable,
state the evidence gap and validate the affected path as far as possible without
inventing a successful exploit.

## Repair at the boundary

Fix the shared root cause and trace alternate entry points, background jobs, and
batch operations. Prefer supported parameterization, escaping for the actual
output context, verified identity/ownership, and narrowly scoped privileges.
Do not replace robust library validation with a homegrown denylist or cosmetic
client-side checks. Preserve security logging without recording secrets.

For dependency findings, verify the installed path and fixed version, compatibility,
and advisory status. Inspect lockfile changes and necessary migrations; do not
force an audit fix or add an unexplained override. Normal upgrades use exact
stable versions at least 48 hours old. If an urgent security fix is newer, explain
the tradeoff and request an explicit exception rather than silently breaking
the project's version policy or claiming the older version is fixed.

For stored data or protocol changes, define compatibility, backfill, rollback,
and mixed-version behavior. Update OpenAPI for changed endpoints. Prepare account,
infrastructure, credential, and production actions separately when they exceed
the authorized code fix; name the exact remaining action.

## Verify and report

Show the regression fails before and passes after the fix, then run relevant
integration tests, full available tests, lint/types/build, and applicable scanners.
Check alternate callers and legitimate behavior. Report vulnerability conditions,
root cause, fixed boundary, evidence, deployment requirements, and residual risk.
Do not equate a merged patch or green scanner with an applied production fix.
Keep public PR wording free of secrets and unnecessary exploit detail.
