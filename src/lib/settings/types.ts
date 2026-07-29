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
  quality: string;
  sentryEnabled: boolean;
  closeToTray: boolean;
}

export const SETTINGS_SCHEMA_VERSION = 1;

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
  },
  chat: {
    provider: "embedded",
    customPath: "",
    customArgs: "",
  },
  quality: "best",
  sentryEnabled: true,
  closeToTray: true,
});
