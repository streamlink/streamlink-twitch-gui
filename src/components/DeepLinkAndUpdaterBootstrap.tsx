import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTauri } from "../lib/tauri";
import { useWatchingStore } from "../lib/streaming/store";
import {
  getChannelStreams,
  type HelixStream,
} from "../lib/twitch/helix";

/** Handle `stg://watch/<login>` and `stg://channel/<login>` deep links. */
export function DeepLinkBootstrap({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const watchStream = useWatchingStore((s) => s.watchStream);

  useEffect(() => {
    if (!isTauri()) return;
    let disposed = false;
    let unlisten: (() => void) | undefined;

    void (async () => {
      const { getCurrent, onOpenUrl } = await import(
        "@tauri-apps/plugin-deep-link"
      );

      const handleUrl = async (url: string) => {
        try {
          const parsed = new URL(url);
          const host = parsed.hostname || parsed.host;
          const path = parsed.pathname.replace(/^\/+/, "");
          const login =
            (host === "watch" || host === "channel" ? path : "") ||
            (path.startsWith("watch/") ? path.slice(6) : "") ||
            (path.startsWith("channel/") ? path.slice(8) : "") ||
            path;

          const channel = login.split(/[/?#]/)[0]?.toLowerCase();
          if (!channel) return;

          navigate(`/channel/${channel}`);
          try {
            const page = await getChannelStreams(channel);
            const live = page.data[0] as HelixStream | undefined;
            if (live) {
              await watchStream(live);
              navigate("/watching");
            }
          } catch {
            // Channel page is enough if auth/network fails.
          }
        } catch {
          // ignore malformed urls
        }
      };

      const existing = await getCurrent().catch(() => null);
      if (!disposed && existing?.length) {
        for (const u of existing) {
          void handleUrl(u);
        }
      }

      unlisten = await onOpenUrl((urls) => {
        for (const u of urls) void handleUrl(u);
      });
    })();

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [navigate, watchStream]);

  return children;
}

export function useUpdaterCheck() {
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "none" | "error"
  >("idle");
  const [version, setVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    if (!isTauri()) {
      setStatus("error");
      setError("Desktop app required");
      return;
    }
    setStatus("checking");
    setError(null);
    try {
      const { check: checkUpdate } = await import(
        "@tauri-apps/plugin-updater"
      );
      const update = await checkUpdate();
      if (update) {
        setVersion(update.version);
        setStatus("available");
      } else {
        setStatus("none");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const install = async () => {
    if (!isTauri()) return;
    setStatus("checking");
    try {
      const { check: checkUpdate } = await import(
        "@tauri-apps/plugin-updater"
      );
      const { relaunch } = await import("@tauri-apps/plugin-process");
      const update = await checkUpdate();
      if (!update) {
        setStatus("none");
        return;
      }
      await update.downloadAndInstall();
      await relaunch();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return { status, version, error, check, install };
}
