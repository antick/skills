---
name: code-audit
description: Audit an entire repository for unnecessary complexity and opportunities to delete or simplify code. Use when the user asks for a repository-wide over-engineering audit, bloat assessment, or ranked list of what can be removed. It reports findings without applying fixes.
---

# Code Audit

Scan the repository for complexity that can be removed without losing required behavior.

## Process

1. Read the project instructions, manifests, entry points, and major module boundaries.
2. Search all callers and tests before declaring code dead or an abstraction unnecessary.
3. Find duplicated implementations, needless dependencies, single-use layers, dead flags, speculative configuration, and custom code covered by standard or native features.
4. Rank findings by the largest safe reduction in maintenance cost.

Use these tags: `delete`, `reuse`, `stdlib`, `native`, `yagni`, and `shrink`.

## Output

`path:line — tag: what to remove or simplify → concrete replacement`

Every finding needs repository evidence and a currently reachable reason to change it. Keep correctness, security, accessibility, data protection, and useful tests outside the cut list.

If nothing should be simplified, say `Already plain. Ship it.` This skill reports findings and does not apply fixes.
