# Streamlink Twitch GUI Rewrite — Implementation Plan

> **For agentic workers:** use executing-plans / subagent-driven-development against this doc. Steps are ordered; verify each phase before moving on.

**Goal:** Replace the NW.js + Ember app (now in `legacy/`) with Tauri 2 + React + TypeScript on Windows: i18n-ready (`en` only), bundled Streamlink, embedded chat, Sentry, full parity minus Chatty.

**Architecture:** React UI (`src/`) ↔ Tauri commands (`src-tauri/src/`) ↔ Streamlink/mpv/Chatterino processes + Twitch Helix.

---

## Phase 1 — Scaffold (current)

- [x] Move old app to `legacy/`
- [x] Tauri 2 + React + Vite + TS at repo root
- [x] i18n (`src/locales/en/*`) wired through `react-i18next`
- [x] App shell + routes stubs
- [x] Settings store + schema migration test
- [x] Doctor command (Streamlink/mpv/Chatterino detect)
- [x] CI frontend job + Streamlink fetch script stub
- [ ] `npm test` and `npm run build` green
- [ ] `npm run tauri dev` launches

## Phase 2 — Auth + Helix

- [x] Twitch client-id via env (`TWITCH_CLIENT_ID` / `VITE_TWITCH_CLIENT_ID`) with upstream fallback for local tryouts
- [x] Device Code Flow login (Twitch has no PKCE) + refresh + OS keyring
- [x] Typed Helix client + followed / top streams UI
- [ ] User registers own Public Twitch application for production use

## Phase 3 — Launch path

- [x] Resolve bundled vs system Streamlink
- [x] Spawn Streamlink + player args (mpv/VLC/…)
- [x] Watching session model + stop
- [x] Embedded chat panel + Chatterino spawn option
- [x] Doctor command (first-run UX still thin — About page)

## Phase 4 — Browse

- [x] Top streams, games, search, channel, teams (team detail stub)
- [ ] Virtualized infinite scroll (TanStack Virtual) for very long lists

## Phase 5 — Settings parity

- [ ] Full settings sections + persist + import/export
- [ ] Tray, hotkeys, notifications, per-channel

## Phase 6 — Ship

- [ ] Multi-stream
- [ ] Sentry (React + Rust), opt-out setting
- [ ] Updater + deep links + single-instance
- [ ] `fetch-streamlink` in release CI; NSIS/MSI

---

## File map (high level)

| Path | Role |
|------|------|
| `src/pages/*` | Route screens |
| `src/lib/settings/*` | Settings types/store/migrations |
| `src/locales/en/*` | English catalogs |
| `src-tauri/src/doctor.rs` | Tool detection |
| `src-tauri/resources/` | Bundled Streamlink (CI-filled) |
| `legacy/` | Old Ember app reference |
| `scripts/fetch-streamlink.mjs` | Download Windows Streamlink build |
