# Channel Points Web-Auth Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken dedicated TV Channel Points credential with the existing Twitch website auth, then align viewer-presence telemetry with the known-good earning contract.

**Architecture:** PR 1 makes `twitch_web_auth` the only private Channel Points credential and removes the TV login module/UI. PR 2 is stacked on PR 1 and changes only viewer-presence protocol details proven in the successful external miner test.

**Tech Stack:** Tauri 2, Rust, reqwest, keyring, React, TypeScript, Vitest, GitHub Actions.

## Global Constraints

- Never expose the website token to the frontend after save, logs, settings persistence, exports, or Sentry.
- Website auth must belong to the same Twitch user as the normal app login.
- Preserve Streamlink's managed `config.twitch` website-auth integration.
- Channel Points presence exists only while a real Streamlink session is ready.
- Presence failures never stop playback.
- Do not add Hermes in this change.

---

### Task 1: Add internal Web-auth session identity

**Files:**
- Modify: `src-tauri/src/twitch_web_auth.rs`

**Interfaces:**
- Produces: `WEB_CLIENT_ID`, `TwitchWebAuthSession`, `load_session()`, `device_id()`, `client_session_id()`.

- [ ] **Step 1: Add a failing Rust test**

Add a test that requires `WEB_CLIENT_ID == "kimne78kx3ncx6brgo4mv6wki5h1ko"`, non-empty stable `device_id()`, and non-empty stable `client_session_id()`.

- [ ] **Step 2: Verify RED through CI**

Push the test-only commit and confirm GitHub Actions fails because the new identity helpers do not exist yet.

- [ ] **Step 3: Implement the minimal internal API**

Add the Web client constant, Rust-only session struct/loader, and per-process UUID-based identity helpers. Reuse the existing stored website auth; do not create a second credential.

- [ ] **Step 4: Verify GREEN**

Run/confirm `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo check`, `cargo test`, `npm test`, and `npm run build` through the repository CI workflow.

### Task 2: Replace TV auth consumers and UI

**Files:**
- Modify: `src-tauri/src/channel_points.rs`
- Modify: `src-tauri/src/viewer_presence.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src/components/AuthBar.tsx`
- Delete: `src-tauri/src/channel_points_auth.rs`
- Delete: `src/components/ChannelPointsAuth.tsx`

**Interfaces:**
- Consumes: `twitch_web_auth::load_session()`, `WEB_CLIENT_ID`, `device_id()`, `client_session_id()`.
- Produces: unchanged Tauri commands `channel_points_refresh`, `viewer_presence_sync`, `viewer_presence_status`.

- [ ] **Step 1: Switch private GQL callers to Website auth**

Both Rust consumers load the website session, validate the user ID against `auth::get_session()`, send `Authorization: OAuth <token>`, and send the Web client ID.

- [ ] **Step 2: Remove TV auth backend commands/module**

Delete `mod channel_points_auth`, all four TV auth Tauri commands, and their `generate_handler!` registrations.

- [ ] **Step 3: Remove TV auth frontend control**

Delete `ChannelPointsAuth.tsx` and its import/render from `AuthBar.tsx`. `TwitchWebsiteAuth` remains the sole setup UI.

- [ ] **Step 4: Update error strings**

Replace TV-login-specific errors with Website-auth-specific wording.

- [ ] **Step 5: Verify PR 1**

Confirm the full CI command set passes and inspect the branch diff for zero remaining production references to `channel_points_auth` or `ChannelPointsAuth`.

- [ ] **Step 6: Open PR 1**

Open `agent/channel-points-web-auth-repair` against `master` as a draft titled `fix: use Twitch Web auth for Channel Points`.

---

### Task 3: Add failing protocol-contract tests on stacked branch

**Files:**
- Modify: `src-tauri/src/viewer_presence.rs`

**Interfaces:**
- Produces tests for playback variables, Usher query parameters, telemetry properties, and cadence bounds.

- [ ] **Step 1: Create stacked branch**

Create `agent/channel-points-watch-contract` from `agent/channel-points-web-auth-repair`.

- [ ] **Step 2: Change/add tests before production code**

Require `playerType = "picture-by-picture"`; require all seven known-good Usher parameters; require `hidden=false`, `logged_in=true`, `muted=false`, `location="channel"`; require success delay in 55..=70 seconds.

- [ ] **Step 3: Verify RED through CI**

Push the test-only commit and confirm GitHub Actions fails against the current production implementation.

### Task 4: Align viewer presence with known-good watch contract

**Files:**
- Modify: `src-tauri/src/viewer_presence.rs`

**Interfaces:**
- Preserves: `ViewerPresenceTarget`, `ViewerPresenceStatus`, `sync()` command contract.

- [ ] **Step 1: Implement bounded success cadence**

Replace the fixed 20-second interval with a helper returning 55..=70 seconds without adding a new dependency.

- [ ] **Step 2: Update PlaybackAccessToken variables**

Set `playerType` to `picture-by-picture` while retaining `platform=web` and the current persisted query hash.

- [ ] **Step 3: Update Usher URL**

Add `cdm=wv`, `player_version=1.22.0`, `player_type=pulsar`, `player_backend=mediaplayer`, `playlist_include_framerate=true`, `allow_source=true`, and `transcode_mode=cbr_v1` while retaining `sig` and `token`.

- [ ] **Step 4: Update telemetry properties**

Add `hidden=false`, `logged_in=true`, `muted=false`, and `location="channel"` to the existing minute-watched payload.

- [ ] **Step 5: Verify GREEN**

Confirm all Rust/frontend CI commands pass.

- [ ] **Step 6: Open PR 2**

Open `agent/channel-points-watch-contract` against `agent/channel-points-web-auth-repair` as a draft titled `fix: align Channel Points viewer presence with Web player contract`.

## Plan self-review

- Spec coverage: both auth and protocol sections are represented; Hermes is explicitly excluded.
- Placeholder scan: no TBD/TODO/deferred implementation steps.
- Type consistency: PR 2 keeps the public presence command/DTO contract unchanged and depends only on PR 1's internal website-auth API.
