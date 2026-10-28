---
name: architecture-map
description: Create a source-backed architecture map and onboarding guide for a codebase. Use to explain module ownership, request/data flows, external boundaries, and where a new contributor should make changes.
---

# Architecture Map

Help a contributor find the right code and understand its boundaries. Produce
an explanation of the current system, not an unsolicited redesign.

## Trace the system from evidence

Read instructions, workspace manifests, startup scripts, entry points, deployment
configuration, existing docs, and tests. Record repository/commit and reviewed
scope. Distinguish deployed services from packages, libraries, generated code,
and development tools. A dependency in a manifest is not proof it runs in production.

Choose representative user or system journeys and follow entry point, routing,
authorization, domain behavior, persistence, queues/events, and external services.
Inspect actual callers and configuration to verify edges. Label runtime assumptions
and unavailable infrastructure; do not infer ownership solely from directory names.

## Build a navigable guide

Include only views that help the reader:

- System context: users, applications, services, stores, and external providers.
- Module ownership: responsibility, public interface, dependencies, and source path.
- Flow walkthroughs: concrete trigger, transformations, access checks, side effects,
  failure handling, and response/event consumers.
- Change guide: where to add a route, business rule, UI component, job, schema change,
  or integration, based on examples that actually exist in this project.
- Local onboarding: prerequisites, safe setup, configuration names, start commands,
  focused tests, and expected signs of a working environment.

Use relative source links and small diagrams when they clarify boundaries. Label
arrows by request, event, import, or data movement; avoid one unreadable graph of
every file. Separate current architecture from proposed changes. Record decisions
only when documented; explain uncertain rationale as an inference.

## Preserve operational boundaries

Inspect scripts before executing setup. Prefer disposable local data; do not run
production migrations, seeds, deployment, or account changes to complete onboarding.
Keep secrets and private customer information out of diagrams and examples.
Use the repository's established docs location if files are requested; otherwise
deliver the map in chat. Do not create an external knowledge service without scope.

## Verify the guide

Check every local link and representative flow against code. Validate diagram
syntax with existing tooling when available. Run safe documented startup/test
commands where feasible and distinguish execution from static inspection.
Walk through the guide as a new contributor: can they locate the owning module,
make the example change, and identify the right test without guessing?

Report artifacts, traced journeys, setup commands verified, and gaps such as
unavailable databases or unknown deployment topology. An architecture map is a
snapshot; name its source revision and maintenance owner/convention rather than
claiming it will remain current automatically.
