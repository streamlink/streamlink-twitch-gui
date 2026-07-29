import { load } from "@tauri-apps/plugin-store";
import { migrateSettings } from "./store";
import type { AppSettings } from "./types";
import { defaultSettings } from "./types";

const STORE_PATH = "settings.json";
const KEY = "settings";

export async function loadPersistedSettings(): Promise<AppSettings> {
  try {
    const store = await load(STORE_PATH, { autoSave: false, defaults: {} });
    const raw = await store.get<unknown>(KEY);
    return migrateSettings(raw ?? defaultSettings());
  } catch {
    return defaultSettings();
  }
}

export async function persistSettings(settings: AppSettings): Promise<void> {
  const store = await load(STORE_PATH, { autoSave: true, defaults: {} });
  await store.set(KEY, settings);
  await store.save();
}

export function exportSettingsJson(settings: AppSettings): string {
  return JSON.stringify(settings, null, 2);
}

export function importSettingsJson(text: string): AppSettings {
  return migrateSettings(JSON.parse(text) as unknown);
}
