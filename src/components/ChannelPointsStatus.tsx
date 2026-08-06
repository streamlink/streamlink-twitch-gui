import { useEffect, useState } from "react";
import { useSettingsStore } from "../lib/settings/store";
import {
  describeViewerPresenceStatus,
  type ViewerPresenceStatus,
} from "../lib/streaming/presence";
import { invoke, isTauri } from "../lib/tauri";

export function ChannelPointsStatus({ compact = false }: { compact?: boolean }) {
  const enabled = useSettingsStore(
    (state) => state.settings.streaming.channelPoints,
  );
  const [status, setStatus] = useState<ViewerPresenceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !isTauri()) {
      setStatus(null);
      setError(null);
      return;
    }

    let active = true;
    const refresh = async () => {
      try {
        const next = await invoke<ViewerPresenceStatus>("viewer_presence_status");
        if (active) {
          setStatus(next);
          setError(null);
        }
      } catch (reason) {
        if (active) {
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      }
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), 3_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [enabled]);

  if (!enabled) return null;

  const summary = error
    ? `Channel Points diagnostics failed: ${error}`
    : describeViewerPresenceStatus(status);

  return (
    <div
      className={`authbar__playback${compact ? " authbar__playback--compact" : ""}`}
      title={summary}
    >
      <small className={error ? "authbar__error" : "muted"}>
        Channel Points: {summary}
      </small>
    </div>
  );
}
