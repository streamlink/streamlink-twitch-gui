import { describe, expect, it } from "vitest";
import {
  defaultSettings,
  resolveChannelLaunch,
  SETTINGS_SCHEMA_VERSION,
} from "./types";
import { migrateSettings } from "./store";
import {
  composeMpvPlayerArgs,
  defaultMpvPresets,
} from "./mpv";
import { matchesHotkey, normalizeHotkey } from "../hotkeys";
import { isStreamlinkMissingError } from "../doctor";

describe("migrateSettings", () => {
  it("returns defaults for empty input", () => {
    const result = migrateSettings(null);
    expect(result.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(result.chat.provider).toBe("embedded");
    expect(result.streaming.multistreamLayout).toBe("2x2");
    expect(result.streaming.linkedDock).toBe(false);
    expect(result.streaming.chatWidthFraction).toBe(0.18);
    expect(result.streaming.lowLatency).toBe(false);
    expect(result.streaming.disableAds).toBe(false);
    expect(result.streaming.seamlessSwitch).toBe(true);
    expect(result.streaming.followRaids).toBe(true);
    expect(result.streaming.streamLanguages).toEqual([]);
    expect(result.gui.onboardingDone).toBe(false);
    expect(result.player.input).toBe("default");
    expect(result.player.mpv).toEqual(defaultMpvPresets());
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
    expect(result.player.mpv.cacheRewind).toBe(true);
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
    expect(result.streaming.disableAds).toBe(false);
    expect(result.streaming.seamlessSwitch).toBe(true);
    expect(result.streaming.webbrowser).toBe(false);
    expect(result.player.input).toBe("default");
    expect(result.player.mpv.noBorder).toBe(true);
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

  it("normalizes streamLanguages and defaults missing to empty", () => {
    const empty = migrateSettings({ schemaVersion: 12, streaming: {} });
    expect(empty.streaming.streamLanguages).toEqual([]);
    const kept = migrateSettings({
      schemaVersion: 12,
      streaming: { streamLanguages: ["EN", " de ", "en", "bad!", "pt-br", "other"] },
    });
    expect(kept.streaming.streamLanguages).toEqual(["en", "de", "other"]);
  });

  it("normalizes mutedFollowed and defaults missing to empty", () => {
    const empty = migrateSettings({
      schemaVersion: 13,
      notifications: { followedOnline: true },
    });
    expect(empty.notifications.mutedFollowed).toEqual([]);
    const kept = migrateSettings({
      schemaVersion: 13,
      notifications: {
        followedOnline: true,
        mutedFollowed: ["Forsen", " forsen ", "xqc", ""],
      },
    });
    expect(kept.notifications.mutedFollowed).toEqual(["forsen", "xqc"]);
  });

  it("turns off webbrowser when migrating from schema < 8", () => {
    const result = migrateSettings({
      schemaVersion: 7,
      streaming: {
        ...defaultSettings().streaming,
        webbrowser: true,
      },
    });
    expect(result.streaming.webbrowser).toBe(false);
  });
});

describe("composeMpvPlayerArgs", () => {
  it("includes recommended flags and appends extras", () => {
    const args = composeMpvPlayerArgs(defaultMpvPresets(), "--vo=gpu", {
      channel: "forsen",
      title: "hello",
      game: "Minecraft",
    });
    expect(args).toContain("--no-border");
    expect(args).toContain("--window-maximized=yes");
    expect(args).toContain("--demuxer-max-back-bytes=250M");
    expect(args).toContain("--vo=gpu");
    expect(args).toContain('--title="forsen - Minecraft - hello"');
  });

  it("uses side geometry instead of maximized for Chatterino layout", () => {
    const args = composeMpvPlayerArgs(
      defaultMpvPresets(),
      "",
      { channel: "forsen", title: "Live", game: "Variety" },
      { sideBySideChat: true },
    );
    expect(args).toContain("--geometry=82%x100%+0+0");
    expect(args).not.toContain("--window-maximized=yes");
  });
});

describe("resolveChannelLaunch", () => {
  it("applies per-channel quality override and composes mpv args", () => {
    const settings = defaultSettings();
    settings.channels.forsen = { quality: "720p" };
    const launch = resolveChannelLaunch(settings, "Forsen", {
      title: "Live",
      game: "Variety",
    });
    expect(launch.quality).toBe("720p");
    expect(launch.playerId).toBe("mpv");
    expect(launch.playerCustomArgs).toContain("--no-border");
    expect(launch.playerCustomArgs).toContain("forsen - Variety - Live");
  });

  it("composes side-by-side mpv geometry when chat is Chatterino", () => {
    const settings = defaultSettings();
    settings.chat.provider = "chatterino";
    const launch = resolveChannelLaunch(settings, "forsen");
    expect(launch.playerCustomArgs).toContain("--geometry=82%x100%+0+0");
    expect(launch.playerCustomArgs).not.toContain("--window-maximized=yes");
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
