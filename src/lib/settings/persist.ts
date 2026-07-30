import { load, type Store } from "@tauri-apps/plugin-store";
import { isTauri } from "../tauri";
import { migrateSettings } from "./store";
import type { AppSettings } from "./types";
import { defaultSettings } from "./types";

const STORE_PATH = "settings.json";
const KEY = "settings";

let memorySettings: AppSettings | null = null;
// Cache the store handle: `load()` re-opens the file every call.
let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = load(STORE_PATH, { autoSave: false, defaults: {} });
  }
  return storePromise;
}

export async function loadPersistedSettings(): Promise<AppSettings> {
  if (!isTauri()) {
    return memorySettings ?? defaultSettings();
  }
  try {
    const store = await getStore();
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
  const store = await getStore();
  await store.set(KEY, settings);
  await store.save();
}

export function exportSettingsJson(settings: AppSettings): string {
  return JSON.stringify(settings, null, 2);
}

export function importSettingsJson(text: string): AppSettings {
  return migrateSettings(JSON.parse(text) as unknown);
}
