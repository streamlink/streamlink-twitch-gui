# Stream language filter — Design

**Status:** Approved for implementation  
**Date:** 2026-08-01  
**Product:** Streamlink Twitch GUI (Tauri rewrite)

## Goal

Let users restrict **browse** stream lists (Top streams and category streams) to one or more broadcast languages. Selection persists across restarts. Empty selection shows all languages.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Scope | **Browse only** — Top streams + category (`game_id`) streams |
| Selection | **Multiple** languages |
| Persistence | Settings field; shared across browse pages |
| Empty selection | **No filter** (all languages) |
| Helix | Approach **A** — repeated `language` query params on `GET /streams` |
| Out of scope | Followed, search, channel page, team pages |

## Settings

- `streaming.streamLanguages: string[]` — lowercase ISO 639-1 codes as Twitch expects (`en`, `de`, `ja`, …).
- Default: `[]`.
- Schema version bump **12 → 13**; migrate missing → `[]`.
- Written from the browse UI control (no separate Settings page row required in v1).

## Language catalog

- Static curated list in `src/lib/twitch/languages.ts`: code + English display label.
- Codes are ISO 639-1 two-letter tags plus Helix’s literal `other` (not locale variants like `pt-br`).
- Unknown codes already stored in settings still round-trip if they match Helix’s shape; UI shows code as label if missing from catalog.

## UI

- Compact **Languages** control in the page header of Streams and Game streams.
- Opens a panel/checklist: toggle languages; **Clear** sets `[]` (all).
- Button label summarizes selection: “All languages” / “English” / “English +2”.
- Changing selection updates settings and invalidates/refetches the infinite query.

## Helix

- Extend `getTopStreams` / `getStreamsByGame` to accept optional `languages: string[]`.
- Build query as pairs so multiple `language` keys are sent (existing `HelixQuery` record cannot).
- Omit `language` entirely when the array is empty.
- Cap at Helix’s 100-language limit (truncate defensively if somehow exceeded).

## Query keys

- Include sorted `streamLanguages` in React Query keys so cache does not mix filtered/unfiltered pages.

## Non-goals

- Client-side filtering of Followed.
- Auto-detect from OS/UI locale.
- Per-page independent language sets.
