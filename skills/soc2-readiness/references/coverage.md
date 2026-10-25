# Criteria and evidence coverage

Use this as an assessment index, not AICPA criterion text or an exhaustive list of
prescribed controls. Criterion labels below are shorthand. Verify exact wording
and applicability using [primary sources](sources.md). The 2017 TSC with revised
2022 points of focus contains 33 common criteria and 28 additional criteria.
Track individual IDs even when the report groups related criteria. A single
technical check does not satisfy an entire criterion.

## Common criteria index

| Family | Criterion IDs and review cues |
| --- | --- |
| CC1 | CC1.1 ethics; CC1.2 oversight; CC1.3 authority; CC1.4 competence; CC1.5 accountability |
| CC2 | CC2.1 information quality; CC2.2 internal communication; CC2.3 external communication |
| CC3 | CC3.1 objectives; CC3.2 risks; CC3.3 fraud; CC3.4 change |
| CC4 | CC4.1 evaluation; CC4.2 deficiencies |
| CC5 | CC5.1 control selection; CC5.2 technology controls; CC5.3 procedures |
| CC6 | CC6.1 logical access; CC6.2 identities; CC6.3 authorization; CC6.4 physical access; CC6.5 asset disposal; CC6.6 boundaries; CC6.7 transmission; CC6.8 malicious software |
| CC7 | CC7.1 vulnerability/configuration detection; CC7.2 anomalies; CC7.3 event evaluation; CC7.4 response; CC7.5 recovery |
| CC8 | CC8.1 changes |
| CC9 | CC9.1 disruption risks; CC9.2 vendors/partners |

## Evidence collection prompts

These are suggested ways to investigate the index. Organizations can implement
other effective controls. Use their risk assessment, commitments, control matrix,
and auditor-agreed scope to decide expectations and frequency.

| Area / likely mapping | Inspect or request | Examples of candidates to validate |
| --- | --- | --- |
| Governance and people / CC1 | Approved policies, responsibilities, oversight minutes, competence/training, confidentiality acknowledgments, hiring and disciplinary processes; screening where lawful and appropriate | Unassigned control ownership; observed onboarding omitting a required step; policy claims contradicted by execution records |
| Information and communication / CC2 | Asset and data inventories, architecture/data flows, policy distribution, customer commitments, incident reporting channels, external notices | Inventories omit known production systems; employees lack the documented reporting route; published commitments differ from actual service behavior |
| Risk / CC3 | Risk register, scope and objectives, threat/fraud scenarios, risk acceptance and expiry, significant-change assessments | Known risks have no evaluation/treatment; material new service or vendor absent from assessments |
| Monitoring / CC4 | Control evaluations, internal reviews, exception tracking, owner escalation and closure records | Repeated failing checks closed without evidence; overdue accepted-risk expiry; incomplete review populations |
| Control design / CC5 | Control matrix, ownership, approved procedures, technical enforcement, dependencies between controls | Written approval process bypassed by actual release path; controls do not address a documented risk |
| Identity / CC6.1–CC6.3 | IdP/cloud/Git access exports, effective MFA/SSO rules, privileged and service accounts, joiner/mover/leaver tickets, access reviews, secret inventory | Orphaned accounts; excessive permissions; access survives termination; tenant authorization bypass; unmanaged long-lived keys |
| Facilities and devices / CC6.4–CC6.5 | Office/data-center responsibility, badge/visitor records, remote-work controls, device inventory, MDM encryption/lock/patch records, wipe/disposal evidence | Lost equipment retains accessible data; access not revoked; disposal records omit data sanitization. Cloud hosting does not remove office/device responsibilities |
| Infrastructure and data movement / CC6.1, CC6.6–CC6.7 | Effective network rules, bucket/database exposure, TLS, encryption/key access, egress and export controls, environment separation | Public sensitive storage; overly broad inbound rules; production data in unprotected test systems; secrets or sensitive data in logs |
| Malware and vulnerabilities / CC6.8, CC7.1 | Dependency/image/OS inventories, scanner scope/date, triage, remediation policy, endpoint protection, penetration-test evidence when selected/committed | Exploitable unpatched component beyond policy; excluded production assets; scanner failures hidden as passing; unsigned/untrusted execution paths |
| Detection and response / CC7.2–CC7.5 | Audit logs, protected log access, alert routing, on-call/triage records, incident plan, tabletop/incident actions, recovery validation | Alerts have no recipient; logs cannot cover investigated events; incident actions never verified; sensitive logs broadly accessible |
| Development and releases / CC8.1 | Effective branch/environment rules, PR approvals, CI permissions, test results, artifact provenance, change tickets, emergency changes and rollback | Direct production deployment bypasses required review; untrusted CI can access production secrets; emergency changes lack subsequent review required by policy |
| Resilience and third parties / CC9 | BCP/DR risk scenarios, critical dependencies, vendor inventory/tiering, due diligence, contracts, SOC reports and follow-up | Critical vendor never evaluated; report scope/period excludes relied-on service; supplier failures have no mitigation; complementary controls not implemented |

For each evidence source, capture the scoped system/resource, owner, collection
date, effective period, population completeness, exceptions and resolution. A
permission-denied API response or a missing repo document establishes no absence
of the real-world control. A current clean configuration cannot prove a historical
period without change/execution evidence.

## Additional categories

Assess when included in scope; otherwise record excluded or applicability
unresolved. Personal data in an application does not automatically select the
Privacy category. Security-related handling of that data still needs review.

| Category and criteria | Suggested evidence and checks |
| --- | --- |
| Availability: A1.1 capacity; A1.2 safeguards/recovery; A1.3 recovery testing | Compare SLO/SLA commitments with capacity monitoring and alerts. Inspect redundancy, environmental responsibility, backup configuration and execution, recovery access, restore results and DR exercises against the organization's RTO/RPO. A backup job is not evidence of recoverability. |
| Confidentiality: C1.1 identification/protection; C1.2 disposal | Inspect data classification, contractual secrecy, access and export controls, retention schedules, deletion propagation, backups and legal holds. Verify deletion evidence and its stated limits. |
| Processing Integrity: PI1.1 specifications; PI1.2 inputs; PI1.3 processing; PI1.4 outputs; PI1.5 storage | Trace important transactions from input to stored result. Inspect validation, authorization, reconciliation, duplicate/retry handling, failure queues, output delivery and protection. Use real execution/reconciliation records as well as tests. |
| Privacy: P1.1 notice; P2.1 choice/consent; P3.1–P3.2 collection; P4.1–P4.3 use/retention/disposal; P5.1–P5.2 access/correction; P6.1–P6.7 disclosure/notification/accounting; P7.1 quality; P8.1 monitoring/enforcement | Establish controller/processor responsibilities and stated purposes. Inspect notices, consent records, minimization, sensitive-data collection, requests and corrections, retention/deletion, disclosure records, supplier commitments, breach escalation, complaints and resolution. Compare actual data flows with notices and contracts; verify applicable legal obligations separately. |

Privacy traceability: P3.1 collection purpose, P3.2 required explicit consent and consequences
before collection; P4.1 purpose-limited use, P4.2 retention, P4.3 disposal; P5.1 access,
P5.2 correction; P6.1 disclosure consent, P6.2 authorized-disclosure records,
P6.3 unauthorized-disclosure records, P6.4 third-party commitments/assessment,
P6.5 third-party breach reporting, P6.6 breach notification, P6.7 accounting to
data subjects. Do not substitute generic GDPR labels for these mappings.

## Description and examination preparation

Alongside the TSC assessment, check readiness to describe the actual service
using the AICPA Description Criteria. This is separate from satisfying controls:

- Services, principal commitments and system requirements; boundaries and relevant
  infrastructure, software, people, procedures, and data.
- Significant events/incidents and system changes relevant to the description.
- Applicable criteria and related controls; explanations for proposed exclusions.
- Subservice organizations and inclusive versus carve-out treatment; controls
  expected of customers (CUECs) and subservice organizations (CSOCs). Inspect
  supplier report scope, opinion, exceptions, period gaps and bridge evidence.
  A supplier's SOC report does not establish the service's own controls.
- Management responsibility, assertion readiness, evidence owners and approved
  description. Confirm formal report requirements with the engaged CPA firm.

For Type II request period-wide populations such as personnel changes, access
reviews, production changes, security incidents, vulnerability remediation,
backup executions and restore tests. Record how samples were chosen and what
was not tested. Correcting today's setting does not erase a past exception.
