export type ThemeMode = "system" | "dark" | "light";

export type StreamlinkSource = "bundled" | "system" | "custom";

export type ChatProvider =
  | "embedded"
  | "chatterino"
  | "browser"
  | "chrome"
  | "custom";

export type PlayerId = "mpv" | "vlc" | "mpc" | "potplayer" | "custom";

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
  };
  chat: {
    provider: ChatProvider;
    customPath: string;
    customArgs: string;
  };
  streaming: {
    quality: string;
    lowLatency: boolean;
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
  };
  notifications: {
    followedOnline: boolean;
  };
  sentryEnabled: boolean;
  /** @deprecated use streaming.quality */
  quality?: string;
  /** @deprecated use gui.closeToTray */
  closeToTray?: boolean;
}

export const SETTINGS_SCHEMA_VERSION = 2;

export const defaultSettings = (): AppSettings => ({
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  theme: "system",
  streamlink: {
    source: "system",
    customPath: "",
  },
  player: {
    id: "mpv",
    customPath: "",
    customArgs: "",
  },
  chat: {
    provider: "embedded",
    customPath: "",
    customArgs: "",
  },
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
  gui: {
    closeToTray: true,
    minimizeOnWatch: false,
  },
  notifications: {
    followedOnline: true,
  },
  sentryEnabled: true,
});
