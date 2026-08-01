# Followed live notifications — mute list — Design

**Status:** Approved for implementation  
**Date:** 2026-08-01  
**Product:** Streamlink Twitch GUI (Tauri rewrite)

## Goal

Keep desktop notifications when followed channels go live, with:

1. **Global opt-out** — existing `notifications.followedOnline`
2. **Per-channel mute** — skip notifications for specific followed logins

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Model | **B** — `notifications.mutedFollowed: string[]` (lowercase logins) |
| Default | Global on; mute list empty (notify all newly live followed) |
| UI | Channel page toggle + Settings muted list with remove |
| Detection | Existing 60s followed-streams poll in `DesktopChrome` |
| Allow list | Out of scope |

## Settings

- Keep `notifications.followedOnline: boolean` (default `true`).
- Add `notifications.mutedFollowed: string[]` (default `[]`).
- Schema **13 → 14**; migrate missing → `[]`; normalize lowercase, dedupe.

## Behavior

- Global off → no poll / no notifications (unchanged).
- Global on → prime set on first fetch; later newly live logins notify unless in `mutedFollowed`.
- Muting does not affect Followed page listing.

## UI

- **Channel page:** checkbox “Notify when live” — checked when login ∉ muted; writing toggles membership. Hint when global notifications are off.
- **Settings → Notifications:** under the global checkbox, list muted logins with Unmute; empty state muted text.

## Out of scope

- Click-notification to watch
- OS permission settings deep-link
- Notify for non-followed / category alerts
