# Changelog

All notable changes to this Tauri rewrite are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Optional Authenticode-signed installers once a Windows code-signing certificate is available in CI
- Further parity and polish as we dogfood releases

## [0.1.0] — 2026-07-30

First public preview of the Windows rewrite (Tauri 2 + React + TypeScript). The classic NW.js + Ember app remains under `legacy/` for reference only.

### Added

- Desktop shell with tray, single-instance, and `stg://` deep links
- Twitch Device Code login with OS keyring token storage
- Browse: followed streams, top streams, games, search, channel, teams
- Streamlink launch path (bundled / system / custom) with mpv-oriented defaults
- Watching sessions, Streamlink status text, and seamless dual-process channel switch
- Embedded chat by default; Chatterino / browser options in settings
- Settings schema with import/export, hotkeys, per-channel overrides, notifications
- First-run setup wizard (Streamlink → player → optional login) and install help when tools are missing
- Sentry wiring (opt-out) and GitHub Actions release pipeline (NSIS + MSI + updater signatures)
- Auto-generated GitHub release notes on `v*` tags (this file is the curated narrative)

### Notes

- Windows only for this rewrite
- Chatty is intentionally not supported
- Unsigned installers may show a SmartScreen “Unknown publisher” warning until Authenticode is configured

[Unreleased]: https://github.com/Wibias/streamlink-twitch-gui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Wibias/streamlink-twitch-gui/releases/tag/v0.1.0
