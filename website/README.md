# Website

The retired landing app lives in `website/`. It uses Astro, Tailwind CSS,
and shadcn/ui React components. Its skill names and agent options come from
the same catalogues as the installer. The website and its dependencies are
excluded from the published skills package.

Use Node.js 24. Run these from the repository root:

```sh
npm ci --prefix website
npm run dev --prefix website
npm test --prefix website
npm run build --prefix website
```

Site copy and links live in `website/src/lib/site.ts`; skill descriptions live
in `website/src/lib/catalog.ts` and `website/src/lib/engineering-catalog.ts`.
The social preview source is preserved in `website/public/og.svg`.

## Hosting retired

The landing app is kept for local use. It has no configured public site URL,
canonical URL, sitemap, or domain-specific social preview. Robots are instructed
not to crawl it.

The release deployment workflow has been removed. Keep `git.deploymentEnabled`
set to `false` in the root `vercel.json` to prevent automatic Git deployments.
The existing Vercel project is paused, preview deployments are disabled, and its
ignored build command skips Git builds from older branches. The GitHub release
deployment workflow is also disabled in repository settings so it cannot run
before this change merges.

Five historical Vercel deployments remain. Pausing blocks production, but an old
preview URL still redirects to Vercel authentication. Removing those deployments
requires working Vercel CLI or dashboard access; the local CLI token was rejected
and browser access was unavailable during retirement.

Restoring hosting requires an explicit decision: configure the new public URL
and search/social metadata, restore an appropriate deployment process, and
unpause the Vercel project. Builds still use the repository root because they
read shared catalogues; output is `website/dist`.
