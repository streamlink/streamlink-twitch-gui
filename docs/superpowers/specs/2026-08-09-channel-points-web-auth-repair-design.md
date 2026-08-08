# Channel Points Web-Auth Repair Design

## Goal

Restore reliable Twitch Channel Points earning in Streamlink Twitch GUI by using the app's existing Twitch website `auth-token` for all private Channel Points GraphQL and viewer-presence traffic, eliminating the dedicated Android TV OAuth session that Twitch now rejects for private viewer points authorization.

## Evidence

On 2026-08-09 we reproduced the auth split against Twitch Hermes:

- Android TV device-flow token: Hermes authentication succeeds, public `video-playback-by-id` subscription succeeds, private `community-points-user-v1.<viewer>` fails with `SUB007 unauthorized`.
- Website `auth-token` from the same user's browser session: Hermes authentication succeeds, the private points subscription succeeds, and Twitch immediately emits a real `points-earned` event with `reason_code=WATCH`.
- The Python Channel Points miner earns `+10 WATCH` after switching from TV client identity to the same website token + Web client identity.

The failure is therefore credential/client identity, not stale cookies, HLS bytes, or Spade HTTP acceptance.

## Architecture

### Single Channel Points credential

`src-tauri/src/twitch_web_auth.rs` remains the single secure website-auth owner. It validates the token, requires the same Twitch account as the normal app login, stores the secret in the OS credential store, and manages Streamlink's authenticated playback config.

Extend its internal API with:

- `WEB_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko"`
- `TwitchWebAuthSession { token, user_id }`
- `load_session()` for Rust-only consumers
- stable per-process `device_id()` and `client_session_id()` helpers for private Web GQL requests

The token remains inaccessible to the frontend after save.

### Remove TV Channel Points auth

Delete the dedicated `channel_points_auth` backend module, Tauri commands, and `ChannelPointsAuth` frontend control. There must be no second Channel Points login.

The existing Website Authentication UI is the setup surface for both authenticated Streamlink playback and Channel Points.

### Private GQL identity

`channel_points.rs` and `viewer_presence.rs` load the website session and require its user ID to match the normal app session. Private GQL requests use:

- `Authorization: OAuth <website-token>`
- `Client-Id: kimne78kx3ncx6brgo4mv6wki5h1ko`
- existing per-process Client-Session-ID, Client-Version, X-Device-ID, browser User-Agent and Twitch referer headers

A missing website token produces a Website-auth-specific error, not a TV-login error.

### Viewer-presence protocol alignment

A stacked follow-up change aligns the worker with the exact known-good Python miner contract used in the successful WATCH test:

- success cadence between 55 and 70 seconds
- PlaybackAccessToken `playerType = "picture-by-picture"`, `platform = "web"`
- Usher query parameters: `cdm=wv`, `player_version=1.22.0`, `player_type=pulsar`, `player_backend=mediaplayer`, `playlist_include_framerate=true`, `allow_source=true`, `transcode_mode=cbr_v1`
- media playlist fetch + media segment HEAD stays in place
- minute-watched properties add `hidden=false`, `logged_in=true`, `muted=false`, `location="channel"`

HTTP 204 remains only telemetry acceptance; the UI balance refresh remains the observable earning check for this scope.

## Failure behavior

- Website token missing, invalid, or account-mismatched: Channel Points presence and balance refresh fail closed; playback itself must not be stopped.
- Removing Website Authentication cancels active presence workers before clearing the credential.
- Normal Twitch logout cancels presence workers but does not silently delete the separately stored website token.
- Presence transport/protocol failures remain non-fatal to Streamlink/mpv playback.

## Testing

### PR 1

- Rust test proves Web client identity helpers exist and are stable per process.
- Existing `twitch_web_auth` normalization/config tests continue to pass.
- Rust compile/tests prove `channel_points.rs` and `viewer_presence.rs` no longer depend on `channel_points_auth`.
- Frontend build proves the TV login component is fully removed from AuthBar.

### PR 2

- Unit test asserts `picture-by-picture` playback payload.
- Unit test asserts Usher URL contains all known-good player parameters.
- Unit test asserts minute-watched payload contains the four viewer-state properties.
- Unit test asserts success cadence is bounded to 55..=70 seconds.

## Non-goals

- Hermes integration or live points-earned notifications.
- Reintroducing a TV/device Channel Points login.
- Browser cookie-database extraction inside the application.
- Background farming without a real ready Streamlink player session.
- Predictions, drops, moments, or unrelated Twitch automation.
