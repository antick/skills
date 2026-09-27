export const site = {
  name: "Antick Skills",
  url: "https://skills.potion.sh",
  repository: "https://github.com/antick/skills",
  description: "Five focused skills for AI agents. Build thoughtfully, review carefully, and make things make sense.",
  cloneCommand: "git clone https://github.com/antick/skills.git\ncd skills",
};

export const faqs = [
  {
    question: "What exactly is a skill?",
    answer: "A skill is a readable set of instructions your AI agent can load for a particular task. Each one starts with a SKILL.md file. Some include supporting guides that the agent reads when they are relevant.",
  },
  {
    question: "Will this work with my coding agent?",
    answer: "The installer includes directory mappings for 18 agents, including Codex, Claude Code, Cursor, OpenCode, and Pi. Hosts discover skills differently, so restart your agent after installing. You can also copy a complete skill folder into your agent’s supported skills directory.",
  },
  {
    question: "Does code-build change my project’s stack?",
    answer: "It starts with the stack you already have. There are focused guides for Astro, React Native, Electron, browser extensions, command-line tools, and Turborepo. Other stacks follow their existing conventions and official documentation. A new framework is a decision, not a default.",
  },
  {
    question: "Can I edit the instructions?",
    answer: "Absolutely. The files are plain Markdown and licensed under MIT. Read them, adjust them, and make them yours. Keep a backup of customizations: reinstalling a skill replaces its entire folder.",
  },
  {
    question: "Do skills get extra permissions or send my code somewhere?",
    answer: "These are instructions, not an agent service. The installer copies local files and has no telemetry. Your AI agent’s own tools, permissions, and data policies still apply. A skill does not grant additional access or make the agent infallible.",
  },
];
