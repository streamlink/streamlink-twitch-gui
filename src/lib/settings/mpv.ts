import { CHAT_WIDTH_FRACTION } from "../streaming/layout";

/** Wiki-oriented mpv preset toggles (streamlink-twitch-gui Recommendations). */
export interface MpvPresetSettings {
  /** --no-border */
  noBorder: boolean;
  /** --no-keepaspect-window */
  noKeepaspectWindow: boolean;
  /** --window-maximized=yes */
  windowMaximized: boolean;
  /** --loop-playlist=inf --loop-file=inf (Enter reloads) */
  loopReload: boolean;
  /** --cache=yes --demuxer-max-back-bytes=250M */
  cacheRewind: boolean;
}

export const defaultMpvPresets = (): MpvPresetSettings => ({
  noBorder: true,
  noKeepaspectWindow: true,
  windowMaximized: true,
  loopReload: true,
  cacheRewind: true,
});

export const MPV_WINGET = "winget install -e --id shinchiro.mpv";
export const MPV_SCOOP = "scoop install mpv";
export const MPV_PORTABLE_URL =
  "https://github.com/shinchiro/mpv-winbuild-cmake/releases";

/** Build Streamlink --player-args for mpv from toggles + optional extras. */
export function composeMpvPlayerArgs(
  presets: MpvPresetSettings,
  customExtras: string,
  meta: { channel: string; title: string; game: string },
  opts?: {
    sideBySideChat?: boolean;
    /** Full `--geometry=…` flag; overrides maximized / side chat defaults. */
    geometry?: string;
    /** Skip maximized/geometry — OS layout will position after the player is ready. */
    deferLayout?: boolean;
  },
): string {
  const channel = meta.channel || "stream";
  const title = meta.title || channel;
  const game = meta.game || "";
  // Streamlink tokenizes --player-args with shlex — quote values that contain spaces.
  const label = `${channel} - ${game} - ${title}`.replace(/"/g, "");
  const parts: string[] = [
    "--force-window=yes",
    "--keep-open=no",
  ];
  if (presets.noBorder) parts.push("--no-border");
  if (presets.noKeepaspectWindow) parts.push("--no-keepaspect-window");
  if (opts?.geometry) {
    parts.push(opts.geometry);
  } else if (opts?.deferLayout) {
    // Leave positioning to layout_watching (work-area dock).
  } else if (opts?.sideBySideChat) {
    const videoPct = Math.round((1 - CHAT_WIDTH_FRACTION) * 100);
    parts.push(`--geometry=${videoPct}%x100%+0+0`);
  } else if (presets.windowMaximized) {
    parts.push("--window-maximized=yes");
  }
  if (presets.loopReload) {
    parts.push("--loop-playlist=inf");
    parts.push("--loop-file=inf");
  }
  if (presets.cacheRewind) {
    parts.push("--cache=yes");
    parts.push("--demuxer-max-back-bytes=250M");
  }
  parts.push(`--title="${label}"`);
  parts.push(`--force-media-title="${label}"`);
  const extras = customExtras.trim();
  if (extras) parts.push(extras);
  return parts.join(" ");
}

/** Plain-language summary of active recommended flags. */
export function describeMpvPresets(presets: MpvPresetSettings): string[] {
  const items: string[] = [];
  if (presets.noBorder) items.push("borderless window");
  if (presets.noKeepaspectWindow) items.push("letterboxing when resized");
  if (presets.windowMaximized) items.push("start maximized");
  if (presets.loopReload) items.push("Enter reloads the stream");
  if (presets.cacheRewind) items.push("cache + rewind buffer");
  return items;
}
