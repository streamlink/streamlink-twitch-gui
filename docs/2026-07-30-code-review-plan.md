# Code Review Plan — Bugs, Security, Best Practices, Performance

Date: 2026-07-30
Scope: full review of the Tauri rewrite (`src/`, `src-tauri/`, `scripts/`, `.github/`, configs).
`legacy/` was reviewed only for repository hygiene (it is not part of the build).

Findings are grouped by category and ordered by severity within each group.
Every item lists evidence (`file:line`), impact, and the required change.
The prioritized execution plan is at the bottom.

---

## 1. Security

### S1 — HIGH: OAuth access token exposed to the webview layer
- **Evidence:** `src-tauri/src/lib.rs:46-49` (`auth_get_access_token` command),
  `src-tauri/src/auth/mod.rs:265` (`AuthSession.access_token` returned to JS),
  `src/lib/twitch/helix.ts:34-43` (token cached in module-level JS variable).
- **Problem:** The raw Twitch OAuth token lives in webview JS memory and is
  reachable by any JavaScript running in the webview — including any future
  XSS, a compromised npm dependency, or a malicious locale/asset. The token
  carries write scopes (`user:manage:blocked_users`, `src-tauri/src/auth/mod.rs:17`).
- **Fix:** Keep the token inside Rust only.
  - Add a generic `helix_fetch(path, query)` Tauri command that attaches
    `Client-Id` + `Authorization` in Rust and returns parsed JSON.
  - Remove `auth_get_access_token` and drop `access_token` from `AuthSession`.
  - Re-audit scopes: if block/unblock is not used in the UI, drop
    `user:manage:blocked_users` (least privilege).

### S2 — MEDIUM: Deep link auto-starts processes without confirmation or validation
- **Evidence:** `src/components/DeepLinkAndUpdaterBootstrap.tsx:25-53`.
- **Problem:** Any website can hand the OS an `stg://watch/<login>` URL. The
  handler navigates, queries Helix, and calls `watchStream()` — spawning
  Streamlink + mpv + Chatterino — with no user confirmation and no validation
  of `login` beyond lowercasing (`login.split(/[/?#]/)[0]`). Twitch logins
  match `^[a-z0-9_]{1,25}$`; anything else should be rejected.
- **Fix:**
  - Validate the channel against the Twitch login regex before any navigation
    or Helix call.
  - Only auto-watch when the target is actually live (already partially true);
    otherwise navigate only.
  - Consider a one-time "Allow stg:// links to start streams?" setting
    (default: navigate only, don't spawn).

### S3 — MEDIUM: Bundled Streamlink downloaded without integrity verification
- **Evidence:** `scripts/fetch-streamlink.mjs:23-36`.
- **Problem:** The script downloads a zip from `streamlink/windows-builds`
  releases and bundles it into signed installers, but never verifies a pinned
  SHA-256. A hijacked release asset or MITM on a CI runner becomes
  code execution for every user. Version is pinned (`8.4.0-1`) but integrity
  is not.
- **Fix:** Pin an expected SHA-256 next to the tag in the script, verify the
  downloaded zip before extracting, and fail the build on mismatch.
  Re-pin hash + tag together on upgrades.

### S4 — MEDIUM: Telemetry (Sentry) is opt-out, not opt-in
- **Evidence:** `src/lib/settings/types.ts:152` (`sentryEnabled: true`),
  `src/lib/sentry.tsx`.
- **Problem:** Crash reporting is enabled by default. Best practice (and
  GDPR-friendly design) is explicit opt-in on first run.
- **Fix:** Default `sentryEnabled` to `false`; add a toggle prompt to the
  onboarding wizard.

### S5 — MEDIUM: Sentry scrubbing is minimal
- **Evidence:** `src/lib/sentry.tsx:17-24` (only deletes `Authorization`
  header), `src-tauri/src/streaming.rs:1257-1267` (raw Streamlink log lines
  emitted to the frontend as `stream-status`).
- **Problem:** Streamlink log lines can contain session URLs with `sig`/`token`
  query params (usher/CDN URLs). If such a line lands in an error message,
  breadcrumb, or event extra, it is uploaded to Sentry.
- **Fix:** Extend `beforeSend` to strip query strings from breadcrumb URLs and
  redact `token=`, `sig=`, `Bearer ...`, and Twitch token-shaped strings
  (`[a-z0-9]{30}`) from messages/extras.

### S6 — LOW: Embedded chat iframe has no `sandbox`
- **Evidence:** `src/components/EmbeddedChat.tsx:26-31`.
- **Problem:** The Twitch embed iframe runs with full privileges in its
  origin. Twitch is trusted, but defense-in-depth costs nothing here.
- **Fix:** Add `sandbox="allow-scripts allow-same-origin allow-popups
  allow-popups-to-escape-sandbox allow-forms"` and
  `referrerPolicy="no-referrer"`; verify chat login still works.

### S7 — LOW: CSP can be tightened
- **Evidence:** `src-tauri/tauri.conf.json:24`.
- **Problem:** `style-src 'unsafe-inline'` is broad (needed only if inline
  `<style>`/style attributes are used — React inline styles via `el.style`
  don't require it; Vite production builds extract CSS).
- **Fix:** Test production build without `'unsafe-inline'` (or scope it to
  `style-src-attr`). Keep everything else as-is; `default-src 'self'` already
  covers `object-src`/`base-uri`.

### S8 — LOW: Hardcoded third-party Twitch client ID fallback
- **Evidence:** `src-tauri/src/auth/mod.rs:110-119`.
- **Problem:** The fallback client ID `phiay4sq36lfv9zu7cbqwz2ndnesfd8` is the
  *upstream* streamlink-twitch-gui application's ID. Client IDs for public
  OAuth clients are not secrets, but this fork's releases should use its own
  registered application (rate limits, revocation, and ToS are per-app).
- **Fix:** Register a Twitch application for this project, inject its ID via
  `TWITCH_CLIENT_ID`/`VITE_TWITCH_CLIENT_ID` in CI (secrets already exist in
  `release.yml:67-68`), and remove or clearly mark the upstream fallback as
  dev-only.

### S9 — LOW: PID-reuse race in process termination
- **Evidence:** `src-tauri/src/streaming.rs:325-341` (`close_owned_chatterino`),
  `src-tauri/src/streaming.rs:1708-1719`.
- **Problem:** A stored PID can be recycled by Windows between Chatterino
  exiting and `TerminateProcess` running, killing an unrelated process. The
  waiter thread (`streaming.rs:445-453`) narrows the window but doesn't close it.
- **Fix:** Keep the `Child` handle (or a process handle opened at spawn time)
  and terminate through it instead of re-opening by raw PID.

---

## 2. Bugs

### B1 — HIGH: Session can be killed while the stream is playing (window-title heuristic)
- **Evidence:** `src-tauri/src/streaming.rs:1516-1559` (`prune_dead_sessions`),
  `streaming.rs:1575-1585` (`mpv_window_alive`), `streaming.rs:889-895`
  (soft/fuzzy title fallback in `find_window_by_title`).
- **Problem:** 8 s after "ready", if no window matches the title
  `stgui-<channel>`, the session is removed **and the Streamlink child is
  killed**. Title matching is inherently fragile (mpv title changes, Unicode
  channels, another app matching the fuzzy `contains` fallback in either
  direction). A false negative kills a healthy stream; a false positive keeps
  a dead session alive.
- **Fix:** Prefer process-liveness over window titles: capture the player PID
  (Streamlink `--player-passthrough` isn't available, but mpv's
  `--input-ipc-server` or a wrapper probe is), or only treat "mpv gone" as
  terminal when the Streamlink child has also exited. At minimum, require
  several consecutive failed probes (>30 s) before killing.

### B2 — MEDIUM: `classify_line` marks "ready" too early + dead branch
- **Evidence:** `src-tauri/src/streaming.rs:1154-1175`.
- **Problem:** `"opening stream"` is matched in the **ready** branch
  (line 1160), so the session is marked ready (triggering layout, handoff,
  and the B1 kill-timer) before the player exists. The identical check in the
  "starting" branch (line 1167) is unreachable dead code.
- **Fix:** Remove `"opening stream"` from the ready branch; keep readiness to
  `player:` / `starting player` / `writing to player`. Add a unit test.

### B3 — MEDIUM: Orphaned player windows for non-mpv players and non-Windows OSes
- **Evidence:** `src-tauri/src/streaming.rs:1626-1720`
  (`close_player_windows_for_channel*` matches only the `stgui-<channel>`
  prefix), `streaming.rs:266-269` (VLC title is `"{channel} - {game} -
  {title}"`, never `stgui-...`), `streaming.rs:1632-1635` (no-op on
  non-Windows).
- **Problem:** Stopping a stream only closes player windows whose title
  starts with `stgui-`. VLC/MPC/PotPlayer/custom players never get that
  title, and on Linux/macOS nothing is closed at all — with
  `--loop-file=inf` the orphaned player keeps replaying the buffer forever.
- **Fix:** Set the `stgui-<channel>` title for *every* player that supports
  it (VLC: `--input-title-format`; document unsupported ones), and/or track
  the player process tree (job object / process group) so stop kills the
  player directly. On non-Windows, kill the process group.

### B4 — MEDIUM: Custom mpv args silently dropped in docked mode
- **Evidence:** `src-tauri/src/streaming.rs:745-773` (`build_mpv_dock_args`
  only re-adds `--no-keepaspect-window` and `--loop-*` from the composed
  preset args), vs. `src/lib/settings/mpv.ts:31-77` (frontend composes many
  more flags + user extras).
- **Problem:** Everything the user configured — `--cache=yes`,
  `--demuxer-max-back-bytes`, custom `--title`, and all free-text
  `player.customArgs` — is discarded whenever `player_id == "mpv"` (the
  default). Behavior silently diverges from the settings UI.
- **Fix:** Merge instead of filter: start from dock-required flags, then
  append all preset/custom args except conflicting geometry/maximize flags
  (which the dock owns). Add a test asserting custom extras survive.

### B5 — MEDIUM: Device-flow `slow_down` not honored; refresh clears tokens on transient errors
- **Evidence:** `src-tauri/src/auth/mod.rs:184-186` (`slow_down` treated
  identically to `authorization_pending`), `src/lib/auth/store.ts:88-116`
  (fixed poll interval), `src-tauri/src/auth/mod.rs:217-222` (any non-2xx
  refresh → `clear_tokens()`).
- **Problem:**
  a) RFC 8628 requires increasing the poll interval on `slow_down`; Twitch
     enforces this and can rate-limit the app.
  b) A transient 500/503 from Twitch during refresh wipes the keyring entry
     and forces a full re-login.
- **Fix:** Return a distinct poll outcome (`Pending | SlowDown | Done`) and
  have the frontend add ~5 s on `SlowDown`. Only clear stored tokens on
  400/401 (`invalid_grant`); keep them on 5xx and surface a retryable error.

### B6 — LOW: Updater endpoint likely 404s (no `latest.json` manifest)
- **Evidence:** `src-tauri/tauri.conf.json:30-32` (endpoint
  `releases/latest/download/latest.json`), `.github/workflows/release.yml`
  (plain `tauri build`; uploads `*.sig`/`*.json` but nothing generates a
  manifest).
- **Problem:** `tauri build` produces `.sig` files, not the `latest.json`
  update manifest — that is normally generated by `tauri-action`, which this
  workflow does not use. The updater check will fail at runtime.
- **Fix:** Verify in the next tagged build; if missing, generate the manifest
  in the workflow (switch to `tauri-apps/tauri-action` or add a small script
  emitting `latest.json` from the `.sig` files) and upload it with the
  release assets.

### B7 — LOW: Dead code and stale comments
- **Evidence:**
  - `src-tauri/src/streaming.rs:1389-1397` — `index`/`count` computed, then
    discarded via `let _ = (index, count);`.
  - `streaming.rs:274-291` — `apply_side_chat_player_args`,
    `launch_chatterino_for_channel` (`#[allow(dead_code)]`).
  - `streaming.rs:1722-1725` — `streamlink_path_exists` unused.
  - `streaming.rs:1681` — comment says titles look like `"{channel} - {game}
    - {title}"`, but the dock path sets `stgui-<channel>`; the comment is why
    B3 went unnoticed.
  - `src-tauri/src/auth/store.rs:86-92` — `checksum` helper unused.
  - `which_on_path` duplicated in `streaming.rs:132-143` and `doctor.rs:25-35`.
- **Fix:** Delete or consolidate; fix the stale comment.

---

## 3. Best practices

### P1 — Sync Tauri commands block the main thread
- **Evidence:** `src-tauri/src/lib.rs:14-17` (`get_doctor_report` spawns
  `streamlink --version`, `mpv --version`, and `reg query` synchronously),
  `lib.rs:51-58, 75-94` (`stream_start`, `open_chatterino_chat`,
  `layout_watching` — process spawning + PATH walks on the main thread).
- **Problem:** In Tauri 2, non-async commands run on the main thread; a slow
  `--version` probe or AV scanner freeze hangs the whole UI.
- **Fix:** Mark these commands `async` (or `#[tauri::command(async)]` /
  `spawn_blocking`) so they run off the main thread.

### P2 — CI is too thin
- **Evidence:** `.github/workflows/ci.yml` — only `npm test`, `npm run build`,
  `cargo check`.
- **Fix:** Add: `cargo test` (Rust unit tests exist but never run in CI),
  `cargo clippy -- -D warnings`, `cargo fmt --check`, `npm audit
  --audit-level=high` (with a documented, dated exception for
  GHSA-qwww-vcr4-c8h2 — see P3), and `cargo audit` (or Dependabot for
  Cargo + npm).

### P3 — `react-router` advisory GHSA-qwww-vcr4-c8h2
- **Evidence:** `package.json` (`react-router-dom ^7.18.2`), `npm audit`
  reports 2 high-severity findings.
- **Assessment:** Affects `react-router >=7.12.0 <8.3.0`, **only** via the
  unstable RSC APIs. This app is a client-only SPA (`BrowserRouter`, no
  loaders/actions/RSC), so it is **not exploitable** today.
- **Fix:** Do **not** downgrade to 7.11.0 (reintroduces an open-redirect
  advisory). Either plan the v8.3.0+ major upgrade, or add an audit
  allowlist entry with written justification + review date. Re-check on every
  router upgrade.

### P4 — `legacy/` folder should be removed
- **Evidence:** `legacy/` (old NW.js app, `Gruntfile.js`, `yarn.lock` with
  years-old dependencies).
- **Problem:** Not part of the build; triggers Dependabot/code-scanning
  noise, doubles repo surface, confuses contributors. Git history preserves
  it permanently.
- **Fix:** Delete `legacy/` (optionally note the last tag/commit containing
  it in the README).

### P5 — No HTTP timeouts anywhere
- **Evidence:** `src-tauri/src/auth/mod.rs:121-123` (fresh
  `reqwest::Client::new()` per call, no timeout), `src/lib/twitch/helix.ts:59`
  (bare `fetch`, no `AbortSignal`).
- **Problem:** A stalled connection hangs auth/session/Helix calls forever —
  UI spinners never resolve.
- **Fix:** One shared Rust client (`OnceLock`) with `connect_timeout` 5 s /
  total `timeout` 15 s (also fixes per-call TCP/TLS setup cost). Frontend:
  `AbortSignal.timeout(15_000)` on Helix fetches.

### P6 — Missing error boundary
- **Evidence:** `src/App.tsx` (no `ErrorBoundary`; Sentry React is installed
  but its `ErrorBoundary` is unused).
- **Fix:** Wrap routes in `Sentry.ErrorBoundary` with a friendly fallback so
  one failing page doesn't white-screen the app.

### P7 — Release workflow hygiene
- **Evidence:** `.github/workflows/release.yml`.
- **Notes (all low risk, currently OK):** actions pinned by tag, not SHA;
  certificate PFX written to `$RUNNER_TEMP` without explicit cleanup;
  `generate_release_notes: true` is fine.
- **Fix (optional):** Pin actions by commit SHA; delete the PFX in a
  post-step.

---

## 4. Performance

### F1 — `auth_get_access_token` costs 2 extra HTTP round trips per cache miss
- **Evidence:** `src-tauri/src/auth/mod.rs:312-317` (`access_token()` →
  `get_session()` → validate + `/helix/users`), `src/lib/twitch/helix.ts:41`
  (45 s JS cache).
- **Problem:** Every ~45 s of active use: validate + users + the actual Helix
  call = 3 requests where 1 suffices.
- **Fix:** After S1 (proxying Helix in Rust), cache the validated session in
  Rust and only re-validate on 401/expiry; `/helix/users` only needs to run
  once after login.

### F2 — Per-call `reqwest::Client` construction
- **Evidence:** `src-tauri/src/auth/mod.rs:121-123` (called on every auth
  operation).
- **Fix:** Shared client via `OnceLock` (connection pooling + the P5
  timeouts in one place).

### F3 — Watchdog polling is fine, but layout thrash isn't
- **Evidence:** `src-tauri/src/streaming.rs:1562-1573` (1.5 s prune loop —
  OK), `streaming.rs:384-393` (`layout_watching` spawns a thread that
  re-tiles 6× at 250 ms on every call), `src/lib/streaming/store.ts:119-134`
  (layout scheduled on every `ready` status + after every start, plus a
  second hard-coded 500 ms call at `store.ts:276-285`).
- **Problem:** Multiple overlapping retile threads can fight each other when
  several streams become ready at once.
- **Fix:** Debounce/serialize layout work in Rust (single
  "latest request wins" task), remove the redundant frontend 500 ms call.

### F4 — Settings persistence re-opens the store on every save
- **Evidence:** `src/lib/settings/persist.ts:30-32` (`load()` per
  `persistSettings`).
- **Fix:** Cache the store handle in a module-level lazy singleton.

### F5 — Startup warm-up already good; keep an eye on first-stream latency
- **Evidence:** `src-tauri/src/lib.rs:154-164` (spawns `streamlink --version`
  warm-up thread), path caches in `streaming.rs:17-30`.
- **Note:** Good pattern. After P1, ensure the warm-up doesn't race the
  doctor/stream-start caches (they're independent `OnceLock`s — consider
  sharing).

---

## 5. Prioritized execution plan

**Phase 1 — Security-critical (do before next release)**
1. S1: Move Helix calls behind a Rust `helix_fetch` command; stop returning
   the access token to JS; re-audit OAuth scopes.
2. S3: SHA-256 pinning in `fetch-streamlink.mjs`.
3. S2: Validate deep-link channel names; don't spawn processes from
   unconfirmed deep links.
4. B1: Stop killing sessions based on window-title absence alone.

**Phase 2 — Correct bugs users can hit**
5. B2: Fix `classify_line` readiness + dead branch (add test).
6. B3: Close/kill player processes reliably for all players and OSes.
7. B4: Merge (not filter) custom mpv args in dock mode.
8. B5: Honor `slow_down`; don't wipe tokens on transient 5xx.
9. B6: Verify/fix updater `latest.json` generation in the release workflow.

**Phase 3 — Hardening & hygiene**
10. S4/S5: Sentry opt-in + deeper scrubbing.
11. S6/S7: iframe sandbox, CSP tightening.
12. S8: Own Twitch client ID for releases.
13. P1: Make blocking commands async.
14. P5/F1/F2: Shared HTTP client + timeouts (Rust and frontend).
15. P2: CI gates (clippy, fmt, cargo test, audits).
16. P3: react-router decision (upgrade to ≥8.3.0 or documented allowlist).

**Phase 4 — Cleanup / removal**
17. P4: Delete `legacy/`.
18. B7: Remove dead code, fix stale comments, dedupe `which_on_path`.
19. P6: Add `Sentry.ErrorBoundary`.
20. F3/F4: Serialize layout retiling; cache settings store handle.

**Explicitly not issues (checked, no action):**
- Command injection via process spawning — all `Command` calls use arg
  vectors, no shell; channel is embedded in a `twitch.tv/…` URL argument.
- `dangerouslySetInnerHTML` / `eval` — none found in `src/`.
- Token storage at rest — OS keyring via `keyring` crate is correct
  (`src-tauri/src/auth/store.rs`).
- Updater public key in `tauri.conf.json` — public key, safe to commit.
- Watchdog 1.5 s polling loop — negligible cost.

---

## 6. Implementation status (2026-07-30)

All four phases implemented and verified (`cargo test` 8/8, `cargo clippy
-D warnings` clean, `cargo fmt --check` clean, `tsc` clean, vitest 19/19,
production `vite build` OK, audit gate green).

**Phase 1** — S1: new `helix_fetch` Rust proxy (`src-tauri/src/helix.rs`),
token removed from `AuthSession`, `auth_get_access_token` deleted, block
scopes dropped (least privilege). S3: SHA-256 pin + pre-extract verification
in `fetch-streamlink.mjs`. S2: Twitch-login regex validation (frontend +
Rust), new opt-in setting `gui.deepLinkAutoWatch` (default off) + Settings
toggle. B1: sessions are only pruned via title-heuristic after 40 s of
continuous window absence (`MPV_MISSING_GRACE`); channel/quality CLI args
are charset-validated.

**Phase 2** — B2: `classify_line` no longer treats "Opening stream" as
ready (+ regression tests). B3: Streamlink children are assigned to a
Windows Job Object; stop/prune/stop-all now `TerminateJobObject`, killing
the whole player tree (title-based closing remains a fallback); VLC gets
the `stgui-<channel>` title marker. B4: dock mode merges preset/custom mpv
args, dropping only dock-owned flags (+ test). B5: `DevicePoll` tagged
union distinguishes `slowDown` (frontend backs off +5 s, capped 30 s);
token refresh only wipes the keyring on 400/401. B6:
`scripts/generate-updater-manifest.mjs` + release workflow step now produce
and publish `latest.json`.

**Phase 3** — S4: `sentryEnabled` defaults to false + onboarding opt-in
checkbox. S5: Sentry `beforeSend` strips query strings and redacts Bearer /
`sig=` / `token=` / token-shaped strings in messages, breadcrumbs and
request data. S6: chat iframe `sandbox` + `referrerPolicy`. S7: CSP
`style-src` hardened to `'self'` (no inline-style usage found). S8: client
ID fallback clearly marked dev-only. P1: blocking commands
(`get_doctor_report`, `stream_start`, `stream_stop*`, `open/close
chatterino`) moved off the main thread via `spawn_blocking`. P5/F1/F2:
shared `reqwest` client with 5 s/15 s timeouts (`src-tauri/src/http.rs`),
lightweight `token_for_api` (no validate+users round trips per call).
P2/P3: CI gained `cargo fmt --check`, `clippy -D warnings`, `cargo test`
and `scripts/audit-gate.mjs` (per-advisory allowlist with justification;
GHSA-qwww-vcr4-c8h2 documented as non-exploitable for this SPA).

**Phase 4** — `legacy/` deleted (944 files, history preserved). Dead code
removed (`apply_side_chat_player_args`, `launch_chatterino_for_channel`,
`streamlink_path_exists`, `checksum`, dead index/count block);
`which_on_path` deduplicated; unused crates `sha2`, `base64`, `rand`
dropped. `Sentry.ErrorBoundary` wraps the routes. Layout retiling is
serialized latest-wins via `LAYOUT_GENERATION`; redundant 500 ms frontend
layout call removed. Settings store handle cached.

**Remaining owner actions (cannot be done in code):**
- S8: register this project's own Twitch application and set
  `TWITCH_CLIENT_ID` / `VITE_TWITCH_CLIENT_ID` secrets (workflow already
  injects them).
- P3: schedule the react-router ≥ 8.3.0 major upgrade; the audit-gate
  allowlist entry has a review date of 2026-10-30.
- B6: confirm `latest.json` lands on the next tagged release.
- Non-Windows: player processes are still not tree-killed (app currently
  targets Windows only: NSIS/MSI).
