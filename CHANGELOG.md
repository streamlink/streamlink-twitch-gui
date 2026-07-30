# Changelog

All notable changes to this Tauri rewrite are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `streamlink:fetch` works on Node 22 + Windows (pipeline hang, bsdtar path parsing)
- Updater manifest uses GitHub's sanitized asset names (spaces → dots) so the download URL no longer 404s

### Planned

- Optional Authenticode-signed installers once a Windows code-signing certificate is available in CI
- Further parity and polish as we dogfood releases

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

[Unreleased]: https://github.com/Wibias/streamlink-twitch-gui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Wibias/streamlink-twitch-gui/releases/tag/v0.1.0
