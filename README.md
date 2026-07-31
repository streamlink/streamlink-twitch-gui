# Streamlink Twitch GUI (rewrite)

Windows desktop Twitch browser for [Streamlink](https://streamlink.github.io/), rewritten with **Tauri 2 + React + TypeScript**.

Browse live Twitch channels, launch them in your player via Streamlink, and keep chat nearby — without the old NW.js / Ember stack. The previous application lives in [`legacy/`](legacy/) for reference.

Upstream project: [streamlink/streamlink-twitch-gui](https://github.com/streamlink/streamlink-twitch-gui).

## Features (v0.1)

- Twitch login (OAuth **Device Code** flow) with tokens in the OS keyring
- Followed / top streams, games, search, channel pages, teams
- Streamlink launch (bundled in release builds, or system / custom path)
- Watching list with live Streamlink status and seamless channel switching
- Embedded chat (default) or [Chatterino7](https://github.com/SevenTV/chatterino7) / browser
- Settings: quality, low latency, ad filter, player, hotkeys, per-channel overrides, tray
- First-run setup wizard (Streamlink → player → optional login)
- Auto-updater (Tauri) + `stg://` deep links
- Optional Sentry crash reports (opt-out in Settings)

See [CHANGELOG.md](CHANGELOG.md) for release notes.

## Requirements

| Need | Notes |
|------|--------|
| Windows 10/11 | Primary and only supported desktop target for this rewrite |
| [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) | Usually already installed |
| [Node.js](https://nodejs.org/) 20+ | Develop / CI |
| [Rust](https://rustup.rs/) stable | Tauri backend |
| [mpv](https://mpv.io/installation/) (recommended) | **No official Windows installer.** Open PowerShell (Win → type `PowerShell` → Enter), then run `winget install -e --id shinchiro.mpv`. Or Scoop. Or portable: download `mpv-x86_64-….7z` from [shinchiro builds](https://github.com/shinchiro/mpv-winbuild-cmake/releases), extract, point Settings at `mpv.exe` (keep `ffmpeg.exe` / DLLs beside it). |
| Streamlink | Bundled in **release** installers; for local unsigned builds use system install or `npm run streamlink:fetch` |
| [Chatterino7](https://github.com/SevenTV/chatterino7) | Optional external chat (SevenTV fork). Stock Chatterino 2 still launches if found, but **Chatterino7 is recommended** for: **7TV name paints**, **7TV personal emotes**, **7TV animated profile avatars**, and **4× images (7TV and FFZ)**. Install: `winget install -e --id SevenTV.Chatterino7` or [releases](https://github.com/SevenTV/chatterino7/releases/latest). |

## Develop

```bash
npm install
npm run tauri:dev
```

- `npm run tauri:dev` — desktop app (Vite + Tauri). **Use this** for login / Streamlink.
- `npm run dev` — Vite only in a browser; no Tauri APIs.
- `npm test` — unit tests
- `npm run streamlink:fetch` — download a Windows Streamlink build into `src-tauri/resources/streamlink/` (gitignored binaries)

Twitch Client ID for local builds: set `TWITCH_CLIENT_ID` / `VITE_TWITCH_CLIENT_ID`, or rely on the documented env fallback for tryouts. Production releases use your own public Twitch application (Device Code / public client).

## Install (releases)

1. Open [Releases](https://github.com/Wibias/streamlink-twitch-gui/releases).
2. Download the NSIS (`.exe`) or MSI installer.
3. If Windows SmartScreen warns (“Unknown publisher”), that is expected until an Authenticode certificate is configured — choose **More info → Run anyway**, or prefer builds signed with your OV/EV cert (see below).
4. On first launch, complete the setup wizard (Streamlink / player / optional login).

Deep links: `stg://watch/<channel-login>`.

## Release (maintainers)

Version is kept in sync in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json` (currently **0.2.0**).

```bash
git tag v0.2.0
git push origin v0.2.0
```

That runs [`.github/workflows/release.yml`](.github/workflows/release.yml): fetch Streamlink → `tauri build` (NSIS + MSI + updater signatures) → GitHub Release with auto-generated notes. Keep the curated narrative in [CHANGELOG.md](CHANGELOG.md) in sync when you cut a version.

You can also run the workflow manually (**Actions → Release → Run workflow**) for a dry-run; artifacts upload without creating a Release unless the ref is a `v*` tag.

### Required GitHub Actions secrets

| Secret | Purpose |
|--------|---------|
| `TAURI_SIGNING_PRIVATE_KEY` | Contents of `src-tauri/gen/updater.key` (updater signing; **never** commit) |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Password used when generating that key (empty if none) |
| `TWITCH_CLIENT_ID` | Twitch public client id |
| `VITE_TWITCH_CLIENT_ID` | Same value for the Vite frontend |
| `SENTRY_DSN` | Optional; Rust crash reporting |
| `VITE_SENTRY_DSN` | Optional; same DSN for React |

Updater public key lives in `src-tauri/tauri.conf.json` → `plugins.updater.pubkey`.

### Optional: Windows Authenticode (SmartScreen)

SmartScreen warnings go away only with a **real** code-signing certificate (OV/EV from a public CA, or Azure Trusted Signing). Self-signed certs do **not** fix SmartScreen.

When you have a `.pfx`:

1. Encode it: `certutil -encode certificate.pfx base64cert.txt` (use the base64 body as the secret value).
2. Add repo secrets:
   - `WINDOWS_CERTIFICATE` — base64 PFX
   - `WINDOWS_CERTIFICATE_PASSWORD` — PFX password
   - `WINDOWS_CERTIFICATE_THUMBPRINT` — SHA1 thumbprint of the cert (no spaces)
3. Release CI imports the PFX into the runner store and sets Tauri’s `bundle.windows` signing fields for that build only.

Without those secrets, releases still build; installers are simply unsigned.

Timestamp server used when signing: `http://timestamp.digicert.com`.

## License

MIT — see [LICENSE](LICENSE).
