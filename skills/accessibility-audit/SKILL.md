---
name: accessibility-audit
description: Audit accessibility and fix confirmed barriers when requested. Use for keyboard, focus, screen reader, contrast, zoom, motion, or form accessibility across web or native user journeys.
---

# Accessibility Audit

Assess whether people can complete the requested journeys. Audit-only requests
produce findings; audit-and-fix requests also authorize relevant code changes.
Do not claim full conformance from an automated scan or a limited sample.

## Establish coverage

Read project instructions, shared UI primitives, route/screen structure, tests,
and any stated accessibility target. For web, use the project's target or state
WCAG 2.2 AA as a working audit target, not a legal certification. Confirm current
criteria in [W3C guidance](https://www.w3.org/WAI/test-evaluate/) and the relevant
platform accessibility documentation. Record runtime, browser/device, assistive
technology, and pages/states actually examined.

Prioritize complete journeys and shared controls: navigation, authentication,
forms, dialogs, destructive actions, dynamic results, errors, and recovery. Include
empty/loading/disabled states and responsive layouts, not just static screenshots.
Use test accounts and disposable data for submissions.

## Combine automated and manual evidence

Use an existing automated scanner when available; validate its findings in context.
Then inspect:

- Keyboard order, visible focus, traps, skip paths, modal entry/exit, and focus
  restoration after navigation, deletion, or async updates.
- Accessible names, roles, states, headings, landmarks, labels, instructions,
  errors, and announcements. Prefer native semantics to redundant ARIA.
- Screen reader reading order and operation of custom widgets. Do not infer
  spoken output solely from DOM attributes; mark it untested without a reader.
- Contrast in actual states/themes, non-color status cues, zoom/reflow, text
  resizing, target usability, and content obscured by overlays or keyboards.
- Reduced motion, animation controls, time limits, media alternatives, and
  gesture alternatives where the product uses them.
- Native accessibility tree, dynamic text, focus grouping, and platform actions
  when reviewing iOS/Android; web scanners do not cover native screens.

For each finding record journey, trigger, affected users, observed barrier,
location, applicable criterion when verified, and a practical fix. Distinguish
confirmed defects from checks requiring human or device validation.

## Fix shared causes when authorized

Repair shared primitives before duplicating fixes across screens. Preserve visual
intent and product behavior. Use correct semantics, labels, and event handling;
do not add `tabindex` everywhere, silence announcements indiscriminately, or use
ARIA to conceal invalid interaction design.

Add focused regression coverage with existing DOM/native test tools. Test user
actions and focus behavior, not only static attributes. Check the original failing
journey and other consumers after a shared component fix. Review changed error
copy and announcement timing to avoid duplicate or disruptive output.

## Verify and report

Run available tests, lint/types/build, the scoped automated scan, and manual
keyboard/assistive-technology checks that are available. Report findings by user
impact, fixed versus open items, verified criteria, sampled states, and untested
devices/readers. Automated success supports the audit but cannot certify it.
