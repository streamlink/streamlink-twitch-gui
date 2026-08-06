# Authenticated Channel Points Support Design

## Goal

Allow Streamlink Twitch GUI to earn Twitch channel points while the user watches a stream through Streamlink/mpv, without keeping a Twitch browser page open.

## Constraint discovered during design

The app's existing Twitch device-flow token is suitable for Helix, but Twitch does not accept third-party application tokens when Streamlink requests the private playback access token. Streamlink's current Twitch authentication path requires a Twitch website `auth-token` supplied as `Authorization: OAuth <token>`.

Therefore the feature is split into two stacked changes:

1. Secure website-token setup and authenticated Streamlink playback.
2. A lifecycle-bound viewer-presence worker that emits Twitch's undocumented `minute-watched` telemetry only while a real player session is ready.

## PR 1: Twitch website playback authentication

### Backend

Add `src-tauri/src/twitch_web_auth.rs` with these responsibilities:

- Normalize and validate a user-supplied Twitch website token.
- Verify it through `https://id.twitch.tv/oauth2/validate`.
- Require the website token to belong to the same Twitch user as the app's existing device-flow login.
- Store the token in the OS credential store.
- Reversibly manage a marked block in Streamlink's plugin-specific `config.twitch` file:

  ```text
  # BEGIN streamlink-twitch-gui managed Twitch auth
  twitch-api-header=Authorization=OAuth <token>
  # END streamlink-twitch-gui managed Twitch auth
  ```

- Preserve all user-owned Streamlink configuration outside that block.
- Apply mode `0600` on Unix after writing.
- Remove both the credential and managed block when disconnected.
- Never return the token to the frontend or logs.

### Frontend

Add an account-adjacent setup control that:

- Shows whether authenticated playback is connected.
- Accepts the website token once.
- Explains that the token grants full account access and is stored in the OS credential manager.
- Allows explicit removal.
- Does not persist the token in Zustand, local storage, settings exports, Sentry, or DOM after a successful save.

## PR 2: Viewer presence

### Backend

Add `src-tauri/src/viewer_presence.rs` with a reconciled worker set keyed by Streamlink session ID.

Each active worker:

- Requires a stored, validated website token.
- Resolves Twitch's current Spade telemetry URL from Twitch's runtime configuration.
- Sends a compact, base64-encoded `minute-watched` event for the real channel ID, broadcast ID, viewer user ID, login, and `player=site`.
- Starts only after the corresponding player session reports `ready`.
- Stops when the session ends, is replaced, is manually stopped, or is omitted from the next sync.
- Uses bounded HTTP timeouts and backoff.
- Limits simultaneous point-presence workers to two.
- Exposes only non-sensitive diagnostics.

### Frontend lifecycle

Maintain frontend-only presence metadata keyed by Streamlink session ID because the Rust `StreamSession` DTO does not currently carry Helix channel and broadcast IDs.

- Populate metadata from the `HelixStream` used to start each session.
- Reconcile workers after status updates, refreshes, stops, seamless switches, and raid transitions.
- Prune metadata for sessions no longer returned by Rust.
- Add an experimental `streaming.channelPoints` setting, default `false`.

## Failure behavior

- Website-token validation failure must not write credentials or Streamlink config.
- Account mismatch must fail closed.
- Missing or malformed Twitch runtime config disables presence for that attempt and retries with backoff.
- A telemetry HTTP `204` means only that Twitch accepted the request, not that points were credited.
- Presence failures never stop playback.
- Logout from the normal Helix session does not silently delete the separate website token; the UI clearly shows the two authentication states.

## Testing

### Rust

- Token normalization and rejection.
- Managed config block insertion, replacement, preservation, and removal.
- Streamlink config path selection by platform helper inputs.
- Base64 and telemetry payload construction.
- Worker reconciliation and two-session limit using deterministic pure helpers.

### Frontend

- Settings migration defaults `channelPoints` to false.
- Presence-target pruning and ready-session request selection.
- Account UI clears token input after save and never displays the saved secret.

### Integration

GitHub Actions must pass:

- `npm test`
- `npm run build`
- dependency audit gate
- `cargo fmt --check`
- `cargo clippy -- -D warnings`
- `cargo check`
- `cargo test`

## Non-goals

- Automatic bonus-chest claiming.
- Predictions, bets, drops, or moments.
- Background farming without a real active Streamlink player.
- Browser-cookie database extraction.
- Exposing or exporting the Twitch website token.
- Claiming that undocumented Twitch behavior is stable or officially supported.
