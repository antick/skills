---
name: plan-review
description: Review and revise an existing implementation plan or strategy against requirements and available evidence before execution. Use to challenge assumptions, find concrete gaps and failure paths, and decide whether a plan is ready. Does not implement the plan or replace final verification of completed work.
---

# Plan Review

Make a plan ready to execute by resolving concrete gaps and stating remaining
uncertainty. Confidence is a judgment supported by evidence, not a promise of
certainty or a reason to repeat a review indefinitely.

## Boundary and context

Review the supplied plan or the latest applicable plan in the conversation.
Read the original requirements, later clarifications, relevant repository
instructions, and linked specifications or discussion. If the plan is unavailable
or several incompatible plans remain plausible, request the missing target;
continue any independent requirements inspection without inventing a strategy.

Review and revise the plan in chat. Edit an existing plan file only when the user
asks to update that file or authorizes plan-file edits. Preserve manual content
and unrelated changes. Do not create unsolicited report or plan files.

This skill authorizes inspection and planning, not implementation, dependency
changes, deployment, publication, or changes to live data. Inspect commands before
running them; use read-only checks that do not execute untrusted project code or
alter the environment. Propose required experiments with their expected evidence
when they exceed the authorized scope. Existing explicit authorization remains
valid, but a plan-only review does not itself start implementation.

When the supplied plan belongs to an existing OpenSpec change, check it against
the applicable requirements and scenarios, and identify contradictions between
the proposal, design, and tasks. Treat unresolved contradictions as explicit
gaps rather than silently choosing an interpretation.

## Check the strategy

Scale the depth to the change. For each applicable area:

1. **Requirements:** map every requirement to a planned step and a meaningful
   completion check. Identify omitted behavior, scope expansion, conflicting
   requirements, and acceptance criteria too vague to verify.
2. **Evidence:** inspect the relevant code, callers, configuration, installed
   versions, and environment. Verify framework or provider assumptions against
   authoritative documentation when the strategy depends on them. Separate facts,
   proposed behavior, inferred assumptions, and unavailable evidence.
3. **Feasibility and order:** check prerequisites, permissions, external services,
   dependency order, contracts, and compatibility. Identify steps that depend on
   work or access the plan does not provide.
4. **Failure paths:** trace realistic invalid input, denied access, partial failure,
   retries, concurrent work, and deployment transitions. Check security boundaries,
   data migration, recovery, and rollback where relevant; name irreversible steps
   and the protection needed before them.
5. **Simplicity:** compare the approach with existing patterns and the smallest
   practical alternative. Challenge added layers, dependencies, and speculative
   work only when there is a concrete cost or a simpler adequate solution.
6. **Verification:** check that tests and runtime checks cover the actual behavior,
   failure paths, and acceptance criteria. Include rollout or recovery evidence
   when needed. Distinguish checks already performed during review from checks
   planned for implementation; neither a plausible plan nor green unrelated
   tests establishes working behavior.

For each issue, record the affected step, concrete trigger or unsupported
assumption, consequence, evidence, and smallest correction. Separate blockers
from nonblocking improvements and unresolved questions. Do not invent objections
to fill categories or expand a small task into a full-system audit.

## Revise and recheck

Apply justified corrections to the proposed plan. Preserve the user's scope and
approval boundaries. Recheck the complete revised plan against all requirements,
including the effects of the corrections on ordering, contracts, and verification.

Stop when a complete pass finds no unresolved blockers and no further material
corrections. Also stop when resolving a remaining issue requires unavailable
evidence or a user decision: state the exact gap, its consequence, and the next
action needed. Repeating the same speculation adds no evidence. Revisit a settled
decision only when new evidence or a concrete contradiction justifies it.

## Report

Lead with one of these outcomes and its reason:

- **Ready:** no known blockers remain within the inspected scope.
- **Ready with conditions:** execution can proceed only after named prerequisites
  or checks; place them before the dependent or irreversible steps in the plan.
- **Blocked:** a missing decision, conflicting requirement, or unavailable evidence
  prevents choosing a viable strategy. Name the input needed to resolve it.

Include the revised plan, material corrections and their evidence, checks actually
performed, remaining assumptions or limits, and any decisions needed. Link sources
and precise code locations where they support the conclusion. If the original
plan already holds up, keep it rather than rewriting for appearance. Never claim
100% certainty or exhaustive discovery of every possible failure. Final execution
and verification of the implementation remain separate work.
