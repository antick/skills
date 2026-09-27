# Web and API guidance

Use the section matching the detected framework and the shared sections relevant
to the feature. Match APIs and file conventions to the project's installed
version; these notes do not prescribe framework versions or dependency bundles.

## Astro and static sites

Follow the installed version's content, page, and layout conventions. Generate
static output when the requested behavior allows it; load client code for the
specific interactions that need it. Add content integrations, search, RSS, or
server adapters only for requested capabilities.

For plain HTML/CSS sites, retain that structure when it meets the task. Verify
generated routes, assets, links, metadata, responsive layout, and keyboard use.
Check server-only features separately if the site uses server rendering.

## Browser clients

For React or another client framework, follow existing routing, components,
forms, styling, and data-fetching patterns. Handle loading, empty, success, and
failure states for the changed flow. Reuse accessible controls and keep shared
behavior in the components or helpers that already own it.

Keep secrets out of client bundles. Verify the actual API contract, authentication
behavior, direct route loading, and host fallback configuration where required.

## APIs: shared contract

Trace request parsing, validation, authorization, business behavior, persistence,
and response handling. Follow existing status codes and response shapes. Check
resource ownership at the server boundary, not only in the UI. Preserve useful
error reporting without exposing secrets or internal details.

Synchronize `openapi.json` with changed endpoints, including request/response
schemas, errors, and authentication. Use the existing generator when present.
Test a real handler path plus invalid input and denied access where applicable;
mocked helper tests alone do not establish the HTTP contract.

## Persistent data, authentication, and billing

Apply this section only to features that need these capabilities. Preserve the
current providers and schema conventions. Include schema migrations, validation,
authorization, and the UI/API behavior needed to complete the requested path.
Check upgrade behavior against existing data; fixtures are not production data.

For billing integrations, verify webhook signatures and make repeated event
delivery safe. Derive entitlements from verified server state rather than a
browser success redirect. Exercise provider test-mode behavior when available
and distinguish simulated tests from real integration verification.
