import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../lib/settings/store";
import {
  describeViewerPresenceStatus,
  type ViewerPresenceStatus,
} from "../lib/streaming/presence";
import { invoke, isTauri } from "../lib/tauri";

interface ChannelPointsSnapshot {
  channelLogin: string;
  balance: number;
  bonusAvailable: boolean;
  bonusClaimed: boolean;
  claimHttpStatus?: number | null;
  claimError?: string | null;
}

const POINTS_REFRESH_INTERVAL_MS = 15_000;

export function ChannelPointsStatus({ compact = false }: { compact?: boolean }) {
  const enabled = useSettingsStore(
    (state) => state.settings.streaming.channelPoints,
  );
  const [status, setStatus] = useState<ViewerPresenceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<Record<string, ChannelPointsSnapshot>>({});
  const [pointsError, setPointsError] = useState<string | null>(null);
  const lastPointsRefresh = useRef(0);
  const pointsRefreshRunning = useRef(false);

  useEffect(() => {
    if (!enabled || !isTauri()) {
      setStatus(null);
      setError(null);
      setPoints({});
      setPointsError(null);
      lastPointsRefresh.current = 0;
      pointsRefreshRunning.current = false;
      return;
    }

    let active = true;

    const refreshPoints = async (presence: ViewerPresenceStatus) => {
      const logins = [
        ...new Set(
          presence.workers
            .map((worker) => worker.channelLogin.trim().toLowerCase())
            .filter(Boolean),
        ),
      ];
      if (!logins.length) {
        if (active) {
          setPoints({});
          setPointsError(null);
        }
        return;
      }

      const now = Date.now();
      if (
        pointsRefreshRunning.current ||
        now - lastPointsRefresh.current < POINTS_REFRESH_INTERVAL_MS
      ) {
        return;
      }

      lastPointsRefresh.current = now;
      pointsRefreshRunning.current = true;
      try {
        const results = await Promise.allSettled(
          logins.map((channelLogin) =>
            invoke<ChannelPointsSnapshot>("channel_points_refresh", {
              channelLogin,
            }),
          ),
        );
        if (!active) return;

        const failures: string[] = [];
        setPoints((previous) => {
          const next: Record<string, ChannelPointsSnapshot> = {};
          for (const login of logins) {
            if (previous[login]) next[login] = previous[login];
          }
          results.forEach((result, index) => {
            const login = logins[index];
            if (result.status === "fulfilled") {
              next[login] = result.value;
            } else {
              failures.push(
                `${login}: ${
                  result.reason instanceof Error
                    ? result.reason.message
                    : String(result.reason)
                }`,
              );
            }
          });
          return next;
        });
        setPointsError(failures.length ? failures.join(" | ") : null);
      } finally {
        pointsRefreshRunning.current = false;
      }
    };

    const refresh = async () => {
      try {
        const next = await invoke<ViewerPresenceStatus>("viewer_presence_status");
        if (active) {
          setStatus(next);
          setError(null);
        }
        await refreshPoints(next);
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

  const presenceSummary = error
    ? `Channel Points diagnostics failed: ${error}`
    : describeViewerPresenceStatus(status);
  const balanceSummary =
    status?.workers
      .map((worker) => {
        const snapshot = points[worker.channelLogin.toLowerCase()];
        if (!snapshot) return null;
        const claimed = snapshot.bonusClaimed ? " · bonus +50 claimed" : "";
        const claimError = snapshot.claimError
          ? ` · bonus claim failed — ${snapshot.claimError}`
          : "";
        return `${worker.channelLogin}: ${snapshot.balance.toLocaleString()} points${claimed}${claimError}`;
      })
      .filter((value): value is string => Boolean(value)) ?? [];

  const summary = [
    presenceSummary,
    balanceSummary.length ? `Balance: ${balanceSummary.join(" | ")}` : null,
    pointsError ? `Balance check failed: ${pointsError}` : null,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" | ");

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
