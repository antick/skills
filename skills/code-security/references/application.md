# Application and supply-chain review

Select checks from the actual architecture. A library, CLI, desktop app, static
site, and multi-tenant API do not share the same attack surface. Use
[OWASP ASVS](https://owasp.org/projects/asvs) for applicable verification
requirements and its [cheat sheet index](https://cheatsheetseries.owasp.org/IndexASVS.html)
for implementation guidance. Do not claim ASVS compliance from a partial review.

## Trace security-sensitive flows

- Authentication and sessions: credential verification, recovery, token
  validation, expiry, revocation, and session boundaries.
- Authorization: tenant and object ownership, role changes, administrative
  operations, and enforcement on every externally reachable path.
- Untrusted input: database and shell operations, templates, HTML rendering,
  deserialization, file paths, archives, uploads, and outbound requests.
  Follow transformations and framework protections before calling a sink unsafe.
- Sensitive state: secret storage, encryption and key handling, personal data
  in logs or responses, browser persistence, and error handling.
- Abuse and business logic: replay, webhook authenticity, payment or entitlement
  decisions, race conditions, and resource exhaustion on meaningful exposed paths.
- Platform boundaries: browser origin and message validation, extension
  permissions, desktop renderer-to-host bridges, local file or process access,
  container privileges, and cloud IAM where relevant.

Test the actual attack model. Rendering trusted constants is not stored XSS;
an internal helper may rely on a verified upstream authorization check; a CLI
running a command explicitly selected by its owner may cross no trust boundary.
Do not assume those protections exist either: locate the callers and controls.

## Dependencies and build inputs

Inventory resolved versions from lockfiles, vendored code, container images,
build tools, and downloaded binaries. Check direct and transitive dependencies.
For each advisory candidate, record the package ecosystem, installed version,
affected range, advisory URL and date, patched versions if known, and required
conditions. Trace runtime or build-time usage. Development-only dependencies
can affect privileged CI; a matching version alone does not prove a reachable
application exploit. If reachability is unresolved, say so separately from the
confirmed presence of an affected version.

Inspect registry sources, install hooks, integrity verification, update flows,
and executable downloads. Missing a lockfile, an old dependency, or a mutable
reference is usually a hardening observation unless a concrete security failure
is established. Never invent a CVE or recommend an unverified fixed version.

## Secrets and distribution

Inspect tracked configuration, fixtures, generated bundles, package inclusion
rules, containers, source maps, and release artifacts when available. Review
accessible Git history for secret exposure with redacted output; report the
examined refs and whether the clone is shallow. A current-tree scan does not
cover all historical commits, forks, caches, or published packages.

Differentiate credentials from public identifiers, documented test keys, and
placeholders. Report a credible exposed credential by type and location without
its value; label validity and privileges unknown unless supported by permitted
evidence. Do not claim account compromise just because a token-shaped string
exists. Recommend revocation or rotation for actual exposures; deletion from
the current file does not invalidate a credential or remove historical copies.

Verify which files actually ship before asserting that local secrets enter a
package. Assess provenance or signing together with consumer verification and
the integrity of the producing workflow; a signature cannot make an untrusted
build trustworthy.

## Tool evidence

Use available, appropriate tools rather than demanding a fixed installation:
language analyzers, dependency advisory tools, redacting secret scanners, and
container or infrastructure scanners. Prefer scan modes that do not execute
repository code. Check network behavior before sending manifests or artifacts
outside the environment. Preserve sanitized evidence and distinguish a failed
or unsupported scan from a scan that completed with no findings.

[OpenSSF Scorecard checks](https://github.com/ossf/scorecard/blob/main/docs/checks.md)
provide additional supply-chain signals, not proof of exploitability or a
substitute for source review.
