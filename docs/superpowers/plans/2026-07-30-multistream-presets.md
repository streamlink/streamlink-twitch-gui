# Multistream Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multistream layout presets, ordered slots, and Chatterino lifecycle tied to mpv/session exit.

**Architecture:** Frontend owns slot order + preset setting; Rust tiles by ordered channels + layout id, tracks owned Chatterino PID (kill/resync), and polls Streamlink/mpv exit to prune sessions and emit `stream-sessions-changed`.

**Tech Stack:** Tauri 2 (Rust), React/Zustand, Vitest.

## Global Constraints

- Seamless on = single replace; presets/slots only when Seamless off.
- One Chatterino for all active channels; kill owned PID only when last stream ends.
- Presets: `1` | `2` | `2x2` | `3plus1` | `3x2` | `4x2`; default `2x2`.
- Capacity hard-cap; do not auto-upgrade layout.
- Chat strip `CHAT_WIDTH_FRACTION = 0.18`; tile inside video work area.
- Never move/kill non-owned Chatterino windows.
- Spec: `docs/superpowers/specs/2026-07-30-multistream-presets-design.md`

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/streaming/layout.ts` | Preset enum, capacity, `computePresetTileFractions` |
| `src/lib/streaming/layout.test.ts` | Geometry + capacity tests |
| `src/lib/settings/types.ts` + `store.ts` | `multistreamLayout`, schema bump |
| `src/lib/streaming/store.ts` | Slots, resync chat, layout invoke, reorder |
| `src/pages/SettingsPage.tsx` + locales | Layout dropdown |
| `src/pages/BrowsePages.tsx` (Watching) | Layout + ↑↓ list |
| `src-tauri/src/streaming.rs` | Preset tiling, close Chatterino, exit poll |
| `src-tauri/src/lib.rs` | Commands: layout layout arg, close_chatterino, maybe watch |

---

### Task 1: Preset geometry (TS)

**Files:**
- Modify: `src/lib/streaming/layout.ts`
- Test: `src/lib/streaming/layout.test.ts`

- [ ] Add `MultistreamLayout` type + `LAYOUT_CAPACITY` + `computePresetTileFractions(layout, count, reserveChat)` including `3plus1`
- [ ] Keep `MAX_MULTISTREAMS = 8`; tests for each preset capacity and 3plus1 fractions
- [ ] Run: `npx vitest run src/lib/streaming/layout.test.ts`

### Task 2: Settings schema

**Files:**
- Modify: `src/lib/settings/types.ts`, `store.ts`, `store.test.ts`
- Modify: `src/locales/en/settings.json`, `SettingsPage.tsx`

- [ ] Add `streaming.multistreamLayout` default `2x2`; bump `SETTINGS_SCHEMA_VERSION` to 9; migrate missing → `2x2`
- [ ] Settings UI dropdown when Seamless off; update seamless hint
- [ ] Run settings tests

### Task 3: Rust preset tiling + layout arg

**Files:**
- Modify: `src-tauri/src/streaming.rs`, `lib.rs`

- [ ] `layout_watching(channels, reserve_chat, layout: Option<String>)`
- [ ] `tile_rect` / preset match TS (esp. 3plus1)
- [ ] `cargo check`

### Task 4: Slot store + Chatterino resync

**Files:**
- Modify: `src/lib/streaming/store.ts`

- [ ] `slotChannels` ordered; watch append; stop remove; ↑↓ reorder API
- [ ] Capacity check vs preset; pass layout to `layout_watching`
- [ ] `syncChatterino(channels)` — always invoke open (Rust kills old PID first)
- [ ] No alphabetical sort for layout/chat

### Task 5: Close Chatterino + exit detection (Rust)

**Files:**
- Modify: `src-tauri/src/streaming.rs`, `lib.rs`

- [ ] `close_owned_chatterino()` — TerminateProcess owned PID
- [ ] On `open_chatterino_chat`: kill previous owned PID before spawn
- [ ] On `stop_all` / last `stop_stream`: close Chatterino
- [ ] Poll loop or enhance `list_sessions`: if Streamlink dead or mpv `stgui-{ch}` missing → stop session, emit `stream-sessions-changed`
- [ ] Frontend listener resyncs chat + layout

### Task 6: Watching UI

**Files:**
- Modify: `src/pages/BrowsePages.tsx` (WatchingPage)

- [ ] Layout dropdown + ordered list with ↑↓ Stop when multistream
- [ ] Wire reorder → store → layout

### Task 7: Verify

- [ ] `npx vitest run src/lib/streaming src/lib/settings`
- [ ] `cargo check --manifest-path src-tauri/Cargo.toml`
