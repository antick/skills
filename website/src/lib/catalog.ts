import catalogue from "../../../packs.json" with { type: "json" };
import agentCatalogue from "../../../scripts/install-agents.json" with { type: "json" };
import { site } from "./site.ts";

const details = {
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
  "code-audit": {
    category: "Less code. Less to carry.",
    heading: "Make room for\nwhat matters.",
    description: "Look across the whole repository for complexity you can safely remove. A ranked list of improvements, grounded in the code.",
    prompt: "$code-audit Find the largest safe simplifications in this repository.",
    steps: ["Inspect the architecture and actual consumers", "Find duplication and unnecessary layers", "Rank concrete simplifications by their value"],
    mode: "Reports without changing files",
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
