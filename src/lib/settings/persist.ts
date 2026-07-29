import { load } from "@tauri-apps/plugin-store";
import { isTauri } from "../tauri";
import { migrateSettings } from "./store";
import type { AppSettings } from "./types";
import { defaultSettings } from "./types";

const STORE_PATH = "settings.json";
const KEY = "settings";

let memorySettings: AppSettings | null = null;

export async function loadPersistedSettings(): Promise<AppSettings> {
  if (!isTauri()) {
    return memorySettings ?? defaultSettings();
  }
  try {
    const store = await load(STORE_PATH, { autoSave: false, defaults: {} });
    const raw = await store.get<unknown>(KEY);
    return migrateSettings(raw ?? defaultSettings());
  } catch {
    return defaultSettings();
  }
}

export async function persistSettings(settings: AppSettings): Promise<void> {
  memorySettings = settings;
  if (!isTauri()) {
    return;
  }
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
