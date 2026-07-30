export type ThemeMode = "system" | "dark" | "light";

export type StreamlinkSource = "bundled" | "system" | "custom";

export type ChatProvider =
  | "embedded"
  | "chatterino"
  | "browser"
  | "chrome"
  | "custom";

export type PlayerId = "mpv" | "vlc" | "mpc" | "potplayer" | "custom";

/** How Streamlink feeds the player. Passthrough is intentionally omitted. */
export type PlayerInput = "default" | "fifo" | "http";

export interface ChannelOverride {
  quality?: string;
  lowLatency?: boolean;
  disableAds?: boolean;
  playerId?: PlayerId;
  playerCustomArgs?: string;
}

export interface HotkeySettings {
  refresh: string;
  focusSearch: string;
  stopAll: string;
  openSettings: string;
  quit: string;
}

export interface AppSettings {
  schemaVersion: number;
  theme: ThemeMode;
  streamlink: {
    source: StreamlinkSource;
    customPath: string;
  };
  player: {
    id: PlayerId;
    customPath: string;
    customArgs: string;
    input: PlayerInput;
  };
  chat: {
    provider: ChatProvider;
    customPath: string;
    customArgs: string;
  };
  streaming: {
    quality: string;
    lowLatency: boolean;
    disableAds: boolean;
    /** Start the next Streamlink process before stopping the previous one. */
    seamlessSwitch: boolean;
    webbrowser: boolean;
    webbrowserHeadless: boolean;
    webbrowserExecutable: string;
    retryStreams: number;
    retryMax: number;
    playerNoClose: boolean;
  };
  gui: {
    closeToTray: boolean;
    minimizeOnWatch: boolean;
    /** False until the first-run setup wizard is finished or skipped. */
    onboardingDone: boolean;
  };
  notifications: {
    followedOnline: boolean;
  };
  hotkeys: HotkeySettings;
  /** Per-channel launch overrides, keyed by lowercase login. */
  channels: Record<string, ChannelOverride>;
  sentryEnabled: boolean;
  /** @deprecated use streaming.quality */
  quality?: string;
  /** @deprecated use gui.closeToTray */
  closeToTray?: boolean;
}

export const SETTINGS_SCHEMA_VERSION = 6;

export const defaultHotkeys = (): HotkeySettings => ({
  refresh: "F5",
  focusSearch: "Ctrl+K",
  stopAll: "Ctrl+Shift+S",
  openSettings: "Ctrl+,",
  quit: "Ctrl+Q",
});

export const defaultSettings = (): AppSettings => ({
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  theme: "system",
  streamlink: {
    source: "bundled",
    customPath: "",
  },
  player: {
    id: "mpv",
    customPath: "",
    customArgs: "",
    input: "default",
  },
  chat: {
    provider: "embedded",
    customPath: "",
    customArgs: "",
  },
  streaming: {
    quality: "best",
    lowLatency: true,
    disableAds: true,
    seamlessSwitch: true,
    webbrowser: true,
    webbrowserHeadless: true,
    webbrowserExecutable: "",
    retryStreams: 1,
    retryMax: 3,
    playerNoClose: false,
  },
  gui: {
    closeToTray: true,
    minimizeOnWatch: false,
    onboardingDone: false,
  },
  notifications: {
    followedOnline: true,
  },
  hotkeys: defaultHotkeys(),
  channels: {},
  sentryEnabled: true,
});

export function resolveChannelLaunch(
  settings: AppSettings,
  login: string,
): {
  quality: string;
  lowLatency: boolean;
  disableAds: boolean;
  playerId: PlayerId;
  playerCustomArgs: string;
} {
  const override = settings.channels[login.toLowerCase()] ?? {};
  return {
    quality: override.quality || settings.streaming.quality,
    lowLatency: override.lowLatency ?? settings.streaming.lowLatency,
    disableAds: override.disableAds ?? settings.streaming.disableAds,
    playerId: override.playerId ?? settings.player.id,
    playerCustomArgs:
      override.playerCustomArgs ?? settings.player.customArgs,
  };
}
