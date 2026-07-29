import { create } from "zustand";
import {
  type AppSettings,
  defaultSettings,
  SETTINGS_SCHEMA_VERSION,
} from "./types";

interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
  setSettings: (patch: Partial<AppSettings>) => void;
  replaceSettings: (next: AppSettings) => void;
  hydrate: (next: AppSettings) => void;
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

  const merged: AppSettings = {
    ...base,
    ...input,
    streamlink: { ...base.streamlink, ...input.streamlink },
    player: { ...base.player, ...input.player },
    chat: { ...base.chat, ...input.chat },
    streaming: {
      ...base.streaming,
      ...input.streaming,
      quality: input.streaming?.quality ?? input.quality ?? base.streaming.quality,
    },
    gui: {
      ...base.gui,
      ...input.gui,
      closeToTray:
        input.gui?.closeToTray ?? input.closeToTray ?? base.gui.closeToTray,
    },
    notifications: { ...base.notifications, ...input.notifications },
    schemaVersion: SETTINGS_SCHEMA_VERSION,
  };

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
        player: { ...state.settings.player, ...patch.player },
        chat: { ...state.settings.chat, ...patch.chat },
        streaming: { ...state.settings.streaming, ...patch.streaming },
        gui: { ...state.settings.gui, ...patch.gui },
        notifications: {
          ...state.settings.notifications,
          ...patch.notifications,
        },
      }),
    })),
  replaceSettings: (next) => set({ settings: migrateSettings(next) }),
  hydrate: (next) => set({ settings: migrateSettings(next), hydrated: true }),
}));
