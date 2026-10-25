import catalogue from "../../../packs.json" with { type: "json" };
import agentCatalogue from "../../../scripts/install-agents.json" with { type: "json" };
import { site } from "./site.ts";

const details = {
  "vercel-domain-cleanup": {
    category: "Every address reaches home",
    heading: "Fix the redirects.\nClear the DNS warnings.",
    description: "Make default Vercel and www addresses redirect permanently to the main non-www domains. Reconcile Cloudflare DNS and check every website and redirect.",
    prompt: "$vercel-domain-cleanup Fix redirects and DNS warnings across my Vercel projects. Use my existing Chrome session for Cloudflare if needed.",
    steps: ["List every project, domain, and current redirect", "Fix redirects and reconcile provider DNS recommendations", "Verify DNS, HTTPS, paths, queries, and rendered websites"],
    mode: "Domain and DNS repair",
  },
  "code-review": {
    category: "A second pair of eyes",
    heading: "Find the issue.\nShow the evidence.",
    description: "A careful review of what actually changed, measured against what it was supposed to do. Clear findings you can act on.",
    prompt: "$code-review Review my changes against the issue requirements.",
    steps: ["Read the requirements and the real diff", "Trace the affected behavior and its callers", "Report confirmed problems, with a practical fix"],
    mode: "Read-only by default",
  },
  "code-build": {
    category: "From idea to working code",
    heading: "Understand first.\nThen build.",
    description: "An implementation partner that reads the project, reuses what works, and picks the smallest solution that meets the whole request.",
    prompt: "$code-build Add search to this Astro site using its existing conventions.",
    steps: ["Identify the actual stack and existing patterns", "Build the complete behavior, including failure states", "Run the relevant checks and explain what was verified"],
    mode: "Implementation",
  },
  "database-audit": {
    category: "Data integrity and query performance",
    heading: "Follow the query.\nProtect the data.",
    description: "Review schemas, migrations, SQL and ORM queries, indexes, transactions, and access controls. Get evidence-backed findings with practical fixes and clear measurement limits.",
    prompt: "$database-audit Review my database schema, migrations, queries, and access controls; report findings without applying changes.",
    steps: ["Map the schema, migrations, and actual workloads", "Trace integrity, performance, concurrency, and access risks", "Report verified findings, practical fixes, and coverage limits"],
    mode: "Read-only database report",
  },
  "code-security": {
    category: "Security backed by evidence",
    heading: "Trace the risk.\nJustify the severity.",
    description: "Audit application code, dependencies, GitHub Actions, and public-repository controls. Get a security report that separates confirmed vulnerabilities from hardening advice and unknowns.",
    prompt: "$code-security Audit this repository and its GitHub Actions; report confirmed vulnerabilities with justified severities.",
    steps: ["Map exposed inputs, assets, and trust boundaries", "Verify attack paths and calibrate their impact", "Report evidence, fixes, and coverage limitations"],
    mode: "Read-only security report",
  },
  "github-actions-security-audit": {
    category: "CI you can trust",
    heading: "Every workflow.\nEvery repo.",
    description: "Audit GitHub Actions across a whole account: triggers, token permissions, action pinning, secrets, environments, and deploy gates. Get a per-repo report, grouped by public and private, with severities and fixes.",
    prompt: "$github-actions-security-audit Audit GitHub Actions and CI security across all my repositories and report findings by repo.",
    steps: ["Enumerate repos and fetch workflows and settings", "Run zizmor and actionlint, then trace each finding", "Report per-repo severities, fixes, and coverage limits"],
    mode: "Read-only security report",
  },
  "code-audit": {
    category: "Less code. Less to carry.",
    heading: "Make room for\nwhat matters.",
    description: "Look across the whole repository for complexity you can safely remove. A ranked list of improvements, grounded in the code.",
    prompt: "$code-audit Find the largest safe simplifications in this repository.",
    steps: ["Inspect the architecture and actual consumers", "Find duplication and unnecessary layers", "Rank concrete simplifications by their value"],
    mode: "Reports without changing files",
  },
  "upgrade-dependencies": {
    category: "Keep your project current",
    heading: "Update the packages.\nKeep things working.",
    description: "Upgrade to stable releases at least 48 hours old, apply required code and configuration migrations, and check that the project still works. Clear evidence of what passed and what needs more checking.",
    prompt: "$upgrade-dependencies Update dependencies, apply required migrations, and verify the project still works.",
    steps: ["Check release age and package compatibility", "Upgrade together and apply required migrations", "Run tests, build, and verify affected behavior"],
    mode: "Implementation",
  },
  "public-desktop-release": {
    category: "From source to installed app",
    heading: "Publish the app.\nKeep developing.",
    description: "Set up signed Apple Silicon installers, public GitHub releases, automatic updates, and a separate development app using your project’s existing stack.",
    prompt: "$public-desktop-release Set up, publish, and install a signed Apple Silicon release of this app through GitHub, with automatic updates and a separate dev app. Use my existing main Chrome session for account setup.",
    steps: ["Inspect app identity, signing, and release setup", "Build public installers and GitHub release automation", "Verify installation, dev isolation, and installed updates"],
    mode: "Setup and release operations",
  },
  "private-desktop-release": {
    category: "From build to private release",
    heading: "Sign the app.\nShip the update.",
    description: "Set up Apple signing and notarization, private installers, licensed updates, device controls, and a repeatable release workflow using your app's existing stack.",
    prompt: "$private-desktop-release Set up private macOS releases for this app using its existing stack.",
    steps: ["Inspect the app, licensing, and signing setup", "Build private distribution and release automation", "Verify the signed installer and actual installed update"],
    mode: "Setup and release operations",
  },
  concise: {
    category: "Every word earns its place",
    heading: "Get to the point.\nKeep the meaning.",
    description: "Short, natural answers that preserve what you need: the result, the reason, and the caveat that actually changes your next step.",
    prompt: "$concise Summarize what changed and what still needs checking.",
    steps: ["Lead with the answer", "Keep the details that change understanding", "Use complete sentences, without the filler"],
    mode: "Communication",
  },
  "make-sense": {
    category: "Clarity, without a word limit",
    heading: "An explanation\nthat clicks.",
    description: "Make a complicated subject easy to follow. Everyday language, connected ideas, and enough detail to actually understand why.",
    prompt: "$make-sense Explain how this request reaches the database.",
    steps: ["Start with the main point", "Connect the cause, the effect, and the next step", "Explain technical terms when they are needed"],
    mode: "Communication",
  },
  simplify: {
    category: "Simplified Technical English",
    heading: "Clear instructions.\nExact technical details.",
    description: "Apply ASD-STE100 to explanations, instructions, and reports. Use clear sentences and consistent terms while preserving technical accuracy and exact code identifiers.",
    prompt: "$simplify Write these instructions in ASD-STE100 Simplified Technical English. Keep code identifiers exact.",
    steps: ["Use STE writing rules and approved word meanings", "Keep technical facts and code identifiers exact", "Review sentence length, terms, and technical accuracy"],
    mode: "Communication",
  },
} as const;

export const skills = catalogue.packs.flatMap((pack) => pack.skills).map((name) => {
  const key = name as keyof typeof details;
  if (!details[key]) throw new Error(`Missing website details for skill: ${name}`);
  return {
    name,
    summary: catalogue.summaries[key],
    source: `${site.repository}/tree/main/skills/${name}`,
    ...details[key],
  };
});

export type Skill = (typeof skills)[number];
export const agents = agentCatalogue.agents.map(({ id, displayName }) => ({ id, displayName }));

export function installCommand(skill: string, agent: string, scope: string) {
  if (skill !== "all" && !skills.some((item) => item.name === skill)) throw new Error("Unknown skill");
  if (!agents.some((item) => item.id === agent)) throw new Error("Unknown agent");
  if (!["global", "project"].includes(scope)) throw new Error("Unknown installation scope");
  return `node scripts/install.mjs --skill ${skill === "all" ? "'*'" : skill} --agent ${agent} ${scope === "global" ? "--global" : "--cwd /path/to/project"} --copy --yes`;
}
