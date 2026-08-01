# Follow raids (EventSub) — Design

**Status:** Approved for implementation (pending final spec review)  
**Date:** 2026-08-01  
**Product:** Streamlink Twitch GUI (Tauri rewrite)

## Goal

When a channel the user is watching raids another channel, offer a short countdown prompt, then redirect **that slot’s** stream and chat to the raid target unless the user cancels.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Prompt | Banner with **15s** countdown; **Follow now** / **Stay** |
| Multistream | Replace **only the raiding slot**; other streams stay |
| Detection | Twitch **EventSub WebSocket** `channel.raid` (`from_broadcaster_user_id`) |
| Default | Setting **Follow raids** = on |
| Auth | Existing user OAuth; no new scopes for `channel.raid` |
| Logged out | No EventSub; no raid follow |

## Out of scope (v1)

- Incoming-raid notifications (`to_broadcaster_user_id`)
- Auto-follow with no prompt
- Switching Chatterino tabs without process relaunch
- Following raids when chat provider is browser/chrome/custom (only `embedded` + `chatterino` are wired today)

## Architecture

```
Watching sessions change
        │
        ▼
Rust EventSub WS manager
  • connect (user token)
  • subscribe channel.raid per watched broadcaster id
  • resubscribe on session start/stop
        │
        │  emit raid-outgoing { fromChannel, toLogin, toId, viewers? }
        ▼
Frontend RaidBanner
  • 15s countdown (cancellable)
  • Follow now / Stay
        │
        ▼
Watching store: replaceSlotWithRaid(from, toHelixStream)
  • stop session for `from`
  • start `to` in same slot index
  • layout_watching + syncChatterino / setActiveChat
```

### Detection (Rust)

- New module (e.g. `src-tauri/src/eventsub.rs`) owns:
  - WebSocket to Twitch EventSub (keepalive / reconnect)
  - App or user access token from existing auth store
  - Desired set of `from_broadcaster_user_id` derived from live watching channels (resolve login → id via Helix once, cache)
  - Diff subscriptions when the watching set changes
- On `channel.raid` notification where `from_broadcaster_user_login` matches a watching channel:
  - Emit Tauri event `raid-outgoing` with:
    - `fromChannel` (login)
    - `toChannel` / `toLogin`
    - `toUserId`
    - `viewers` (optional)
- Deduplicate: ignore repeat events for the same `from→to` while a prompt is active or within a short cooldown (e.g. 60s).

### Prompt (Frontend)

- Banner component (alongside update/launch banners), mounted when listening for streaming events.
- Copy: **`{from}` is raiding `{to}` — following in {n}s`**
- Actions:
  - **Follow now** — cancel timer, run redirect immediately
  - **Stay** — cancel timer, dismiss; do not redirect for this raid
- Timer: 15 seconds from event receipt; tick every 1s.
- If the `from` session ends before follow (user stopped the stream), dismiss the prompt.
- If another raid arrives for a different slot, allow a second banner or queue (v1: one banner at a time; newest for a different `from` replaces only if previous was dismissed — prefer **queue or stack by `fromChannel`** so two multistream raids both get handled).  
  **v1 simplification:** at most one active prompt; if a second raid arrives, queue it and show after the first resolves.

### Redirect (Frontend store)

New helper, e.g. `followRaid({ fromChannel, toStream })`:

1. Resolve `toStream` as a `HelixStream` (Helix `getStreams` / users by login; if offline, still attempt `stream_start` with channel login and best-effort title).
2. Find slot index of `fromChannel` in `slotChannels`.
3. Stop the session for `fromChannel` (or start target with replace limited to that session — prefer explicit stop + start in-slot to avoid seamless “replace all”).
4. Insert `toChannel` at the same slot index; start stream with `replaceExisting: false` and correct `slotIndex` / `slotChannels`.
5. Call existing `scheduleLayoutAfterReady()` / `layout_watching`.
6. Chat:
   - `chatterino`: `syncChatterino(updatedChannelList)` (kill + relaunch with new `--channels=` — existing behavior)
   - `embedded`: `setActiveChat(toChannel)` if active chat was `fromChannel`; always refresh tab set if UI lists channels

**Seamless-switch interaction:** If seamless is on and only one stream is open, behavior matches “replace that one slot” (same as today after follow). If seamless is on with multiple streams (unusual), still only replace the raiding slot — do **not** call the full `replaceExisting: true` path that kills every session.

### Settings

- `settings.streaming.followRaids: boolean` (default `true`), schema bump as needed.
- Settings UI: checkbox near linked dock / seamless, with short hint.
- When toggled off: Rust tears down EventSub (or leaves WS up but unsubscribes / ignores); UI ignores events.

### Auth / failure modes

| Case | Behavior |
|------|----------|
| Not logged in | No EventSub; no banner |
| Token expired | Reconnect fails; log + silent disable until re-login |
| Helix cannot resolve target | Banner still shows login; follow attempts `stream_start` by login |
| Target offline after raid | Start anyway (Twitch raid landing); existing offline/goodbye path applies |
| EventSub disconnect | Exponential backoff reconnect; resubscribe current set |

## Testing

- Unit: subscription diff (add/remove channels); raid event JSON parse; prompt countdown cancel/follow.
- Manual: single stream raid → banner → auto follow; Stay; Follow now; two-stream multistream only raiding slot moves; setting off = no banner.

## Success criteria

- Raid from a watched channel surfaces a 15s cancellable prompt.
- Accepting (or timeout) moves stream + chat for that slot only.
- Other multistream slots unchanged.
- Unrelated apps / non-watching channels never trigger redirects.
- Follow raids can be disabled in settings.
