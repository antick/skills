# Website

The landing page at [skills.potion.sh](https://skills.potion.sh) lives in
`website/`. It uses Astro, Tailwind CSS, and shadcn/ui React components. Its
skill names and agent options come from the same catalogues as the installer.
The website and its dependencies are excluded from the published skills package.

Use Node.js 24. Run these from the repository root:

```sh
npm ci --prefix website
npm run dev --prefix website
npm test --prefix website
npm run build --prefix website
```

Site copy and links live in `website/src/lib/site.ts`; skill descriptions live
in `website/src/lib/catalog.ts` and `website/src/lib/engineering-catalog.ts`.
The social preview source is `website/public/og.svg`, with `og.png` used by link previews.

Vercel project `antick-skills` builds from the **repository root**, using the
checked-in `vercel.json`. Do not set the root directory to `website`: the build
also reads the repository's catalogues. Output is `website/dist`. Cloudflare
manages DNS for `skills.potion.sh`. The website needs no application environment
variables.

## Release deployments

Automatic Git deployments are disabled with `git.deploymentEnabled: false` in
`vercel.json`. PR updates and merges to `main` do not deploy once their commits
contain this configuration. Update older branches too if they still have the
previous configuration.

The [release workflow](../.github/workflows/deploy-release.yml) deploys only when a
**stable GitHub Release** is published, including a prerelease promoted to stable.
Pushing a tag alone, saving a draft, publishing a prerelease, or editing release
notes does not deploy. The workflow checks out the release's commit, runs tests,
builds in GitHub Actions, and uploads prebuilt output to production. Vercel does
not run a second build. Release jobs are serialized; a running deployment is not
cancelled by another release.

Before the first release, add a `VERCEL_TOKEN` secret to the repository's existing
**Production** GitHub environment. Create a Vercel token with access to the team
owning `antick-skills`; never commit the token. The workflow already contains the
non-secret team and project IDs. Keep environment deployment rules compatible
with release tags and restrict who can create or move release tags.

Merge the workflow and configuration before creating the release tag, then
publish a non-prerelease release for that tag in GitHub Releases. Check the
`Deploy website release` Actions run for the result. Publishing a release for
an older commit without this workflow will not install the workflow retroactively.
To retry a failed deployment, rerun that release's failed Actions job. Automated
release creation must use an identity that can trigger subsequent workflows;
events created with the workflow's default `GITHUB_TOKEN` generally do not.

The existing production site stays live between releases. Manual CLI/dashboard
deployments remain possible for recovery; they are not automatic release triggers.
For immediate coverage of old branches without the new configuration, disconnect
the project's Git integration in Vercel after configuring the release credentials;
CLI deployments still work.

References: [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration)
and [GitHub Actions deployment guide](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel).

