import { describe, expect, it } from "vitest";
import { defaultSettings, SETTINGS_SCHEMA_VERSION } from "./types";
import { migrateSettings } from "./store";

describe("migrateSettings", () => {
  it("returns defaults for empty input", () => {
    const result = migrateSettings(null);
    expect(result.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(result.chat.provider).toBe("embedded");
    expect(result.streamlink.source).toBe("bundled");
  });

  it("preserves known fields and bumps schema version", () => {
    const result = migrateSettings({
      schemaVersion: 0,
      theme: "light",
      quality: "720p",
    });
    expect(result.theme).toBe("light");
    expect(result.quality).toBe("720p");
    expect(result.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(result.player.id).toBe(defaultSettings().player.id);
  });
});
