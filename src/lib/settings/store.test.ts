import { describe, expect, it } from "vitest";
import { defaultSettings, SETTINGS_SCHEMA_VERSION } from "./types";
import { migrateSettings } from "./store";

describe("migrateSettings", () => {
  it("returns defaults for empty input", () => {
    const result = migrateSettings(null);
    expect(result.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(result.chat.provider).toBe("embedded");
    expect(result.streaming.lowLatency).toBe(true);
  });

  it("migrates v1 flat quality/closeToTray fields", () => {
    const result = migrateSettings({
      schemaVersion: 1,
      theme: "light",
      quality: "720p",
      closeToTray: false,
    });
    expect(result.theme).toBe("light");
    expect(result.streaming.quality).toBe("720p");
    expect(result.gui.closeToTray).toBe(false);
    expect(result.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(result.player.id).toBe(defaultSettings().player.id);
  });
});
