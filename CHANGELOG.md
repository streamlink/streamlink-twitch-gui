# Changelog

All notable changes to this Tauri rewrite are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Grey dock borders stay above mpv/Chatterino again (temporary TOPMOST while the dock or app is focused), and drop TOPMOST when another program is foreground so they no longer cover unrelated windows

### Planned

- Optional Authenticode-signed installers once a Windows code-signing certificate is available in CI
- Further parity and polish as we dogfood releases

## [0.3.0] — 2026-08-01

### Added

- **Follow raids**: EventSub WebSocket watches for outgoing `channel.raid` on streams you’re watching; a 15s banner (Follow now / Stay) then switches that slot’s stream and chat to the raid target. Multistream: only the raiding slot moves. Toggle under Settings → Streaming (`followRaids`, default on).
- **Browse language filter**: multi-select broadcast languages on Top streams and category pages (Helix `language` params). Empty selection = all languages. Persisted as `streaming.streamLanguages`.
- **Teams search**: Browse → Teams looks up a Twitch team by name and opens the team page (live members + watch). Channel → team links unchanged.
- **Per-channel notification mute**: global “notify when followed go live” remains; mute individual channels from the channel page or Settings → Notifications (`mutedFollowed`).

### Notes

- Settings schema advanced through **12 → 14** (follow raids, stream languages, muted followed). Older settings migrate with safe defaults.

## [0.2.1] — 2026-08-01

### Added

- About page shows the running app **version** (Tauri `getVersion()` / package version in browser)

### Fixed

- **No audio / mpv speaker “!”**: JSON IPC was sending `mute: "no"` (truthy string → mute on); mute is now a real boolean, with `--mute=no` on the CLI
- **Linked dock minimize sync**: minimizing mpv (or Chatterino) also minimizes the grey grips and the rest of the group, and restore brings everyone back
- Dock window finder still resolves **minimized** mpv/Chatterino windows (iconic rects used to drop them from the group)
- Grey dock borders are **no longer always-on-top** over unrelated apps; they only raise while the dock group is focused (monitor-number overlays still go topmost briefly)

## [0.2.0] — 2026-07-31

### Added

- **Linked dock** (Windows): thin always-on-top grips to resize chat|video and multistream tiles live; center ◀ ▶ handle (or Ctrl+Shift+M) opens Windows-style monitor numbers to pick a display
- Multistream layouts **2+1** and **8×1**, plus **large-pane position** (left / right / top / bottom) for 2+1 and 3+1
- Per-stream **Mute / Unmute** via mpv IPC on the Watching list
- When a stream goes offline: branded loading art and OSD **“The streamer {channel} went offline”**, then the player closes after 5 seconds (manual Stop still closes immediately)
- **Refresh** button on Followed, Top streams, Top games, and Streams in this category

### Changed

- External chat target is **[Chatterino7](https://github.com/SevenTV/chatterino7)** (SevenTV fork): doctor/setup links, install commands, and docs recommend it for 7TV name paints, personal emotes, animated avatars, and 4× 7TV/FFZ images. Stock Chatterino 2 still works if installed
- Seamless off turns linked dock on (and the reverse); chat width is configurable when the dock reserves space for Chatterino7
- Docked mpv uses `--keep-open=yes` so the offline goodbye screen can show before quit

### Fixed

- Multistream tile grey bars move with the streams while resizing (no longer lag until mouse-up)
- Monitor move no longer relies on buggy drag-to-cycle; click the handle and pick a numbered screen
- Chatterino usercards are less likely to sit under the seam grips (temporary seam suppress while popups are focused)

## [0.1.1] — 2026-07-30

### Added

- Startup update check: a banner appears when a new release is available, with download progress; the NSIS installer opens (`basicUi`) and the app relaunches into the new version

### Fixed

- `streamlink:fetch` works on Node 22 + Windows (pipeline hang, bsdtar path parsing)
- Updater manifest uses GitHub's sanitized asset names (spaces → dots) so the download URL no longer 404s

## [0.1.0] — 2026-07-30

First public preview of the Windows rewrite (Tauri 2 + React + TypeScript). The classic NW.js + Ember app was removed; this release replaces it.

### Added

- Desktop shell with tray, single-instance, and `stg://` deep links
- Twitch Device Code login with OS keyring token storage
- Browse: followed streams, top streams, games, search, channel, teams
- Streamlink launch path (bundled / system / custom) with mpv-oriented defaults
- Watching sessions, Streamlink status text, and seamless dual-process channel switch
- **Fast stream start**: pre-launched idle mpv (window in ~0.4 s) attached to Streamlink's loopback HTTP server via IPC; player windows open already snapped to their dock tile
- **Branded loading screen** in the player window with phase-accurate OSD status (resolving, pre-roll ads, errors) instead of mpv's "Drop files" idle screen
- **Multistream page** (sidebar): channel search with followed channels ranked first, quick-add from live followed channels, layout picker with capacity indicator, drag & drop slot ordering, per-slot chat selection; all chats open as Chatterino tabs
- Embedded chat by default; Chatterino / browser options in settings
- Settings schema with import/export, hotkeys, per-channel overrides, notifications
- Boot splash to hide the WebView white flash while the UI loads
- First-run setup wizard (Streamlink → player → optional login) and install help when tools are missing
- Sentry wiring (opt-out) and GitHub Actions release pipeline (NSIS + MSI + updater signatures)
- Auto-generated GitHub release notes on `v*` tags (this file is the curated narrative)

### Changed

- Low latency and ad filtering are **opt-in** (defaults off)
- Default mpv args follow upstream wiki Recommendations (verified against current mpv manual): borderless, maximized, loop for Enter-reload, cache + `demuxer-max-back-bytes=1800M`
- mpv install link uses `https://mpv.io/installation/`
- Player settings: plain-language preset summary, **Reset to recommended**, and toggles for wiki mpv flags; clearer Windows install help (winget / Scoop / portable `.7z`)
- Multistream layout selection moved from Settings to the Multistream page

### Security

- Helix API proxied through Rust — the OAuth token never exists in webview JS
- Bundled Streamlink verified, deep links hardened, iframe sandbox + CSP
- Opt-in scrubbed crash reports, React error boundary, CI gates
- react-router-dom v7 → react-router v8.3.0 (GHSA-qwww-vcr4-c8h2)

### Fixed

- Retry player window retiling until every window is placed
- Partially filled layout presets shrink to the running channel count
- Chatterino closes within a second of stream end (process-handle wait + Streamlink EOF prune) instead of up to 40 s
- App window restores when the last stream ends (minimizeOnWatch)
- Stream lifecycle, dock args, device-flow polling, updater manifest

### Notes

- Windows only for this rewrite
- Chatty is intentionally not supported
- Unsigned installers may show a SmartScreen “Unknown publisher” warning until Authenticode is configured

[Unreleased]: https://github.com/Wibias/streamlink-twitch-gui/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/Wibias/streamlink-twitch-gui/releases/tag/v0.3.0
[0.2.1]: https://github.com/Wibias/streamlink-twitch-gui/releases/tag/v0.2.1
[0.2.0]: https://github.com/Wibias/streamlink-twitch-gui/releases/tag/v0.2.0
[0.1.1]: https://github.com/Wibias/streamlink-twitch-gui/releases/tag/v0.1.1
[0.1.0]: https://github.com/Wibias/streamlink-twitch-gui/releases/tag/v0.1.0
