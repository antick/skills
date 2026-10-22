---
name: vercel-domain-cleanup
description: Use when fixing Vercel default-address redirects, www-to-non-www redirects, or custom-domain DNS warnings across projects, including Cloudflare-managed DNS.
---

# Vercel Domain Cleanup

Make each project's stable production Vercel address and every assigned `www`
address redirect permanently to its main non-`www` HTTPS domain. Resolve Vercel's
DNS warnings and verify the websites, not just the saved settings.

## Start and scope

A bare `$vercel-domain-cleanup` invocation starts discovery using the connected
Vercel account and active team. If one team is clearly selected, inspect all its
projects, following every pagination cursor. Ask only when the team or a project's
main domain is genuinely ambiguous; continue inspecting unambiguous projects.

A request to fix authorizes the necessary domain, redirect, and matching DNS
updates within that scope. An audit-only request stays read-only. This skill's
presence alone does not authorize changes. Do not create accounts, buy domains,
transfer domains, or change nameservers as part of this workflow.

Prefer existing authenticated Vercel and DNS tools or CLI/API access. If browser
access is needed, reuse the user's existing signed-in main Chrome session,
especially for Cloudflare. Inspect available tabs/profiles first. If the tools
cannot access that session, report the specific access needed; do not launch a
fresh login profile, restart Chrome, or create replacement credentials.

## Inventory before repair

For every project, record the team/project ID, main domain, stable production
`*.vercel.app` address, custom domains including `www`, deployment/branch
assignments, redirect destinations and status codes, Vercel DNS recommendations,
verification/certificate state, and DNS provider. Record baseline HTTP behavior.
Projects without a usable custom domain remain explicit exceptions; never invent
a destination or silently omit them from the totals.

Distinguish the stable production alias from immutable deployment URLs and branch
or preview aliases. Preserve preview/QA behavior unless the user includes those
addresses. Keep valid application path redirects and private-site access controls.

Read the current official documentation and installed tool help before choosing
API fields or commands. DNS targets are project/domain specific: use Vercel's
live recommendations instead of copying an IP or CNAME from another project.

## Repair redirects

- Attach a missing custom domain to the correct project only after confirming its
  ownership and intended mapping. A resolving DNS record alone does not prove
  that Vercel serves the domain.
- Prefer Vercel domain-level redirects where supported. Use a permanent `308`
  by default; retain a correct `301` unless method preservation requires `308`.
  Replace missing redirects and temporary `302`/`307` redirects.
- Point the stable production Vercel hostname and each assigned `www` hostname to
  the confirmed main non-`www` HTTPS domain. Keep the request path and query
  string. Target the final domain directly where possible and prevent loops.
- If a production Vercel alias requires application configuration instead, match
  its exact hostname. Avoid a blanket `*.vercel.app` rule that captures previews.
  Follow that repository's deployment procedure and authorization before shipping
  code; a local edit alone does not fix the live redirect.

## Reconcile DNS

Before each edit, capture the zone, full record name, type, old content, TTL,
proxy status, and Vercel's requested value. Change only records necessary for the
mapped web hostname; preserve unrelated records, including MX and mail/auth TXT.
Remove conflicting A/AAAA/CNAME records only after confirming they are obsolete
for that hostname. Add verification records only as requested by Vercel.

Preserve intentional Cloudflare proxy mode and SSL/security settings. Proxying
can hide origin records from public DNS checks; compare Cloudflare's configured
origin with Vercel's recommendation. If clearing the warning requires changing
intentional proxy/security behavior, explain the tradeoff and get that specific
decision rather than silently toggling it.

Save and read back every change, then refresh Vercel's domain check. Treat
“DNS Change Recommended” separately from invalid configuration: `misconfigured:
false` alone does not prove that the recommendation is cleared. For this task,
an outstanding recommendation remains unresolved even when the website works.

## Verify every project

Build a check list from the full inventory so failures cannot disappear from the
report. Test both HTTP and HTTPS for every stable production Vercel hostname,
`www` hostname, and custom domain. Include root plus a known real nested path
with a harmless query string. Use GET requests and record each redirect hop,
status, `Location`, final URL, and final response; HEAD alone is insufficient.

For example, `https://www.example.com/guide?ref=domain-check` should redirect
permanently to `https://example.com/guide?ref=domain-check`, then load the expected
page. An HTTP-to-HTTPS hop may precede the canonical redirect; every
canonicalization hop must be permanent. Check path/query preservation, loops,
wrong-project content, TLS errors, and unexpected authentication or error pages.

Confirm all final websites render in a browser and perform a representative
navigation check. For private sites, verify the expected protected behavior using
existing authorized access; do not disable protection to get a `200`.

Re-read Vercel configuration for every custom domain, including redirect-only
domains: ownership verified, DNS valid, recommendations cleared, and certificates
ready. Compare authoritative DNS with public resolver results when they differ.
Retry propagation checks with bounded waits based on TTL and observed state;
record pending propagation if it remains. Preserve evidence of preview behavior
when rules or deployments could affect it.

Report projects/domains covered, before/after changes, redirect and website check
counts, and any failed, blocked, skipped, or pending items with their reasons.
Claim complete only when every in-scope check passes and every DNS warning is
cleared. Working HTTPS, valid DNS, and cleared recommendations are separate facts.

## Sources

Consult these during execution for current provider behavior:

- [Vercel domain setup and exact DNS recommendations](https://vercel.com/docs/domains/set-up-custom-domain)
- [Vercel domain redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
- [Vercel domain troubleshooting](https://vercel.com/docs/domains/troubleshooting)
- [Cloudflare proxy status](https://developers.cloudflare.com/dns/proxy-status/)
