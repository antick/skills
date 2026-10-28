# Antick Skills

38 skills. Canonical behavior lives in `skills/<name>/SKILL.md`.

| Skill | What it does |
| --- | --- |
| `code-review` | Review code and PRs for requirements, risk, and complexity |
| `concise` | Answer briefly without losing important meaning |
| `make-sense` | Explain clearly without forcing brevity |
| `code-build` | Build apps and features with the simplest solution for the project's stack |
| `code-refactor` | Refactor with current official docs, compatible features, and regression tests |
| `code-audit` | Rank repository-wide opportunities to remove complexity |
| `code-security` | Audit code, CI, and repository security with evidence-based severity |
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
| `auth-consolidation` | Unify auth and sessions without weakening access rules |
| `state-consolidation` | Give application state one clear owner and lifecycle |
| `sdk-consolidation` | Unify SDK clients while preserving service contracts |
| `npm-supply-chain-hardening` | Harden dependency installs and npm publishing paths |
| `design-system-enforcement` | Enforce shared design tokens and approved UI rules |
| `component-library-standardization` | Standardize reusable component APIs and consumers |
| `typescript-strictness` | Strengthen TypeScript checks without unsafe shortcuts |
| `test-suite-hardening` | Fix flaky tests and strengthen behavior coverage |
| `ci-cd-triage` | Diagnose and repair failing builds and pipelines |
| `routing-refactor` | Refactor routes while preserving links and navigation |
| `performance-optimization` | Optimize measured bottlenecks with repeatable evidence |
| `accessibility-audit` | Find accessibility barriers and fix them when requested |
| `security-remediation` | Fix confirmed vulnerabilities with regression evidence |
| `error-handling-standardization` | Unify errors, recovery, retries, and safe diagnostics |
| `i18n-localization` | Wire locales, messages, formatting, and RTL behavior |
| `platform-migration` | Migrate web and mobile flows with explicit parity checks |
| `documentation-generation` | Write project docs from source and verified examples |
| `architecture-map` | Map architecture and create practical onboarding guides |
| `monorepo-restructure` | Move workspace boundaries without breaking consumers |
| `interview` | Learn personal context and save authorized memories |

## Workflow coverage

Use the focused skill for the requested task. Each installed folder is standalone;
the combinations below describe complementary workflows, not required dependencies.

| Requested capability | Skill or workflow |
| --- | --- |
| Complex refactors | [code-refactor](skills/code-refactor/SKILL.md), including its architecture migration guide |
| Architecture cleanup | [code-audit](skills/code-audit/SKILL.md) for findings; [code-refactor](skills/code-refactor/SKILL.md) for implementation |
| Auth flow consolidation | [auth-consolidation](skills/auth-consolidation/SKILL.md) |
| State management consolidation | [state-consolidation](skills/state-consolidation/SKILL.md) |
| SDK wrapper consolidation | [sdk-consolidation](skills/sdk-consolidation/SKILL.md) |
| npm supply chain hardening | [npm-supply-chain-hardening](skills/npm-supply-chain-hardening/SKILL.md) |
| Design system enforcement | [design-system-enforcement](skills/design-system-enforcement/SKILL.md) |
| Component library standardization | [component-library-standardization](skills/component-library-standardization/SKILL.md) |
| TypeScript strictness fixes | [typescript-strictness](skills/typescript-strictness/SKILL.md) |
| Test suite hardening | [test-suite-hardening](skills/test-suite-hardening/SKILL.md) |
| CI/CD pipeline triage | [ci-cd-triage](skills/ci-cd-triage/SKILL.md) |
| Dependency upgrade migrations | [upgrade-dependencies](skills/upgrade-dependencies/SKILL.md) |
| Schema migration safety review | [database-audit](skills/database-audit/SKILL.md), including schema and migration checks |
| Routing/navigation refactor | [routing-refactor](skills/routing-refactor/SKILL.md) |
| Performance optimization pass | [performance-optimization](skills/performance-optimization/SKILL.md) |
| Accessibility audit/fix pass | [accessibility-audit](skills/accessibility-audit/SKILL.md) |
| Security audit/remediation | [code-security](skills/code-security/SKILL.md) for findings; [security-remediation](skills/security-remediation/SKILL.md) for fixes |
| Error handling standardization | [error-handling-standardization](skills/error-handling-standardization/SKILL.md) |
| Internationalization/localization wiring | [i18n-localization](skills/i18n-localization/SKILL.md) |
| Platform migration: web/iOS/Android | [platform-migration](skills/platform-migration/SKILL.md) |
| Documentation generation | [documentation-generation](skills/documentation-generation/SKILL.md) |
| Onboarding/architecture map creation | [architecture-map](skills/architecture-map/SKILL.md) |
| Monorepo restructuring | [monorepo-restructure](skills/monorepo-restructure/SKILL.md) |
| Personal interview with memory | [interview](skills/interview/SKILL.md) |
