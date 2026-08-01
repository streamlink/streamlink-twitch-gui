# Teams Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `/teams` search page + nav link; remove `teamStub`.

**Architecture:** Thin search page calls `getTeamByName`, navigates to existing `TeamPage`.

**Spec:** `docs/superpowers/specs/2026-08-01-teams-search-design.md`

## Tasks

### Task 1: TeamsSearchPage + route + nav

- [ ] Add `TeamsSearchPage` in `BrowseExtraPages.tsx` (or small dedicated file).
- [ ] Route `/teams` in `App.tsx`; nav link + locales; delete `teamStub`.
- [ ] Changelog; `npm test` / `npm run build`.
- [ ] Commit: `feat(ui): teams search browse page`
