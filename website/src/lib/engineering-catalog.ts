// Workflow-specific presentation data; names and summaries remain in packs.json.
export const engineeringDetails = {
  "test-suite-hardening": {
    category: "Test Suite Hardening",
    heading: "Test Suite Hardening",
    description: "Strengthen an existing test suite against false confidence, flaky failures, and missing behavior coverage. Use for weak assertions, excessive mocking, test isolation, unreliable CI tests, or critical-flow coverage gaps.",
    prompt: "$test-suite-hardening Harden this test suite against flakes, weak assertions, and missing critical behavior coverage.",
    steps: ["Reproduce flakes and identify escaping regressions", "Strengthen assertions, boundaries, and isolation", "Run focused repeats and the complete available suite"],
    mode: "Test reliability and regression protection",
  },
  "ci-cd-triage": {
    category: "CI/CD Triage",
    heading: "CI/CD Triage",
    description: "Diagnose and repair failing CI builds, tests, packaging, or deployment pipelines. Use for failed workflow runs, local-versus-CI differences, broken artifacts, or deployment failures; security-only audits are a separate task.",
    prompt: "$ci-cd-triage Diagnose this failing pipeline, fix the root cause, and distinguish local verification from hosted results.",
    steps: ["Identify the exact run, commit, and first failure", "Reproduce and repair the causal issue", "Verify local checks and authorized hosted runs"],
    mode: "Pipeline diagnosis and repair",
  },
  "accessibility-audit": {
    category: "Accessibility Audit",
    heading: "Accessibility Audit",
    description: "Audit accessibility and fix confirmed barriers when requested. Use for keyboard, focus, screen reader, contrast, zoom, motion, or form accessibility across web or native user journeys.",
    prompt: "$accessibility-audit Audit and fix accessibility barriers in the main user journeys; report manual and automated coverage separately.",
    steps: ["Scope journeys, states, platforms, and criteria", "Combine scans with keyboard and assistive checks", "Fix shared causes and verify the affected journeys"],
    mode: "Audit; implementation when requested",
  },
  "documentation-generation": {
    category: "Documentation Generation",
    heading: "Documentation Generation",
    description: "Generate or update source-backed documentation, API guides, runbooks, architecture maps, and contributor onboarding. Use when documentation must reflect actual code, traced flows, and verified setup commands.",
    prompt: "$documentation-generation Generate documentation, architecture maps, and onboarding guides from source, and verify safe setup commands and links.",
    steps: ["Identify the audience and authoritative sources", "Write task-focused guides and real examples", "Verify safe commands, links, and factual claims"],
    mode: "Source-backed documentation",
  },
  "interview": {
    category: "Interview",
    heading: "Interview",
    description: "Interview the user in depth about their life, priorities, preferences, and context, and save what they explicitly authorize to memory. Use when the user asks to be interviewed or to build a personal profile through conversation.",
    prompt: "$interview Interview me in depth about relevant parts of my life you do not know yet, and save useful answers through the supported memory system.",
    steps: ["Use known context to ask relevant open questions", "Follow answers in depth and respect skipped topics", "Save authorized facts and verify what was retained"],
    mode: "Conversation; memory only when authorized",
  },
} as const;
