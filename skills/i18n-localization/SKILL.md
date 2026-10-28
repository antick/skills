---
name: i18n-localization
description: Wire internationalization and localization into existing applications. Use for message catalogs, locale negotiation, pluralization, formatting, RTL layouts, localized routes, or translation fallbacks.
---

# Internationalization and Localization

Separate language and locale behavior from application logic while preserving
existing content and URLs. Translation drafts are not reviewed translations.

## Discover the locale contract

Read instructions, framework configuration, existing translation libraries,
catalogues, formatting utilities, routing, SSR/native setup, and content sources.
Identify requested locales, default/fallback locale, selection precedence, user
preference persistence, timezone, currency policy, and translated content ownership.
Ask for missing target languages or product policy that cannot be inferred; keep
inventory and extraction work moving while waiting.

Use the existing library and installed-version official guidance. Do not install
a second translation system. If none exists, select a supported approach that fits
the runtime and scope; verify dependency releases and pin eligible stable versions
at least 48 hours old if adding packages.

## Extract meaningful messages

Inventory user-visible UI, validation errors, accessibility labels, notifications,
emails, and server-rendered text in scope. Keep stable message identifiers separate
from source text and include translator context for ambiguous terms.
Use complete messages with supported plural/select rules; do not concatenate
fragments or assume English word order. Preserve placeholders and types.

Keep user content, identifiers, logs, and API machine codes out of translation
unless their contract explicitly requires it. Avoid rendering translated HTML
unsafely; use the library's supported rich-text composition and escaping.

## Wire shared infrastructure

1. Configure locale loading, fallback, and unsupported-locale handling. Avoid
   untrusted locale strings becoming arbitrary file paths or imports.
2. Use shared formatting helpers for dates, numbers, currencies, relative times,
   and lists. Preserve explicit project format requirements and distinguish a
   calendar date from an instant; timezone conversion must not shift birthdays.
3. Keep server/client locale selection consistent to avoid hydration mismatches.
   Include locale in caches and generated outputs where content differs.
4. Preserve locale through navigation and auth returns; implement localized routes
   only if requested. Check canonical/alternate links for public localized pages.
5. Support RTL with logical layout properties and intentional icon direction.
   Do not reverse all icons or user-supplied data blindly.
6. Preserve stable preference/storage formats. Do not infer currency from language
   alone or silently change stored values when display locale changes.

## Verify and hand off

Run missing/unused-key and placeholder/plural checks using existing tools. Test
default/fallback/unsupported locales, locale switching, persistence, SSR, long
messages, plurals, zero/negative numbers, date boundaries, and RTL when supported.
Use pseudo-localization for layout stress; mark generated translations as drafts
requiring language review. Review labels, errors, focus, truncation, and overflow.

Run tests/types/lint/build and inspect relevant rendered flows. Report wired locales,
translation completeness and review status, shared formatting policy, remaining
hardcoded text, and untested devices or languages. Do not claim language quality
from compilation or key parity alone.
