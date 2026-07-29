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
  const input = raw as Partial<AppSettings> & { schemaVersion?: number };
  const version = input.schemaVersion ?? 0;
  const merged: AppSettings = {
    ...base,
    ...input,
    streamlink: { ...base.streamlink, ...input.streamlink },
    player: { ...base.player, ...input.player },
    chat: { ...base.chat, ...input.chat },
    schemaVersion: SETTINGS_SCHEMA_VERSION,
  };
  // Future migrations: if (version < 2) { ... }
  void version;
  return merged;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings(),
  hydrated: false,
  setSettings: (patch) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...patch,
        streamlink: { ...state.settings.streamlink, ...patch.streamlink },
        player: { ...state.settings.player, ...patch.player },
        chat: { ...state.settings.chat, ...patch.chat },
      },
    })),
  replaceSettings: (next) => set({ settings: migrateSettings(next) }),
  hydrate: (next) => set({ settings: migrateSettings(next), hydrated: true }),
}));
