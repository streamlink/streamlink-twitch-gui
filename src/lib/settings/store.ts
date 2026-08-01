import { create } from "zustand";
import {
  type AppSettings,
  defaultHotkeys,
  defaultSettings,
  SETTINGS_SCHEMA_VERSION,
} from "./types";
import {
  DEFAULT_MULTISTREAM_LAYOUT,
  DEFAULT_UNEVEN_MAIN_SIDE,
  isMultistreamLayout,
  isUnevenMainSide,
} from "../streaming/layout";

interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
  setSettings: (patch: Partial<AppSettings>) => void;
  replaceSettings: (next: AppSettings) => void;
  hydrate: (next: AppSettings) => void;
  setChannelOverride: (
    login: string,
    patch: Partial<AppSettings["channels"][string]> | null,
  ) => void;
}

/** Migrate older settings blobs toward the current schema. */
export function migrateSettings(raw: unknown): AppSettings {
  const base = defaultSettings();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const input = raw as Partial<AppSettings> & {
    schemaVersion?: number;
    quality?: string;
    closeToTray?: boolean;
  };
  const prevSchema = input.schemaVersion ?? 0;

  const merged: AppSettings = {
    ...base,
    ...input,
    streamlink: { ...base.streamlink, ...input.streamlink },
    player: {
      ...base.player,
      ...input.player,
      input: input.player?.input ?? base.player.input,
      mpv: { ...base.player.mpv, ...input.player?.mpv },
    },
    chat: { ...base.chat, ...input.chat },
    streaming: {
      ...base.streaming,
      ...input.streaming,
      quality: input.streaming?.quality ?? input.quality ?? base.streaming.quality,
      disableAds: input.streaming?.disableAds ?? base.streaming.disableAds,
      seamlessSwitch:
        input.streaming?.seamlessSwitch ?? base.streaming.seamlessSwitch,
      multistreamLayout: (() => {
        const raw = input.streaming?.multistreamLayout;
        return raw && isMultistreamLayout(raw)
          ? raw
          : DEFAULT_MULTISTREAM_LAYOUT;
      })(),
      unevenMainSide: (() => {
        const raw = input.streaming?.unevenMainSide;
        return raw && isUnevenMainSide(raw) ? raw : DEFAULT_UNEVEN_MAIN_SIDE;
      })(),
      linkedDock: input.streaming?.linkedDock ?? base.streaming.linkedDock,
      followRaids: input.streaming?.followRaids ?? base.streaming.followRaids,
      chatWidthFraction: (() => {
        const f = input.streaming?.chatWidthFraction;
        if (typeof f !== "number" || Number.isNaN(f)) {
          return base.streaming.chatWidthFraction;
        }
        return Math.min(0.45, Math.max(0.12, f));
      })(),
    },
    gui: {
      ...base.gui,
      ...input.gui,
      closeToTray:
        input.gui?.closeToTray ?? input.closeToTray ?? base.gui.closeToTray,
      onboardingDone: input.gui?.onboardingDone ?? base.gui.onboardingDone,
    },
    notifications: { ...base.notifications, ...input.notifications },
    hotkeys: { ...defaultHotkeys(), ...input.hotkeys },
    channels: { ...base.channels, ...input.channels },
    schemaVersion: SETTINGS_SCHEMA_VERSION,
  };

  // Seamless and linked dock cannot both be on.
  if (merged.streaming.seamlessSwitch && merged.streaming.linkedDock) {
    merged.streaming.linkedDock = false;
  }

  // v8: webbrowser default flipped off — it made first stream starts very slow.
  if (prevSchema < 8) {
    merged.streaming.webbrowser = false;
  }

  delete (merged as { quality?: string }).quality;
  delete (merged as { closeToTray?: boolean }).closeToTray;
  return merged;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings(),
  hydrated: false,
  setSettings: (patch) =>
    set((state) => ({
      settings: migrateSettings({
        ...state.settings,
        ...patch,
        streamlink: { ...state.settings.streamlink, ...patch.streamlink },
        player: {
          ...state.settings.player,
          ...patch.player,
          mpv: {
            ...state.settings.player.mpv,
            ...patch.player?.mpv,
          },
        },
        chat: { ...state.settings.chat, ...patch.chat },
        streaming: { ...state.settings.streaming, ...patch.streaming },
        gui: { ...state.settings.gui, ...patch.gui },
        notifications: {
          ...state.settings.notifications,
          ...patch.notifications,
        },
        hotkeys: { ...state.settings.hotkeys, ...patch.hotkeys },
        channels: patch.channels
          ? { ...state.settings.channels, ...patch.channels }
          : state.settings.channels,
      }),
    })),
  replaceSettings: (next) => set({ settings: migrateSettings(next) }),
  hydrate: (next) => set({ settings: migrateSettings(next), hydrated: true }),
  setChannelOverride: (login, patch) =>
    set((state) => {
      const key = login.trim().toLowerCase();
      if (!key) return state;
      const channels = { ...state.settings.channels };
      if (patch === null) {
        delete channels[key];
      } else {
        channels[key] = { ...channels[key], ...patch };
      }
      return {
        settings: migrateSettings({ ...state.settings, channels }),
      };
    }),
}));
