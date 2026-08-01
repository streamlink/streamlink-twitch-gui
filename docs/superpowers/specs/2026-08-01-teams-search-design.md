# Teams search (browse polish) — Design

**Status:** Approved for implementation  
**Date:** 2026-08-01  
**Product:** Streamlink Twitch GUI (Tauri rewrite)

## Goal

Make Twitch **teams** discoverable from the sidebar without requiring a channel page first. Remove leftover “coming soon” copy for team members (already implemented).

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Entry | Nav **Teams** → `/teams` |
| UX | Search-by-name form → existing `/team/:teamName` detail |
| API | Existing `getTeamByName` (Helix `GET /teams?name=`) |
| Language filter | Out of scope for team live lists |
| Channel links | Keep channel → team links as today |

## Out of scope

- Top/featured teams directory (Helix has no such list)
- Merging teams into the Search page
- Offline member directory beyond what TeamPage already shows

## UI

- `TeamsSearchPage` at `/teams`: title, short lede, text input + submit.
- Submit looks up the team; on hit navigate to `/team/:teamName` (use API `team_name`).
- On miss / error: inline muted message (not found / Helix error).
- Optional: while loading, disable submit / show loading state.

## Nav & locales

- Add `teams` to `nav.json` and `primaryLinks` in `AppShell`.
- Add `teamsTitle` / `teamsLede` / `teamsPlaceholder` / `teamsNotFound` under `routes`.
- Remove unused `teamStub`.

## Changelog

- Unreleased: Teams search page in browse nav.
