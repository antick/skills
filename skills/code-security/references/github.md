# GitHub Actions and public-repository review

Review workflows together with invoked scripts, local/composite actions,
reusable workflows, and release consumers. Include non-PR entry points such
as comments, dispatches, tags, releases, and scheduled automation. Record the
event, actor, checked-out ref, attacker-controlled inputs, effective privileges,
runner, and outputs for each security-sensitive job.

## Execution and privilege boundaries

Use GitHub's [secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
for workflow controls:

- Trace untrusted expression values into shell or generated programs. Passing
  input through an environment variable still needs safe quoting and use.
- Determine effective token permissions and secret availability per job,
  including inherited settings. Omitted YAML permissions do not alone prove
  write access. Inspect checkout credential persistence and later commands.
- Check third-party actions and reusable workflows for full commit pinning,
  executable downloads for integrity checks, and containers for immutable
  references. Pinning alone does not establish that code is trustworthy.
- Inspect self-hosted runner reachability from untrusted jobs, isolation,
  persistence, and access to internal networks or credentials.

Use the [workflow event reference](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
to reason about `pull_request`, `pull_request_target`, and `workflow_run`:

- Trace whether a privileged context checks out, installs, builds, tests, or
  otherwise executes contributor-controlled content. A metadata-only labeling
  workflow is not vulnerable merely because it uses `pull_request_target`.
- For workflow chaining, validate origin, triggering event, branch, run identity,
  and artifact association before trusting outputs. Successful completion does
  not make a contributor-produced artifact trusted.
- Follow cache, artifact, and generated-file movement between untrusted and
  privileged jobs. Report poisoning only when the producer can influence data
  the privileged consumer actually uses across an allowed platform boundary.
- Account for fork policies, approval gates, and exact event semantics. Do not
  assume all fork jobs receive secrets or that an approval makes code safe.

## Cloud credentials and release authority

For [OIDC](https://docs.github.com/en/actions/concepts/security/openid-connect),
inspect `id-token` permission alongside the provider's audience, subject, repo,
ref or environment restrictions, and granted role. OIDC issuance alone does
not confer cloud access. An unavailable provider trust policy is a coverage gap;
do not assert that any fork can assume a role without evidence.

Trace who can choose release source, modify tags, approve environments, obtain
publishing authority, or replace artifacts. Examine registry trusted-publishing
configuration if accessible. Check that attestations bind the intended source,
builder, and artifact, and that consumers verify what they rely on. Missing
attestations alone are a hardening opportunity, not a proven compromise.

## Hosted controls and public exposure

Inspect live settings with read-only tools where available; record which
settings could not be inspected. Follow pagination for list APIs. Relevant
surfaces include:

- Visibility and default branch; branch protection and effective organization
  or repository [rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets),
  enforcement mode, bypass actors, required reviews/checks, and tag protections.
  A ruleset in evaluation mode is not enforced. CODEOWNERS does not by itself
  require approval, and a missing local file says nothing about hosted rules.
- Actions permissions, permitted actions, fork approval and token policies;
  environment restrictions and reviewers; runner groups and release access.
- [Secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning),
  push protection, code scanning, dependency alerts, and their actual coverage.
  Do not equate unavailable alert access with no alerts. A missing vendor-specific
  scanner does not prove vulnerabilities or justify a severity by itself.
- Public logs, downloadable artifacts, packages, history, and documentation
  that expose sensitive material; disclosure instructions in SECURITY.md and
  available private reporting channels. Avoid copying sensitive payloads into
  a public issue or report destination.

Public visibility changes who can supply inputs and retrieve outputs; it is
not itself a defect. Explain the specific authority or data at risk. Missing
process documents or defense-in-depth controls belong in hardening observations
unless evidence establishes a concrete attack path.
