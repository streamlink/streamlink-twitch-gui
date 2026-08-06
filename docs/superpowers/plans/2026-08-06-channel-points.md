# Authenticated Channel Points Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure Twitch website playback authentication, then add an experimental viewer-presence worker that can earn channel points while a real Streamlink player session is active.

**Architecture:** The base PR owns website-token validation, OS credential storage, and reversible Streamlink `config.twitch` integration. The stacked PR owns undocumented Twitch telemetry and reconciles workers from the existing frontend stream lifecycle without changing the large Rust streaming process manager.

**Tech Stack:** Tauri 2, Rust, reqwest, keyring, React, TypeScript, Zustand, Vitest, GitHub Actions.

## Global Constraints

- Never expose the website token to the frontend after save, logs, settings persistence, exports, or Sentry.
- Require the website token and existing device-flow login to identify the same Twitch user.
- Preserve user-owned Streamlink configuration outside the managed block.
- Default channel-points behavior to disabled.
- Presence exists only while a real Streamlink session is ready.
- Limit simultaneous presence workers to two.
- Do not implement bonus claims, predictions, drops, moments, or background farming.

---

### Task 1: Website-token backend

**Files:**
- Create: `src-tauri/src/twitch_web_auth.rs`
- Modify: `src-tauri/src/lib.rs`

**Interfaces:**
- Produces: `TwitchWebAuthStatus`, `get_status()`, `save(token)`, `clear()`, `load_token()`.
- Produces Tauri commands: `twitch_web_auth_status`, `twitch_web_auth_save`, `twitch_web_auth_clear`.

- [ ] **Step 1: Write failing Rust tests for token normalization and managed-block transforms**

Cover accepted raw, `oauth:` and `OAuth ` forms; reject whitespace/control characters; insert, replace, preserve and remove the managed block.

- [ ] **Step 2: Run `cargo test twitch_web_auth` and verify the tests fail because the module is missing**

- [ ] **Step 3: Implement the pure helpers and rerun the focused tests**

- [ ] **Step 4: Add keyring storage, Twitch validation, account matching, platform config-path resolution, atomic file writes and Unix `0600` permissions**

- [ ] **Step 5: Register commands in `lib.rs` and run `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo check`, and `cargo test`**

- [ ] **Step 6: Commit as `feat: add Twitch website playback auth`**

### Task 2: Website-token frontend

**Files:**
- Create: `src/components/TwitchWebsiteAuth.tsx`
- Modify: `src/components/AuthBar.tsx`
- Modify: `src/components/AuthBar.css`
- Modify: `src/locales/en/common.json`

**Interfaces:**
- Consumes Tauri commands from Task 1.
- Produces an account-adjacent setup panel that never stores a successful token.

- [ ] **Step 1: Write a failing component test for save, input clearing and secret non-display**

- [ ] **Step 2: Run the focused frontend test and verify RED**

- [ ] **Step 3: Implement the minimal component and AuthBar integration**

- [ ] **Step 4: Run `npm test` and `npm run build`**

- [ ] **Step 5: Commit as `feat: add authenticated playback setup`**

### Task 3: Publish base PR

**Files:**
- Review all files changed in Tasks 1-2.

- [ ] **Step 1: Run the complete frontend and Rust CI command set**

- [ ] **Step 2: Push `agent/twitch-web-auth` and open a draft PR to `master`**

- [ ] **Step 3: Wait for GitHub Actions and fix all failures before continuing**

### Task 4: Presence backend on stacked branch

**Files:**
- Create: `src-tauri/src/viewer_presence.rs`
- Modify: `src-tauri/src/lib.rs`

**Interfaces:**
- Consumes: `twitch_web_auth::load_token()` and existing `auth::get_session()`.
- Produces: `ViewerPresenceTarget`, `ViewerPresenceStatus`, and `viewer_presence_sync`.

- [ ] **Step 1: Write failing Rust tests for base64, payload construction, target sanitization and two-worker selection**

- [ ] **Step 2: Run focused tests and verify RED**

- [ ] **Step 3: Implement deterministic helpers**

- [ ] **Step 4: Implement Spade endpoint resolution, worker cancellation, reconciliation, timeouts and backoff**

- [ ] **Step 5: Register managed state and command in `lib.rs`; run all Rust checks**

- [ ] **Step 6: Commit as `feat: add Twitch viewer presence workers`**

### Task 5: Presence frontend and setting

**Files:**
- Create: `src/lib/streaming/presence.ts`
- Create: `src/lib/streaming/presence.test.ts`
- Modify: `src/lib/streaming/store.ts`
- Modify: `src/lib/settings/types.ts`
- Modify: `src/lib/settings/store.ts`
- Modify: `src/lib/settings/store.test.ts`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/locales/en/settings.json`

**Interfaces:**
- Produces: frontend-only `PresenceTarget` metadata and `buildPresenceSync()`.
- Consumes: `viewer_presence_sync` Tauri command.

- [ ] **Step 1: Write failing tests for migration default, metadata pruning, ready filtering and deterministic two-session selection**

- [ ] **Step 2: Run focused tests and verify RED**

- [ ] **Step 3: Add schema version 15 and the disabled-by-default experimental setting**

- [ ] **Step 4: Integrate metadata and reconciliation into watch, status, refresh, stop, stop-all, seamless replacement and raid flows**

- [ ] **Step 5: Add Settings UI copy and run all frontend checks**

- [ ] **Step 6: Commit as `feat: integrate channel points presence`**

### Task 6: Publish stacked PR

**Files:**
- Review all files changed in Tasks 4-5.

- [ ] **Step 1: Run the complete frontend and Rust CI command set**

- [ ] **Step 2: Push `agent/channel-points-presence` and open a draft PR targeting `agent/twitch-web-auth`**

- [ ] **Step 3: Wait for GitHub Actions and fix all failures**

- [ ] **Step 4: Compare the stacked branch against the base branch and verify that only presence-related changes remain**
