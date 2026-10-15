# Evidence, severity, and report format

## Admission criteria

A confirmed vulnerability needs a locatable defect or exposure, a realistic
attacker and prerequisite, a reachable path across a trust boundary, and a
supported confidentiality, integrity, or availability impact. Cite exact
`path:line` locations at the audited revision, relevant configuration, or dated
hosted-setting evidence. Include every material link in a multi-file chain.

Try to disprove a candidate: check authorization middleware, caller restrictions,
escaping, framework behavior, workflow conditions, effective permissions, and
deployment configuration. Explain why applicable controls fail. If a critical
link remains unknown, classify the candidate as unverified and name the
evidence needed. Do not hide assumptions in a confidently worded headline.

Separate these categories in the report:

- **Confirmed vulnerabilities:** evidence establishes the security failure,
  through source/configuration reasoning or a safe reproduction.
- **Unverified candidates:** plausible paths with a missing material fact;
  describe the conditional impact, not an asserted severity or exploit.
- **Hardening observations:** concrete improvements without an established
  vulnerability. Give an action and rationale without adding to severity totals.
- **Coverage gaps:** inaccessible settings, unexamined components/history,
  failed tools, and missing runtime evidence; never count these as findings.

An affected dependency version can be confirmed while its exploitability here
is unverified. Keep those statements distinct. Deduplicate scanner aliases,
repeated instances, and attack-chain consequences under their root cause;
list affected locations without multiplying vulnerability counts.

## Severity and confidence

Assign severity to the demonstrated impact in this repository, accounting for
attacker access, user interaction, configuration, breadth, and compensating
controls. Explain the reasoning in one or two sentences. These are contextual
audit labels, not automatic mappings from a CWE, scanner rating, or keyword:

| Severity | Required basis |
| --- | --- |
| Critical | A supported path to broad system, release, or sensitive-data compromise with low practical barriers and catastrophic impact in the stated environment. Reserve for exceptional cases. |
| High | Serious compromise of important data, authorization, execution, or publishing authority, with realistic prerequisites and substantial impact. |
| Medium | Meaningful but bounded security impact, or an impactful path substantially constrained by attacker privileges, interaction, or scope. |
| Low | A demonstrated minor security impact with limited scope; not a bucket for stylistic concerns or generic best practices. |

Confidence describes evidence, not impact: **High** means the material chain is
directly established; **Medium** means the defect is established but some
nonessential environmental details remain uncertain. A missing essential link
makes the item unverified, rather than a low-confidence confirmed vulnerability.
Do not lower severity merely to conceal uncertainty, or raise it for dramatic
worst cases unsupported by the repository.

Use numeric CVSS only when requested or useful and enough facts are available.
Follow the [FIRST CVSS v4.0 specification](https://www.first.org/cvss/v4.0/specification-document);
provide the version, complete vector, score, and metric rationale, and verify
the calculation with a conforming calculator. Keep any advisory's upstream
score separate from the repository assessment. CVSS severity does not by itself
determine business risk or remediation priority. Do not invent precise scores.

## Required report structure

Use Markdown unless the user specifies another format. Scale detail to the
findings; keep the following information even when there are no findings.

### Security audit report — repository and revision

1. **Summary:** overall supported conclusion, counts by severity for confirmed
   vulnerabilities only, and the most important next actions. Avoid a numeric
   repository security grade, alarmist language, or assertions of total safety.
2. **Scope and method:** date, commit/branch and local modifications, verified
   visibility, inspected components and hosted controls, attacker model,
   deployment assumptions, tools/versions/commands, and evidence limitations.
3. **Confirmed findings:** ordered Critical, High, Medium, Low. Use stable IDs
   such as SEC-001 and include the fields below for each finding.
4. **Unverified candidates:** missing evidence and the smallest safe way to
   resolve each material uncertainty. Do not pad this with arbitrary hypotheses.
5. **Hardening observations:** relevant, concrete improvements kept separate
   from vulnerability counts and prioritised by their practical benefit.
6. **Coverage and next steps:** a compact table of reviewed, partly reviewed,
   not reviewed, and not-applicable surfaces with reasons; remaining verification
   and remediation order. State which checks failed or were not run.

### Finding fields

- **ID and factual title; severity; confidence.** State whether validation was
  a static trace or a reproduced behavior.
- **Evidence:** precise locations or hosted-setting evidence, and short redacted
  excerpts only when useful. Link relevant primary advisories or documentation.
- **Attack path and prerequisites:** what the attacker controls, required access
  or interaction, trigger, failed control, and reached asset or authority.
- **Impact and severity rationale:** the supported consequence and affected
  scope, including constraints and relevant compensating controls.
- **Remediation:** the smallest effective change addressing the root cause.
  If credentials were exposed, include containment, not just source deletion.
- **Verification:** a safe test or inspection that would prove the correction
  and preserve expected behavior. Do not say it passed unless it actually ran.

If there are no confirmed vulnerabilities, write: “No confirmed vulnerabilities
were identified in the reviewed scope.” Follow with actual limitations and any
substantiated observations. An empty vulnerability list is a valid result.

## Calibration examples

- A public fork's build script executes in a privileged release job: trace
  the event, checkout, execution, credential availability, and publication
  authority. Rate the verified consequence; do not assume production access.
- The same trigger only assigns a label using safely handled metadata and
  does not consume contributor code: no code-execution finding from the trigger.
- A workflow uses an action tag: normally a pinning recommendation, not evidence
  of a compromised action or automatic High severity.
- An API lookup returned 403: the setting is unverified, not disabled.
- A scanner finds a vulnerable package version: confirm the advisory match,
  then investigate runtime or build exposure before claiming the advertised exploit.
- A credential-like fixture has no evidence of authenticity: do not reproduce
  its value, assert it is live, or claim a breach.
