import { ArrowUpRight, Database, Code2, ShieldCheck, ScanLine, Scissors, MessageCircle, AlignLeft, RefreshCw, HardDrive, PanelsTopLeft, type LucideIcon } from "lucide-react";
import type { Skill } from "./catalog";

export const skillIcons = {
  "database-audit": Database,
  "soc2-readiness": ShieldCheck,
  "vercel-domain-cleanup": ArrowUpRight,
  "github-actions-security-audit": ShieldCheck,
  "code-review": ScanLine,
  "code-build": Code2,
  "code-refactor": RefreshCw,
  "code-audit": Scissors,
  "code-security": ShieldCheck,
  concise: AlignLeft,
  "make-sense": MessageCircle,
  "upgrade-dependencies": RefreshCw,
  simplify: AlignLeft,
  "public-desktop-release": ShieldCheck,
  "private-desktop-release": ShieldCheck,
  "reclaim-dev-space": HardDrive,
  "save-omarchy-window-layout": PanelsTopLeft,
  "ai-harness-setup": RefreshCw,
  "test-suite-hardening": ScanLine,
  "ci-cd-triage": RefreshCw,
  "accessibility-audit": ScanLine,
  "documentation-generation": AlignLeft,
  "interview": MessageCircle
} satisfies Record<Skill["name"], LucideIcon>;
