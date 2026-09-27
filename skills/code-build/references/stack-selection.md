# Stack selection

## Existing projects

The user's explicit stack choice and the repository's working architecture take
precedence over examples in this skill. Follow the affected package, not just the
root manifest: one repository can contain several runtimes and frameworks.

Use lockfiles and installed configuration to establish versions. Keep the current
router, renderer, database client, authentication, styling, and test conventions.
A request for a new page or feature is not a request to replace these choices.

## New projects

Identify the target platform, required interactions, persistence, authentication,
and hosting constraints before selecting tools. Product labels such as "SaaS"
or "dashboard" describe requirements, not mandatory dependencies.

| Need | Small starting point | Add complexity when |
| --- | --- | --- |
| Small static page | HTML and CSS, or the user's chosen framework | Repeated content, routing, or build needs justify a generator |
| Blog, documentation, content site | A static generator such as Astro | Specific interactions or request-time data require client/server code |
| Interactive browser client | The chosen UI framework and its build tool | Server behavior requires an API or a full-stack framework |
| Web app with server behavior | The project's chosen web framework and server runtime | A separate service has an actual deployment or integration requirement |
| Standalone API | A small service using the project's chosen runtime and HTTP tools | Persistence, authentication, or background work is required |
| Desktop application | The chosen desktop runtime; Electron when selected | OS integration requires privileged native operations |
| Browser extension | Manifest and only the required extension entry points | Page access, background work, or additional screens are needed |
| Mobile application | Expo/React Native when selected | Native capabilities require platform configuration or modules |
| CLI or script | The chosen runtime's standard library | Command or interaction complexity exceeds its built-in facilities |

If several options fit, use stated preferences, deployment support, and maintenance
cost to choose. Explain the choice briefly. Clarify an unresolved constraint when
the alternatives would produce materially different products; otherwise proceed.
Check official documentation for current runtime support, scaffold options, and
host compatibility before creating the project.

Select supporting tools separately. Local data does not automatically require a
hosted database; a login does not select a paid provider; a pricing page does not
require payment processing. Start with the components needed for the requested
behavior. Keep required data durability and access control even in a small build.

## Workspaces and monorepos

Inspect workspace manifests, package boundaries, dependency links, and task
configuration. Change the owning package and check its affected consumers. Use
the root package manager and lockfile; avoid nested installs that bypass them.

For new workspaces, create only the applications and shared packages actually
needed. A single application needs no workspace structure unless requested.
Extract shared code for real consumers; keep server-only dependencies out of
browser packages. Use the existing task runner, including Turborepo when present,
and add orchestration only when workspace scripts no longer cover a real need.

Verify build order, shared package exports, and application builds from the
workspace root. Check affected consumers as well as the package that changed.
