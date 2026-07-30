# Multistream presets + Chatterino lifecycle

Date: 2026-07-30  
Status: implemented (v1)

## Problem

Multistream today is only “Seamless off → allow up to 8 streams” with alphabetical auto-tile and a single Chatterino that is never closed when players die. Users cannot pick a layout, control slot order, or get chat cleaned up when an mpv window is closed.

## Goals

1. **Preset layouts** for multistream (not freeform drag).
2. **Ordered slots** — watch order fills slots; Watching page can reorder with ↑↓.
3. **One Chatterino** for all active channels (`t:a;t:b;…`).
4. **Lifecycle:** when an mpv for a channel closes (or Stop), drop that session; resync Chatterino to remaining channels; when the **last** stream ends, kill **our** owned Chatterino PID only.
5. Keep Seamless **on** = single stream replace (unchanged).

## Non-goals

- Per-stream Chatterino windows.
- Freeform drag-and-drop tile editor.
- Multi-monitor layout picker (primary work area only for v1).
- macOS/Linux Win32 docking parity (presets still define order; OS placement may be best-effort later).

## Mode switch (unchanged)

| Setting | Behavior |
|---------|----------|
| Seamless **on** | One stream; new watch replaces current after handoff. |
| Seamless **off** | Multistream; up to 8 slots; presets + ordered list apply. |

Chat provider **Chatterino** still reserves the right strip and opens/resyncs chat. Embedded chat unchanged.

## Presets

Saved as `settings.streaming.multistreamLayout` (string enum). Capacity = max simultaneous players for that preset.

| Id | Label | Capacity | Geometry (video region, left of chat) |
|----|-------|----------|----------------------------------------|
| `1` | Single | 1 | Full video region |
| `2` | Side by side | 2 | 2 columns × 1 row |
| `2x2` | 2×2 | 4 | 2×2 grid |
| `3plus1` | 3+1 | 4 | Slot 0 large (left ~2/3 width, full height); slots 1–3 stacked in right ~1/3 |
| `3x2` | 3×2 | 6 | 3 columns × 2 rows |
| `4x2` | 4×2 | 8 | 4 columns × 2 rows |

**Default:** `2x2` when multistream is first enabled (or migrate: missing key → `2x2`).

**Capacity rules:**

- Watching more streams than the preset allows → reject with clear error (“Layout holds N streams; stop one or pick a larger layout”).
- Prefer not auto-upgrading layout without user action (predictable).
- If user switches to a **smaller** preset while over capacity → block change or require stopping extras first (block with message).

Chat strip: keep existing `CHAT_WIDTH_FRACTION` (0.18). Presets tile only inside the **video** work-area rect (above taskbar), same as today.

## Slot model

Frontend owns an ordered `slotChannels: string[]` (lowercase logins) while multistream is active:

1. **Watch** → append channel to first free logical slot (end of list). Start Streamlink/mpv; retile by **slot index**, not alphabetical sort.
2. **Reorder** on Watching → ↑↓ swaps slot indices → `layout_watching` with ordered channel list.
3. **Stop** / **mpv closed** → remove that channel from slots → retile → Chatterino resync.
4. Seamless mode ignores slots (single session).

Rust `layout_watching(channels, reserveChat, layout?)` uses `channels[i]` → tile `i` for the active preset. Grid helpers in TS (`layout.ts`) and Rust must share the same preset math (especially `3plus1`).

## Watching UI

On `/watching` when Seamless is off:

- Show **Layout** dropdown (same enum as Settings).
- Show ordered list: `#1 channel` … with ↑ ↓ Stop.
- Empty slots optional (dim placeholders up to capacity) — nice-to-have; not required for v1 if list-of-active is enough.

Settings → Streaming: same **Multistream layout** dropdown (visible or enabled when Seamless is off; still stored always).

## Chatterino lifecycle (option A)

- **Open / resync:** one process we spawned; args `--channels=t:ch1;t:ch2;…` in **slot order**.
- **PID:** keep `owned_chatterino_pid`; only move/kill that PID.
- **On channel set change:** if our Chatterino is still running, kill it and spawn a new one with the new list (Chatterino has no reliable “replace channels” IPC). If list empty → kill only, do not respawn.
- **Never** resize/kill unrelated user Chatterino windows.
- Deduped launch key should include ordered channel list so resync actually runs.

## Player exit detection

Today: Streamlink child polled on `stream_list`; user closing mpv is not observed reliably.

v1 requirements:

1. Background poll (Rust or frontend ~1–2s) for each session: Streamlink child exited **or** mpv window `stgui-{channel}` gone.
2. Treat either as session end → same path as Stop for that channel (remove session, close leftover Streamlink if needed, retile, Chatterino resync).
3. Emit `stream-sessions-changed` (or dedicated event) so UI updates without waiting for the Watching 4s poll.
4. Stop All → stop every session + kill owned Chatterino PID.

## Settings schema

Bump schema version as needed. Add:

```ts
streaming.multistreamLayout:
  "1" | "2" | "2x2" | "3plus1" | "3x2" | "4x2"  // default "2x2"
```

Copy updates: Seamless hint can mention Watching presets/slots; chat hint stays “one Chatterino with all active chats.”

## Implementation sketch (for planning)

1. Shared preset → tile rects in `layout.ts` + Rust `tile_rect` (or pass absolute rects from frontend — prefer shared enum + duplicated geometry with tests).
2. `layout_watching` accepts `layout` + **ordered** `channels`.
3. Store: slot order; stop/resync Chatterino helpers; wire Watching + Settings UI.
4. Rust: mpv-window / child watch → prune session → emit change; `close_chatterino` / kill owned PID.
5. Tests: preset geometry (esp. `3plus1`), capacity errors, Chatterino sync key ordering.

## Success criteria

- User can pick any listed preset and see matching tile shapes with Chatterino on the right.
- Slot order follows watch order and ↑↓; not alphabetical.
- Closing one mpv removes that stream and updates Chatterino; closing the last kills our Chatterino.
- Seamless on remains single-replace; no preset UI required there.

## Resolved decisions

- Chat model: **A** — one Chatterino for all active channels.
- Layout UX: **presets only** (no freeform drag).
- Include **3+1** and all presets in the table above.
