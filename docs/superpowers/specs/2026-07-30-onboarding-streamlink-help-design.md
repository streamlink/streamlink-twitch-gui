# First-run setup wizard + Streamlink install help

**Date:** 2026-07-30  
**Status:** Approved  
**Repo:** streamlink-twitch-gui (Tauri rewrite)

## Problem

Users without Streamlink (or a player) only see a bare “not found” line on About, or a raw launch error when watching. There is no first-run onboarding.

## Goals

1. **First-run setup wizard** (3 steps): Streamlink → Player (mpv) → optional Twitch login.
2. **Reusable Streamlink install help** on About/doctor and on watch failure when Streamlink is missing.
3. Persist completion via settings; allow reopening from Settings.

## Non-goals

- Coach-mark product tour
- Auto-download / silent install of Streamlink or mpv
- Forcing login before browse
- Blocking the app forever if tools are missing (Skip / Finish always available)

## Behavior

### Settings flag

- `gui.onboardingDone: boolean` (default `false`), schema bump to **6**.
- Migrate missing field → `false` so existing installs see the wizard once.
- Settings → Interface: “Show setup again” sets `onboardingDone` false and opens the wizard.

### Wizard

- Opens after settings hydrate when `!onboardingDone` (desktop shell only).
- Modal overlay; primary path is Next / Finish; **Skip** marks done and closes.
- Esc does not dismiss until Finish or Skip (avoid accidental dismiss).
- Steps:
  1. **Streamlink** — doctor status + install help if missing + Recheck; note bundled source when configured.
  2. **Player** — mpv status + install link + Recheck.
  3. **Login (optional)** — device-code login CTA or Skip for now → Finish.
- Finish / Skip → `onboardingDone = true` and persist settings.

### Install help (shared component)

- Copy: what Streamlink is, Windows options (`winget install Streamlink.Streamlink`, scoop, official docs).
- Links open via `@tauri-apps/plugin-opener` / existing opener patterns.
- Official install: `https://streamlink.github.io/install.html`
- mpv: `https://mpv.io/installation.html` (or mpv.io)
- Used by: wizard step 1–2, DoctorPanel expansions, watch-error banner.

### Watch failure

- If launch error mentions Streamlink not found / not found, or doctor reports streamlink missing after failure → show install-help panel near the error (Followed / streams grids already surface `launchError`).

## UI

- Match existing modal/dialog styling (dark/light tokens).
- Keep copy English-only via i18n catalogs (`onboarding` + doctor strings).

## Testing

- `migrateSettings` fills `onboardingDone: false` and bumps schema to 6.
- Component/store smoke: completing wizard sets flag (unit test on migrate + flag default).
