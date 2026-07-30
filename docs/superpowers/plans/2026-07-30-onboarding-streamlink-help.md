# Onboarding Wizard + Streamlink Help Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3-step first-run setup wizard and reusable Streamlink/player install help on About and watch failure.

**Architecture:** Persist `gui.onboardingDone` in settings. Shared `SetupHelp` / doctor UI for install copy. Wizard modal mounts after settings hydrate. Watch errors detect missing Streamlink and reuse the same help.

**Tech Stack:** React, Zustand settings store, existing `get_doctor_report`, Tauri opener, i18n en catalogs.

## Global Constraints

- Windows-only Tauri app; English i18n only
- No auto-download of Streamlink/mpv
- Skip/Finish always available; do not hard-block the app

## File map

| File | Role |
|------|------|
| `src/lib/settings/types.ts` | `gui.onboardingDone`, schema v6 |
| `src/lib/settings/store.ts` + `store.test.ts` | migrate defaults |
| `src/components/SetupHelp.tsx` (+ css) | Shared Streamlink/mpv install help |
| `src/components/DoctorPanel.tsx` | Expand missing tools with SetupHelp |
| `src/components/OnboardingWizard.tsx` (+ css) | 3-step modal |
| `src/App.tsx` / bootstrap | Show wizard when needed |
| `src/pages/SettingsPage.tsx` | “Show setup again” |
| `src/pages/BrowsePages.tsx` | Watch-error help |
| `src/locales/en/*.json` | Copy |

---

### Task 1: Settings flag + tests

- [x] Add `onboardingDone: false` to `gui`, bump `SETTINGS_SCHEMA_VERSION` to 6
- [x] Migrate missing → false
- [x] Update `store.test.ts`
- [x] Run `npm test`

### Task 2: Shared SetupHelp + DoctorPanel

- [x] Create `SetupHelp` for streamlink / mpv with links + optional Recheck
- [x] Wire DoctorPanel to show help when missing
- [x] Add locale strings

### Task 3: Onboarding wizard

- [x] Build modal with 3 steps, doctor refresh, login CTA, Skip/Finish
- [x] Mount after hydrate when `!onboardingDone`
- [x] Settings “Show setup again”

### Task 4: Watch-failure help

- [x] Detect Streamlink-missing launch errors; render SetupHelp under launch error

### Task 5: Verify

- [x] `npm test` + `npx tsc --noEmit`
- [ ] Manual: first launch wizard; skip; show again; missing Streamlink copy
