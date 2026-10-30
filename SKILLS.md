# Antick Skills

23 skills. Canonical behavior lives in `skills/<name>/SKILL.md`.

| Skill | What it does |
| --- | --- |
| `code-review` | Review code and PRs for requirements, risk, and complexity |
| `concise` | Answer briefly without losing important meaning |
| `make-sense` | Explain clearly without forcing brevity |
| `code-build` | Build features, standardize UI, wire localization, and migrate platforms |
| `code-refactor` | Refactor shared flows, types, architecture, and performance with regression protection |
| `code-audit` | Rank repository-wide opportunities to remove complexity |
| `code-security` | Audit security; remediate vulnerabilities and harden supply chains when requested |
| `database-audit` | Audit database schemas, queries, migrations, and access with evidence |
| `github-actions-security-audit` | Audit GitHub Actions and CI security across every repo of an account |
| `upgrade-dependencies` | Upgrade dependencies, apply migrations, and verify behavior |
| `simplify` | Apply ASD-STE100 to explanations, instructions, and reports |
| `private-desktop-release` | Set up signed private desktop releases, licensed updates, and device controls |
| `public-desktop-release` | Set up signed public GitHub releases, automatic updates, and a separate dev app |
| `vercel-domain-cleanup` | Fix permanent Vercel and www redirects, DNS warnings, and verify websites |
| `soc2-readiness` | Assess SOC 2 readiness and report evidence-backed gaps in chat |
| `reclaim-dev-space` | Report reclaimable dev resources in chat, protect important data, and clean confirmed items |
| `save-omarchy-window-layout` | Save Omarchy workspaces, tiled window sizes, and login restoration layout |
| `ai-harness-setup` | Set up missing AI tools with confirmation, update existing tools, and report OS-aware results |
| `test-suite-hardening` | Fix flaky tests and strengthen behavior coverage |
| `ci-cd-triage` | Diagnose and repair failing builds and pipelines |
| `accessibility-audit` | Find accessibility barriers and fix them when requested |
| `documentation-generation` | Write source-backed docs, architecture maps, and onboarding guides |
| `interview` | Learn personal context and save authorized memories |

## Workflow coverage

Use the focused skill for the requested task. Each installed folder is standalone;
the combinations below describe complementary workflows, not required dependencies.

| Requested capability | Skill or workflow |
| --- | --- |
| Complex refactors | [code-refactor](skills/code-refactor/SKILL.md), including its architecture migration guide |
| Architecture cleanup | [code-audit](skills/code-audit/SKILL.md) for findings; [code-refactor](skills/code-refactor/SKILL.md) for implementation |
| Auth flow consolidation | [code-refactor: auth-consolidation](skills/code-refactor/references/auth-consolidation.md) |
| State management consolidation | [code-refactor: state-consolidation](skills/code-refactor/references/state-consolidation.md) |
| SDK wrapper consolidation | [code-refactor: sdk-consolidation](skills/code-refactor/references/sdk-consolidation.md) |
| npm supply chain hardening | [code-security: npm-supply-chain-hardening](skills/code-security/references/npm-supply-chain-hardening.md) |
| Design system enforcement | [code-build: design-system-enforcement](skills/code-build/references/design-system-enforcement.md) |
| Component library standardization | [code-build: component-library-standardization](skills/code-build/references/component-library-standardization.md) |
| TypeScript strictness fixes | [code-refactor: typescript-strictness](skills/code-refactor/references/typescript-strictness.md) |
| Test suite hardening | [test-suite-hardening](skills/test-suite-hardening/SKILL.md) |
| CI/CD pipeline triage | [ci-cd-triage](skills/ci-cd-triage/SKILL.md) |
| Dependency upgrade migrations | [upgrade-dependencies](skills/upgrade-dependencies/SKILL.md) |
| Schema migration safety review | [database-audit](skills/database-audit/SKILL.md), including schema and migration checks |
| Routing/navigation refactor | [code-refactor: routing-refactor](skills/code-refactor/references/routing-refactor.md) |
| Performance optimization pass | [code-refactor: performance-optimization](skills/code-refactor/references/performance-optimization.md) |
| Accessibility audit/fix pass | [accessibility-audit](skills/accessibility-audit/SKILL.md) |
| Security audit/remediation | [code-security](skills/code-security/SKILL.md) for findings; [code-security: security-remediation](skills/code-security/references/security-remediation.md) for fixes |
| Error handling standardization | [code-refactor: error-handling-standardization](skills/code-refactor/references/error-handling-standardization.md) |
| Internationalization/localization wiring | [code-build: i18n-localization](skills/code-build/references/i18n-localization.md) |
| Platform migration: web/iOS/Android | [code-build: platform-migration](skills/code-build/references/platform-migration.md) |
| Documentation generation | [documentation-generation](skills/documentation-generation/SKILL.md) |
| Onboarding/architecture map creation | [documentation-generation: architecture-map](skills/documentation-generation/references/architecture-map.md) |
| Monorepo restructuring | [code-refactor: monorepo-restructure](skills/code-refactor/references/monorepo-restructure.md) |
| Personal interview with memory | [interview](skills/interview/SKILL.md) |
