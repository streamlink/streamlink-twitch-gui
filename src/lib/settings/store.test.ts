import { describe, expect, it } from "vitest";
import {
  defaultSettings,
  resolveChannelLaunch,
  SETTINGS_SCHEMA_VERSION,
} from "./types";
import { migrateSettings } from "./store";
import { matchesHotkey, normalizeHotkey } from "../hotkeys";
import { isStreamlinkMissingError } from "../doctor";

describe("migrateSettings", () => {
  it("returns defaults for empty input", () => {
    const result = migrateSettings(null);
    expect(result.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(result.chat.provider).toBe("embedded");
    expect(result.streaming.lowLatency).toBe(true);
    expect(result.streaming.disableAds).toBe(true);
    expect(result.streaming.seamlessSwitch).toBe(true);
    expect(result.gui.onboardingDone).toBe(false);
    expect(result.player.input).toBe("default");
    expect(result.hotkeys.refresh).toBe("F5");
    expect(result.channels).toEqual({});
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
    expect(result.gui.onboardingDone).toBe(false);
    expect(result.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(result.player.id).toBe(defaultSettings().player.id);
  });

  it("fills disableAds, player input, hotkeys when migrating from v2", () => {
    const result = migrateSettings({
      schemaVersion: 2,
      theme: "dark",
      streaming: {
        quality: "best",
        lowLatency: true,
        webbrowser: true,
        webbrowserHeadless: true,
        webbrowserExecutable: "",
        retryStreams: 1,
        retryMax: 3,
        playerNoClose: false,
      },
      player: {
        id: "mpv",
        customPath: "",
        customArgs: "",
      },
    });
    expect(result.streaming.disableAds).toBe(true);
    expect(result.streaming.seamlessSwitch).toBe(true);
    expect(result.player.input).toBe("default");
    expect(result.hotkeys.focusSearch).toBe("Ctrl+K");
    expect(result.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
  });

  it("preserves onboardingDone when already completed", () => {
    const result = migrateSettings({
      schemaVersion: 5,
      gui: { closeToTray: true, minimizeOnWatch: false, onboardingDone: true },
    });
    expect(result.gui.onboardingDone).toBe(true);
  });
});

describe("resolveChannelLaunch", () => {
  it("applies per-channel quality override", () => {
    const settings = defaultSettings();
    settings.channels.forsen = { quality: "720p" };
    const launch = resolveChannelLaunch(settings, "Forsen");
    expect(launch.quality).toBe("720p");
    expect(launch.playerId).toBe("mpv");
  });
});

describe("hotkeys", () => {
  it("normalizes ctrl combinations", () => {
    expect(normalizeHotkey("ctrl+k")).toBe("Ctrl+K");
    expect(normalizeHotkey("Control+Shift+s")).toBe("Ctrl+Shift+S");
  });

  it("matches event-like payloads", () => {
    const event = {
      key: "k",
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
    } as KeyboardEvent;
    expect(matchesHotkey(event, "Ctrl+K")).toBe(true);
    expect(matchesHotkey(event, "F5")).toBe(false);
  });
});

describe("isStreamlinkMissingError", () => {
  it("detects Streamlink not-found messages", () => {
    expect(isStreamlinkMissingError("Streamlink executable not found")).toBe(
      true,
    );
    expect(isStreamlinkMissingError("player mpv not found")).toBe(false);
    expect(isStreamlinkMissingError(null)).toBe(false);
  });
});
