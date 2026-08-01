# Follow Raids Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detect outgoing Twitch raids via EventSub WebSocket and offer a 15s cancellable banner that replaces only the raiding slot’s stream + chat.

**Architecture:** Rust owns EventSub WS + Helix subscription create/delete; emits `raid-outgoing`. Frontend shows `RaidBanner`, then `followRaid()` stops the from-session and starts the target in the same slot without `replaceExisting: true`.

**Tech Stack:** Tauri 2, Tokio, `tokio-tungstenite` + rustls, existing Helix proxy / auth token store, Zustand watching store, React banner.

**Spec:** `docs/superpowers/specs/2026-08-01-follow-raids-design.md`

## Global Constraints

- Prompt: 15s countdown; Follow now / Stay
- Multistream: replace **only** the raiding slot
- Detection: EventSub WS `channel.raid` with `from_broadcaster_user_id`
- Setting `streaming.followRaids` default `true`; schema version bump `11` → `12`
- No new OAuth scopes
- Logged out → no EventSub
- Chatterino: existing kill+relaunch via `syncChatterino`
- Do not use seamless `replaceExisting: true` for raid follow (would kill all sessions)

## File map

| File | Responsibility |
|------|----------------|
| `src-tauri/src/eventsub.rs` | WS session, subscribe diff, parse notifications, emit events |
| `src-tauri/src/lib.rs` | `mod eventsub`; init; commands `eventsub_set_channels`, `eventsub_set_enabled` |
| `src-tauri/Cargo.toml` | `tokio-tungstenite`, `futures-util` |
| `src/lib/settings/types.ts` + `store.ts` | `followRaids` + schema 12 |
| `src/lib/streaming/store.ts` | `followRaid`, sync EventSub channel list |
| `src/lib/streaming/raid.ts` | Types + queue helpers (pure, unit-tested) |
| `src/components/RaidBanner.tsx` (+ css) | UI countdown |
| `src/App.tsx` | Mount banner |
| `src/pages/SettingsPage.tsx` + locales | Toggle |
| `CHANGELOG.md` | Unreleased notes |

---

### Task 1: Settings — `followRaids`

**Files:**
- Modify: `src/lib/settings/types.ts`
- Modify: `src/lib/settings/store.ts`
- Modify: `src/lib/settings/store.test.ts`
- Modify: `src/locales/en/settings.json`
- Modify: `src/pages/SettingsPage.tsx`

**Produces:** `settings.streaming.followRaids: boolean` (default `true`), schema 12

- [ ] **Step 1:** Bump `SETTINGS_SCHEMA_VERSION` to `12`. Add `followRaids: boolean` under `streaming` in `AppSettings` and `defaultSettings` (`true`).
- [ ] **Step 2:** In `migrateSettings`, merge `followRaids: input.streaming?.followRaids ?? base.streaming.followRaids`.
- [ ] **Step 3:** Add Settings checkbox near seamless/linked dock with `settings:followRaids` / `settings:followRaidsHint`.
- [ ] **Step 4:** Extend `store.test.ts` expectation for default `followRaids === true`.
- [ ] **Step 5:** `npm test` — pass. Commit: `feat(settings): add followRaids toggle (schema 12)`

---

### Task 2: Pure raid queue helpers (frontend)

**Files:**
- Create: `src/lib/streaming/raid.ts`
- Create: `src/lib/streaming/raid.test.ts`

**Produces:**
```ts
export interface RaidOutgoingEvent {
  fromChannel: string;
  toChannel: string;
  toUserId: string;
  viewers?: number;
}
export function enqueueRaid(queue: RaidOutgoingEvent[], next: RaidOutgoingEvent): RaidOutgoingEvent[];
export function raidDedupeKey(e: RaidOutgoingEvent): string; // `${from}->${to}`
```

- [ ] **Step 1:** Write tests: enqueue appends; duplicate `from→to` ignored; different `from` queues; lowercase normalization.
- [ ] **Step 2:** Implement helpers.
- [ ] **Step 3:** `npm test` — pass. Commit: `feat(raid): queue helpers + tests`

---

### Task 3: Rust EventSub module (core)

**Files:**
- Create: `src-tauri/src/eventsub.rs`
- Modify: `src-tauri/Cargo.toml` — add:
  - `tokio-tungstenite = { version = "0.26", default-features = false, features = ["connect", "rustls-tls-webpki-roots"] }`
  - `futures-util = "0.3"`
- Modify: `src-tauri/src/lib.rs` — `mod eventsub;`

**Produces:**
```rust
pub fn init(app: AppHandle);
pub fn set_enabled(enabled: bool);
pub fn set_watched_channels(logins: Vec<String>); // lowercase
// emits: app.emit("raid-outgoing", RaidOutgoing { from_channel, to_channel, to_user_id, viewers })
```

**Protocol (Twitch EventSub WS):**
1. Connect `wss://eventsub.wss.twitch.tv/ws`
2. On `session_welcome`, store `session.id`
3. For each desired broadcaster id, `POST https://api.twitch.tv/helix/eventsub/subscriptions` with type `channel.raid`, version `1`, condition `{ "from_broadcaster_user_id": "<id>" }`, transport `{ "method": "websocket", "session_id": "<sid>" }`
4. On `notification` with `subscription.type == channel.raid`, map payload:
   - `from_broadcaster_user_login` → `from_channel`
   - `to_broadcaster_user_login` → `to_channel`
   - `to_broadcaster_user_id` → `to_user_id`
   - `viewers` → `viewers`
5. On `session_reconnect`, switch URL; on keepalive ignore; reconnect with backoff on close
6. Resolve login→id via Helix `GET /users?login=` using `auth` token + client id (same headers as `helix.rs`)
7. Diff: unsubscribe by deleting subscription ids no longer needed; subscribe missing (track map `login → subscription_id`)

**Auth:** `auth::store::load_tokens()` for bearer; `auth::public_client_id()` for Client-Id. If no token, disconnect and idle.

- [ ] **Step 1:** Add deps; create module stub with unit test parsing a sample notification JSON → `RaidOutgoing`.
- [ ] **Step 2:** Implement WS loop + Helix subscribe/delete + channel set sync on a tokio task.
- [ ] **Step 3:** `cargo test --lib` for parse test; `cargo clippy -- -D warnings`. Commit: `feat(eventsub): channel.raid websocket manager`

---

### Task 4: Wire EventSub to app lifecycle

**Files:**
- Modify: `src-tauri/src/lib.rs` (setup `eventsub::init`)
- Modify: `src/lib/streaming/store.ts` — after session/slot changes, invoke sync
- Create commands or call from existing stream hooks:
  - `eventsub_sync { channels: string[], enabled: bool }`

**Produces:** Watching list drives subscriptions; settings toggle drives enabled.

- [ ] **Step 1:** Register command `eventsub_sync`. Call `eventsub::init(app)` in `setup`.
- [ ] **Step 2:** From `store.ts`, `syncEventSub()` reads `followRaids` + `orderedChannels()` / running sessions and invokes `eventsub_sync`.
- [ ] **Step 3:** Call `syncEventSub` from `watchStream`, `stopSession`, `stopAll`, `bindStreamingListeners` refresh, and when `followRaids` setting changes (SettingsPage or settings subscribe).
- [ ] **Step 4:** Commit: `feat(eventsub): sync watched channels from UI`

---

### Task 5: `followRaid` in watching store

**Files:**
- Modify: `src/lib/streaming/store.ts`
- Modify: `src/lib/twitch/helix.ts` if needed (`getStreamsByUserLogins` or reuse `getUsersByLogin` + `getStreamsByUserIds`)

**Produces:**
```ts
followRaid: (fromChannel: string, to: { login: string; userId?: string; displayName?: string }) => Promise<void>
```

**Logic:**
1. `from = fromChannel.toLowerCase()`; find running session + index in `slotChannels` (or among running ordered list).
2. `stopSession` for that session id (if any).
3. Build `HelixStream`-like object: prefer Helix live data; else stub `{ user_login: to.login, user_id, user_name, title: "", ...defaults }`.
4. Update `slotChannels`: replace `from` with `to.login` at same index.
5. `stream_start` with `replaceExisting: false`, `slotIndex` / `slotCount` from updated slots, `reserveChat` as today.
6. Chatterino / embedded chat sync for new channel list; `setActiveChat(to)` if active was `from`.
7. `scheduleLayoutAfterReady()`.

- [ ] **Step 1:** Implement `followRaid`; ensure it never sets `replaceExisting: true`.
- [ ] **Step 2:** Manual reasoning check: 2 slots A,B — raid A→C → slots C,B.
- [ ] **Step 3:** Commit: `feat(streaming): followRaid replaces one slot`

---

### Task 6: RaidBanner UI

**Files:**
- Create: `src/components/RaidBanner.tsx`
- Create: `src/components/RaidBanner.css`
- Modify: `src/App.tsx`
- Modify: `src/locales/en/routes.json` (or `common.json`) for copy keys
- Modify: `src/lib/streaming/store.ts` or local state in banner for queue

**Produces:** Visible banner; Follow now / Stay; auto-follow at 0.

- [ ] **Step 1:** Listen `raid-outgoing`; if `!followRaids` ignore; enqueue; show active prompt with 15s timer.
- [ ] **Step 2:** Stay → dismiss + cooldown key; Follow now / timeout → `followRaid` then dequeue next.
- [ ] **Step 3:** Dismiss if `from` session disappears (`sessions` no longer contains from).
- [ ] **Step 4:** Mount in `App.tsx` near `UpdateBanner`. Commit: `feat(ui): raid follow banner`

---

### Task 7: Changelog + verify

**Files:**
- Modify: `CHANGELOG.md` under Unreleased

- [ ] **Step 1:** Document Added follow-raids feature.
- [ ] **Step 2:** `npm run ci` (or `npm test` + `cargo clippy` + `cargo test`).
- [ ] **Step 3:** Commit: `docs: changelog for follow raids`

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| EventSub `channel.raid` from broadcaster | 3–4 |
| Emit `raid-outgoing` | 3 |
| 15s banner Follow/Stay | 6 |
| Per-slot replace | 5 |
| Chatterino/embedded sync | 5 |
| `followRaids` setting | 1, 4 |
| Logged out = no follow | 3–4 |
| Queue second raid | 2, 6 |
| Dedupe from→to | 2, 6 |

## Manual test plan

1. Log in, enable Follow raids, watch one channel — when they raid, banner appears; wait 15s → stream+chat switch.
2. Stay → no switch.
3. Follow now → immediate switch.
4. Two streams; one raids → only that tile + chat tabs update.
5. Toggle Follow raids off → no banner.
6. Log out → no EventSub errors in UI.
