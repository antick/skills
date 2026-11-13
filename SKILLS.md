# Antick Skills

48 skills. Canonical behavior lives in `skills/<name>/SKILL.md`.

| Skill | What it does |
| --- | --- |
| `plan-review` | Review and revise plans against requirements and evidence before execution |
| `code-review` | Review code and PRs against requirements; report task findings and code health |
| `skill-review` | Review skills and agent instructions for conflicts, approval gates, and incomplete work |
| `submit-review` | Post review findings as inline PR comments and mark the PR draft |
| `build-review-loop` | Build your issues in parallel, self-review each PR, and fix until clean |
| `code-build` | Build features in meaningful commits and open a draft PR |
| `electron-app` | Build secure Electron apps with native behavior and deliberate text selection |
| `code-debug` | Find a bug's root cause without changing code |
| `sync-branch` | Merge the latest main or a named branch into a PR and resolve conflicts |
| `commit-message` | Write short commit messages in the repository's convention |
| `pr-description` | Write plain-language PR titles and descriptions with technical detail |
| `create-issue` | File GitHub issues that match repo conventions, without duplicates |
| `branch-status` | Count branches and list merged ones that are safe to delete |
| `spec-status` | List OpenSpec changes whose implementation already reached main |
| `concise` | Answer briefly without losing important meaning |
| `make-sense` | Explain clearly without forcing brevity |
| `code-refactor` | Refactor shared flows, types, architecture, and performance with regression protection |
| `code-audit` | Rank repository-wide opportunities to remove complexity |
| `code-hardening` | Run all 20 codebase hardening checks with evidence and explicit coverage |
| `code-security` | Audit security; remediate vulnerabilities and harden supply chains when requested |
| `database-audit` | Audit database schemas, queries, migrations, and access with evidence |
| `performance-audit` | Find queries, jobs, and polling that slow down as data grows |
| `github-actions-security-audit` | Audit GitHub Actions and CI security across every repo of an account |
| `github-actions-lock` | Set up and maintain GitHub Actions lockfiles with CI verification |
| `dependency-upgrade-minor` | Apply safe patch and minor updates and verify behavior |
| `dependency-upgrade-major` | Upgrade major versions with planned migrations and full verification |
| `dependency-audit` | Audit dependency freshness, support status, and advisories across all sources |
| `dependency-override-cleanup` | Find and remove stale overrides, resolutions, patches, and audit waivers |
| `simplify` | Apply ASD-STE100 to explanations, instructions, and reports |
| `private-desktop-release` | Set up signed private desktop releases, licensed updates, and device controls |
| `public-desktop-release` | Set up signed public GitHub releases, automatic updates, and a separate dev app |
| `vercel-domain-cleanup` | Fix permanent Vercel and www redirects, DNS warnings, and verify websites |
| `setup-vercel-analytics` | Set up Vercel Web Analytics, verify integration, and remind about dashboard activation |
| `soc2-readiness` | Assess SOC 2 readiness and report evidence-backed gaps in chat |
| `reclaim-dev-space` | Report reclaimable dev resources in chat, protect important data, and clean confirmed items |
| `system-storage-audit` | Audit system storage or a chosen folder and compare private snapshots |
| `save-omarchy-window-layout` | Save Omarchy workspaces, tiled window sizes, and login restoration layout |
| `ai-tools-update` | Update existing AI tools by default, report missing tools as skipped, and install only on explicit request with confirmation |
| `test-suite-hardening` | Fix flaky tests, strengthen coverage, and prove changes with real regressions |
| `ci-cd-triage` | Diagnose and repair failing builds and pipelines |
| `accessibility-audit` | Find accessibility barriers and fix them when requested |
| `documentation-generation` | Write source-backed docs, architecture maps, and onboarding guides |
| `deep-wiki-html` | Create or refresh offline HTML wikis, document explainers, and architecture maps with optional JSON |
| `interview` | Learn personal context and save authorized memories |
| `new-skill` | Create or change skills that match the existing set and catalogues |
| `use-chrome` | Reuse one connection to your main Chrome in background tabs |
| `update-skills` | Update installed skills and report new or removed ones |
| `antick` | List Antick skills by area or recommend one for a task |

## Workflow coverage

Use the focused skill for the requested task. Each installed folder is standalone;
the combinations below describe complementary workflows, not required dependencies.

| Requested capability | Skill or workflow |
| --- | --- |
| Implementation plan verification | [plan-review](skills/plan-review/SKILL.md), with evidence checks, whole-plan rechecks, readiness, and explicit stopping rules |
| Vercel Web Analytics setup | [setup-vercel-analytics](skills/setup-vercel-analytics/SKILL.md), with framework detection, integration checks, and a dashboard activation reminder |
| System storage and folder-scoped repeat audits | [system-storage-audit](skills/system-storage-audit/SKILL.md), with private snapshots and automatic comparison; cleanup remains separately confirmed |
| HTML explainers and architecture maps | [deep-wiki-html](skills/deep-wiki-html/SKILL.md), with offline navigation, source citations, document explainers, incremental refresh, and optional architecture JSON |
| Complex refactors | [code-refactor](skills/code-refactor/SKILL.md), including its architecture migration guide |
| Architecture cleanup | [code-audit](skills/code-audit/SKILL.md) for findings; [code-refactor](skills/code-refactor/SKILL.md) for implementation |
| Repeatable 20-check codebase hardening | [code-hardening](skills/code-hardening/SKILL.md), with a read-only dry run, evidence, and coverage for every check |
| Auth flow consolidation | [code-refactor: auth-consolidation](skills/code-refactor/references/auth-consolidation.md) |
| State management consolidation | [code-refactor: state-consolidation](skills/code-refactor/references/state-consolidation.md) |
| SDK wrapper consolidation | [code-refactor: sdk-consolidation](skills/code-refactor/references/sdk-consolidation.md) |
| npm supply chain hardening | [code-security: npm-supply-chain-hardening](skills/code-security/references/npm-supply-chain-hardening.md) |
| Design system enforcement | [code-build: design-system-enforcement](skills/code-build/references/design-system-enforcement.md) |
| Component library standardization | [code-build: component-library-standardization](skills/code-build/references/component-library-standardization.md) |
| TypeScript strictness fixes | [code-refactor: typescript-strictness](skills/code-refactor/references/typescript-strictness.md) |
| Test suite hardening | [test-suite-hardening](skills/test-suite-hardening/SKILL.md) |
| GitHub Actions lockfile setup and maintenance | [github-actions-lock](skills/github-actions-lock/SKILL.md) |
| CI/CD pipeline triage | [ci-cd-triage](skills/ci-cd-triage/SKILL.md) |
| Routine dependency updates | [dependency-upgrade-minor](skills/dependency-upgrade-minor/SKILL.md) |
| Dependency upgrade migrations | [dependency-upgrade-major](skills/dependency-upgrade-major/SKILL.md) |
| Dependency freshness and advisories | [dependency-audit](skills/dependency-audit/SKILL.md) |
| Stale overrides, patches, and audit waivers | [dependency-override-cleanup](skills/dependency-override-cleanup/SKILL.md) |
| Growth and scalability audit | [performance-audit](skills/performance-audit/SKILL.md) |
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
| Bug root-cause investigation | [code-debug](skills/code-debug/SKILL.md) for diagnosis; [code-build](skills/code-build/SKILL.md) for the fix |
| Build, self-review, and fix loop | [build-review-loop](skills/build-review-loop/SKILL.md) with [code-build](skills/code-build/SKILL.md), [code-review](skills/code-review/SKILL.md), and [submit-review](skills/submit-review/SKILL.md) |
| Bring a branch up to date | [sync-branch](skills/sync-branch/SKILL.md) |
| Commits, PR text, and issues | [commit-message](skills/commit-message/SKILL.md), [pr-description](skills/pr-description/SKILL.md), [create-issue](skills/create-issue/SKILL.md) |
| Branch and spec cleanup audits | [branch-status](skills/branch-status/SKILL.md), [spec-status](skills/spec-status/SKILL.md) |
| New skill creation | [new-skill](skills/new-skill/SKILL.md) |
| Update installed skills | [update-skills](skills/update-skills/SKILL.md) |
| Browser work in your own Chrome | [use-chrome](skills/use-chrome/SKILL.md) |
| Skill catalogue and routing | [antick](skills/antick/SKILL.md) |
| Skill and agent instruction review | [skill-review](skills/skill-review/SKILL.md) |
| Electron development and native desktop polish | [electron-app](skills/electron-app/SKILL.md) |
