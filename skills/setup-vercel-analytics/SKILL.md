---
name: setup-vercel-analytics
description: Set up Vercel Web Analytics in an existing app with framework-appropriate integration and verification. Use when asked to add or enable Vercel Analytics; Speed Insights, custom event instrumentation, and domain configuration are separate tasks.
---

# Setup Vercel Analytics

Integrate Web Analytics once across the requested app's routes. Finish with local
verification and a clear account-side reminder; code changes alone do not prove
that Vercel is collecting visits.

## Discover the app

Read repository instructions and inspect the framework, installed versions,
package manager, lockfile, workspace boundaries, and root layouts or entry points.
For a monorepo, identify the app being deployed before adding a dependency.
Inspect existing `@vercel/analytics` imports, injected scripts, wrappers, and
adapter options so a repeat invocation preserves a working integration.

Read the current [Vercel quickstart](https://vercel.com/docs/analytics/quickstart)
for the detected framework and version before editing. Use existing authenticated
Vercel tools or project metadata to identify the linked project and user/team
slug when available. Ask only if the target app or project is ambiguous; missing
dashboard access does not block an unambiguous local integration.

A setup request authorizes package and source changes. Follow the repository's
existing process for commits and PRs. Deployments and Vercel account changes need
to be within the user's requested scope; otherwise report them as next steps.
Use existing tools rather than installing global CLIs or agent plugins just to
edit the app. Keep Speed Insights and custom events outside this task.

## Integrate once

1. Add `@vercel/analytics` to the target app's runtime dependencies using its
   package manager, and update the existing lockfile. Reuse a compatible installed
   version; keep unrelated dependencies unchanged.
2. Use the documented integration for that framework and router. Mount the
   component or initializer in the shared layout or entry point covering every
   in-scope page. Account for apps with multiple independent root layouts.
3. Reconcile older injections that would duplicate the new integration. Preserve
   existing intentional filtering, consent behavior, and unrelated analytics.

For Astro, import the default component in the shared `.astro` layout and render
it once, as in this minimal example:

```astro
---
import Analytics from '@vercel/analytics/astro';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <Analytics />
  </head>
  <body><slot /></body>
</html>
```

Adapt the existing layout rather than replacing its contents. The
[Astro adapter documentation](https://docs.astro.build/en/guides/integrations-guide/vercel/#webanalytics)
distinguishes the legacy `webAnalytics` adapter option from the component used
with `@vercel/analytics@1.4.0` and later. Choose one supported injection path;
preserve the app's rendering mode and adapter unless the current docs require a
change for this integration.

## Verify and report

Run the affected app's existing type, lint, and build checks as available. Inspect
layout coverage and confirm there is one injection per page, including after a
repeat setup. Report failed or unavailable checks with their cause.

Always include this reminder in the final response, even when the code was
already integrated:

> If you haven't already, enable Web Analytics in your Vercel project's Analytics
> tab. After enabling it, deploy the integrated app and visit the site to generate
> data.

Link to `https://vercel.com/{user-or-team}/{project}/analytics?environment=all`,
substituting confirmed slugs. When slugs are unavailable, show the URL template
and label the placeholders; never invent an account or claim dashboard activation.

When deployment and live access are authorized and available, verify the deployed
revision, script loading, page-view requests on initial load and navigation, and
data appearing in the dashboard. Use observed request paths from the current
integration rather than assuming a fixed endpoint. Investigate blockers such as
ad blockers or existing CSP without weakening site protections.

Report changed files and dependency version, local check results, the dashboard
link and reminder, and deployment/data status as verified or pending. A successful
build is sufficient evidence for local integration only; state separately which
live checks remain unverified.
