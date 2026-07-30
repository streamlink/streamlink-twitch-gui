export interface ToolStatus {
  found: boolean;
  path?: string | null;
  version?: string | null;
  source?: string | null;
}

export interface DoctorReport {
  streamlink: ToolStatus;
  mpv: ToolStatus;
  chatterino: ToolStatus;
  minStreamlinkVersion: string;
}

export function isStreamlinkMissingError(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("streamlink") &&
    (lower.includes("not found") ||
      lower.includes("missing") ||
      lower.includes("no such file"))
  );
}

export const STREAMLINK_INSTALL_URL =
  "https://streamlink.github.io/install.html";
export const MPV_INSTALL_URL = "https://mpv.io/installation/";
export {
  MPV_WINGET,
  MPV_SCOOP,
  MPV_PORTABLE_URL,
} from "./settings/mpv";
export const STREAMLINK_WINGET = "winget install Streamlink.Streamlink";
export const STREAMLINK_SCOOP = "scoop install streamlink";
export const CHATTERINO_INSTALL_URL = "https://chatterino.com/";
export const CHATTERINO_WINGET =
  "winget install -e --id ChatterinoTeam.Chatterino";
export const CHATTERINO_SCOOP = "scoop install chatterino";
