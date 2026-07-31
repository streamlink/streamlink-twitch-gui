import {
  composeMpvPlayerArgs,
  defaultMpvPresets,
  type MpvPresetSettings,
} from "./mpv";
import {
  DEFAULT_MULTISTREAM_LAYOUT,
  DEFAULT_UNEVEN_MAIN_SIDE,
  isMultistreamLayout,
  isUnevenMainSide,
  type MultistreamLayout,
  type UnevenMainSide,
} from "../streaming/layout";

export type { MpvPresetSettings } from "./mpv";
export type { MultistreamLayout } from "../streaming/layout";
export type { UnevenMainSide } from "../streaming/layout";

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
  /** Move linked dock (mpv + Chatterino) to the next monitor. */
  cycleDockMonitor: string;
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
    /** Extra player args appended after mpv presets (or full args for non-mpv). */
    customArgs: string;
    input: PlayerInput;
    mpv: MpvPresetSettings;
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
    /** Multistream grid when seamlessSwitch is off. */
    multistreamLayout: MultistreamLayout;
    /**
     * Where the large pane sits for 2+1 / 3+1 layouts.
     */
    unevenMainSide: UnevenMainSide;
    /**
     * When true (default), show grips to resize chat↔video / tiles and move
     * the dock between monitors. Opt-out.
     */
    linkedDock: boolean;
    /** Fraction of work-area width reserved for Chatterino (0.12–0.45). */
    chatWidthFraction: number;
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
    /** Allow stg://watch/<login> deep links to start streams (off = navigate only). */
    deepLinkAutoWatch: boolean;
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

export const SETTINGS_SCHEMA_VERSION = 11;

export const defaultHotkeys = (): HotkeySettings => ({
  refresh: "F5",
  focusSearch: "Ctrl+K",
  stopAll: "Ctrl+Shift+S",
  openSettings: "Ctrl+,",
  quit: "Ctrl+Q",
  cycleDockMonitor: "Ctrl+Shift+M",
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
    mpv: defaultMpvPresets(),
  },
  chat: {
    provider: "embedded",
    customPath: "",
    customArgs: "",
  },
  streaming: {
    quality: "best",
    lowLatency: false,
    disableAds: false,
    seamlessSwitch: true,
    multistreamLayout: DEFAULT_MULTISTREAM_LAYOUT,
    unevenMainSide: DEFAULT_UNEVEN_MAIN_SIDE,
    // Mutually exclusive with seamlessSwitch (default single-stream).
    linkedDock: false,
    chatWidthFraction: 0.18,
    webbrowser: false,
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
    deepLinkAutoWatch: false,
  },
  notifications: {
    followedOnline: true,
  },
  hotkeys: defaultHotkeys(),
  channels: {},
  // Crash reports are opt-IN: the onboarding wizard and Settings offer the
  // toggle, but nothing is sent until the user explicitly enables it.
  sentryEnabled: false,
});

export function resolveChannelLaunch(
  settings: AppSettings,
  login: string,
  meta?: { title?: string; game?: string },
  opts?: { geometry?: string; sideBySideChat?: boolean; deferLayout?: boolean },
): {
  quality: string;
  lowLatency: boolean;
  disableAds: boolean;
  playerId: PlayerId;
  playerCustomArgs: string;
} {
  const override = settings.channels[login.toLowerCase()] ?? {};
  const playerId = override.playerId ?? settings.player.id;
  const channel = login.toLowerCase();
  const title = meta?.title || channel;
  const game = meta?.game || "";
  const sideBySideChat =
    opts?.sideBySideChat ?? settings.chat.provider === "chatterino";
  const playerCustomArgs =
    override.playerCustomArgs ??
    (playerId === "mpv"
      ? composeMpvPlayerArgs(
          settings.player.mpv,
          settings.player.customArgs,
          {
            channel,
            title,
            game,
          },
          {
            sideBySideChat,
            geometry: opts?.geometry,
            deferLayout: opts?.deferLayout,
          },
        )
      : settings.player.customArgs);
  return {
    quality: override.quality || settings.streaming.quality,
    lowLatency: override.lowLatency ?? settings.streaming.lowLatency,
    disableAds: override.disableAds ?? settings.streaming.disableAds,
    playerId,
    playerCustomArgs,
  };
}
