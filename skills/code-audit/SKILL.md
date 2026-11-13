---
name: code-audit
description: Audit an entire repository for unnecessary complexity and opportunities to delete or simplify code. Use when the user asks for a repository-wide over-engineering audit, bloat assessment, or ranked list of what can be removed. It reports findings without applying fixes.
---

# Code Audit

Scan the repository for complexity that can be removed without losing required behavior.

## Process

1. Read the project instructions, manifests, entry points, and major module boundaries.
   Map the major source directories and relevant configuration, scripts, and tests.
   Inspect each mapped area before finishing; record exclusions and inaccessible
   areas rather than claiming full coverage from a sample.
2. Find unused code, duplicate helpers, needless dependencies, obsolete comments,
   dead flags, speculative configuration, unnecessary wrappers and abstractions,
   and custom code covered by standard or native features.
3. For each candidate, trace callers, public exports, runtime registration,
   configuration, scripts, dynamic references, and side effects. A text search
   with no matches alone does not establish that code is unused. Check generated
   code and external consumers where applicable; retain uncertain candidates as
   unverified observations rather than confirmed removal recommendations.
4. Judge wrappers and abstractions by their purpose, not their length or number
   of callers. Preserve permission checks, provider isolation, compatibility,
   platform boundaries, and other required behavior. Similar code can have
   different contracts; consolidate only when those contracts fit.
5. Recommend removing a test only when remaining coverage demonstrably protects
   its distinct cases and failure modes. Similar assertions or passing tests
   alone do not prove redundancy. Preserve useful regression coverage and comments
   that explain constraints or intent; show why a comment is obsolete.
6. Rank confirmed findings by the largest safe reduction in maintenance cost.

Before recommending a package as unused, check source imports, CLI commands,
package scripts, configuration, framework plugins, runtime discovery, peer
requirements, and workspace consumers. A dependency-analysis tool provides
candidates, not proof. Report the owning manifest and evidence; leave uncertain
packages out of the confirmed removal list.

For architecture cleanup, trace dependency direction, cycles, shared ownership,
and runtime entry points before recommending a boundary change. Distinguish
intentional platform or trust boundaries from duplicated business behavior.
Describe a staged migration and compatibility risks for cross-module findings.
If implementation is requested, use `code-refactor` and its repository cleanup
workflow to apply the authorized changes with regression protection. An audit-only
request remains read-only; uncertain candidates stay unchanged.

Use these tags: `delete`, `reuse`, `stdlib`, `native`, `yagni`, and `shrink`.

## Output

`path:line — tag: what to remove or simplify → concrete replacement`

Every finding needs repository evidence and a currently reachable reason to change it. Keep correctness, security, accessibility, data protection, and useful tests outside the cut list.

Report the directories inspected, exclusions, and verification limits separately
from confirmed findings. For each proposed removal, include the usage evidence
and behavior or test coverage that must remain intact.

If no confirmed cleanup is justified, say so within the inspected scope. State
unresolved candidates without claiming they are safe to remove. This skill
reports findings and does not apply fixes.
