# UI Design

Build a clear, coherent interface around the user's task and the product's real
content. Apply this guidance within the requested scope and the core workflow's
approval boundaries. Scale the effort to the change: a local fix needs a local
assessment, while a new screen needs a composition.

## Establish purpose and visual authority

Identify who uses the surface, what they need to accomplish or understand, the
primary action, and the content that supports it. Use the request and project
evidence first; ask only about missing facts that materially change the design.

Read existing design guidance, tokens, shared components, representative screens,
and supplied references or assets. Preserve established identity and interaction
patterns unless a redesign is requested. A missing design document does not make
an existing product a blank slate.

Choose the emphasis for this surface: marketing needs a clear offer, credible
proof, and an obvious next action; working applications need scanability,
appropriate density, and efficient tasks; reading surfaces need comprehension
and wayfinding. A product can contain all three.

## Make hierarchy follow the task

Before implementation, name what leads, what supports it, which information
belongs together, and how the structure adapts at smaller sizes. Include these
decisions in the core workflow's layout sketch when one is required.

Group related content through proximity and alignment. Separate distinct groups
with space before introducing containers. Use cards, tables, lists, and repeated
layouts when their relationships fit the content. Give primary and secondary
actions visibly different emphasis.

For example, an invoice screen used to chase overdue payments should foreground
overdue invoices and follow-up actions; summary totals support that work. The
layout follows this priority rather than starting with a row of metric cards.

## Build a coherent visual system

- Use the project's typography roles and spacing scale. Make heading levels,
  reading width, alignment, and grouping express the information hierarchy.
- Use semantic colors consistently, with readable contrast and clear focus and
  status cues. Keep meaning available beyond color alone.
- Keep icon style, borders, radii, and elevation consistent with shared controls.
  Familiar fonts and conventional components are valid when they fit the product.
- Give imagery, decoration, and motion a clear purpose: explain the product,
  establish its identity, direct attention, or communicate interaction. Respect
  reduced motion and keep controls usable without animation.
- Use realistic content and available assets. Preserve factual copy and label
  illustrative data honestly; invented claims cannot supply missing credibility.
- Complete the relevant loading, empty, error, disabled, and success states using
  existing patterns. Check long text, missing content, and recovery actions.

For a new identity or an explicit redesign, settle a concise visual direction
from the audience, content, and supplied references. Explore alternatives when
the direction is genuinely open. Routine additions inherit the existing system;
they do not need a new concept exercise. Judge aesthetic choices by their fit
and effect on users, rather than a universal list of forbidden styles.

## Verify the rendered result

As part of the core workflow's runtime verification, inspect the changed surface
at representative narrow and wide sizes and any intermediate width where its
structure changes. Use the real task path, relevant states, and realistic content.

Check whether the primary task is apparent, grouping and reading order remain
clear, text wraps legibly, and content or controls overflow. Exercise keyboard
focus and input, zoom, contrast, and touch targets where applicable. Compare with
neighboring screens or the agreed reference to catch accidental visual drift.

Fix blocked tasks and inaccessible states first, then hierarchy and responsive
problems, then visual inconsistencies. Reinspect after corrections. A clean lint
or build result does not establish visual quality; report unavailable rendered
checks explicitly. Keep new screenshots, tooling, and tests proportional to the
change and within the core workflow's verification requirements.
