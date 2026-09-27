# Astro static site

Use for Astro blogs, documentation, portfolios, and other content-focused sites.
Keep an existing Astro project's integrations and rendering mode unless the
requested behavior requires a change.

## Decide how content reaches the page

| Requirement | Implementation decision |
| --- | --- |
| Content known during the build | Generate pages from files or a build-time loader |
| Content changes independently of deployment | Establish a rebuild trigger or required request-time rendering |
| Authored content embeds components | Use compatible MDX support for those files |
| Structured entries share required fields | Define a collection schema and validate it during the build |
| One control needs interaction | Hydrate that component with an appropriate client directive |
| Per-request behavior | Verify the server adapter and host runtime before implementation |

## Find the owning files

Follow a working page through its layout, collection query, loader, and content
source. Put new routes and content beside their peers; share layout and metadata
behavior at the existing boundary. Inspect the configured asset pipeline before
deciding whether an image belongs in source assets or the public directory.

Collection configuration and loader APIs depend on the installed version. Check
its [content collection documentation](https://docs.astro.build/en/guides/content-collections/)
before adding or changing a collection.

## Build path

1. For a new project, use the official Astro initializer at a verified exact
   version. Select a starter matching the requested content and package manager.
2. Configure the site's URL, base path, output mode, and styling. Add MDX and
   other integrations only when needed; check their compatibility with Astro.
3. Define collection schemas and loaders, then build listing and detail routes.
   Share layout, navigation, metadata, and date formatting across those routes.
4. Use Astro's supported image facilities for processed images. Hydrate only
   interactive components, choosing a loading directive appropriate to their use.
5. Add sitemap, RSS, canonical URLs, and social metadata as required. Keep feeds
   and visible pages consistent about published content and URLs.
6. For Vercel, Netlify, Cloudflare, GitHub Pages, or another host, verify the
   output directory and base path. Add an adapter only for server behavior and
   confirm that the adapter supports the chosen runtime.

## Verify

Run available content/type checks and the production build, then preview its
output. Check article routes, images, links, metadata, feeds, mobile layouts, and
keyboard navigation. Exercise any island or server feature in its actual runtime.
For collection changes, check a missing required field and a changed slug. Confirm
draft/unpublished entries are handled consistently in pages, feeds, and sitemaps.
