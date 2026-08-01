# Stream Language Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist multi-select broadcast language filter for Top streams and category streams via Helix `language` query params.

**Architecture:** Settings hold `streaming.streamLanguages`. Browse headers mount a shared `LanguageFilter` that writes settings. Helix helpers send repeated `language` pairs when the list is non-empty.

**Tech Stack:** React, Zustand settings store, TanStack Query, Helix via Tauri `helix_fetch`.

**Spec:** `docs/superpowers/specs/2026-08-01-stream-language-filter-design.md`

## Global Constraints

- Browse only (Streams + Game streams)
- Multi-select; empty = all languages
- Persist in settings; schema 12 → 13
- Helix repeated `language` params (not client-side filter)
- No Followed/search/channel filtering

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/settings/types.ts` + `store.ts` + `store.test.ts` | `streamLanguages` + schema 13 |
| `src/lib/twitch/languages.ts` | Curated code/label list + helpers |
| `src/lib/twitch/helix.ts` | `getTopStreams` / `getStreamsByGame` accept languages |
| `src/components/LanguageFilter.tsx` (+ css) | Multi-select control |
| `src/pages/BrowsePages.tsx` | StreamsPage wires filter |
| `src/pages/BrowseExtraPages.tsx` | GameStreamsPage wires filter |
| `src/locales/en/common.json` (or routes) | Labels |
| `CHANGELOG.md` | Unreleased note |

---

### Task 1: Settings — `streamLanguages`

**Files:** `types.ts`, `store.ts`, `store.test.ts`

- [ ] Bump schema to 13; add `streamLanguages: string[]` default `[]`; migrate.
- [ ] Test default + migrate preserves array.
- [ ] Commit: `feat(settings): streamLanguages filter (schema 13)`

---

### Task 2: Language catalog + Helix

**Files:** `languages.ts`, `helix.ts`, optional small unit test for pair building / summarize

- [ ] Curated `TWITCH_LANGUAGES` + `languageLabel` + `summarizeLanguages`.
- [ ] `getTopStreams(cursor?, languages?)` / `getStreamsByGame(gameId, cursor?, languages?)` via pairs.
- [ ] Commit: `feat(helix): pass stream language filters`

---

### Task 3: LanguageFilter UI + browse pages

**Files:** `LanguageFilter.tsx/css`, `BrowsePages.tsx`, `BrowseExtraPages.tsx`, locales, CHANGELOG

- [ ] Component reads/writes `settings.streaming.streamLanguages`.
- [ ] Wire both browse pages; include languages in queryKey; pass to fetchers.
- [ ] Changelog + `npm test` / `npm run build`.
- [ ] Commit: `feat(ui): browse language multi-filter`

---

## Manual test plan

1. Streams → Languages → pick English → list is EN-only; restart app → still EN.
2. Add German → EN+DE results.
3. Clear → all languages again.
4. Open a category → same selection applies.
5. Followed page unchanged (no control, no filter).
