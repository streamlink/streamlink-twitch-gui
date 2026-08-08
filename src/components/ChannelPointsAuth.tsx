import { useEffect, useRef, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { invoke, isTauri } from "../lib/tauri";

interface ChannelPointsAuthStatus {
  configured: boolean;
  login?: string | null;
  userId?: string | null;
}

interface TvDeviceCodeResponse {
  deviceCode: string;
  expiresIn: number;
  interval: number;
  userCode: string;
  verificationUri: string;
}

type TvDevicePoll =
  | { state: "pending" }
  | { state: "slowDown" }
  | { state: "done"; status: ChannelPointsAuthStatus };

export function ChannelPointsAuth({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<ChannelPointsAuthStatus | null>(null);
  const [device, setDevice] = useState<TvDeviceCodeResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearPoll() {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }

  useEffect(() => {
    if (!isTauri()) return;
    let alive = true;
    void invoke<ChannelPointsAuthStatus>("channel_points_auth_status")
      .then((next) => {
        if (alive) setStatus(next);
      })
      .catch((reason: unknown) => {
        if (alive) setError(reason instanceof Error ? reason.message : String(reason));
      });
    return () => {
      alive = false;
      clearPoll();
    };
  }, []);

  async function startLogin() {
    if (busy || !isTauri()) return;
    clearPoll();
    setBusy(true);
    setError(null);
    try {
      const next = await invoke<TvDeviceCodeResponse>("channel_points_auth_start_device_login");
      setDevice(next);
      await openUrl(next.verificationUri);

      let intervalMs = Math.max(next.interval, 1) * 1000;
      const poll = async () => {
        try {
          const result = await invoke<TvDevicePoll>("channel_points_auth_poll_device_login", {
            deviceCode: next.deviceCode,
          });
          if (result.state === "done") {
            clearPoll();
            setStatus(result.status);
            setDevice(null);
            setBusy(false);
            void import("../lib/streaming/store").then(({ syncViewerPresence }) => {
              syncViewerPresence(true);
            });
            return;
          }
          if (result.state === "slowDown") {
            intervalMs = Math.min(intervalMs + 5000, 30_000);
          }
          pollTimer.current = setTimeout(() => void poll(), intervalMs);
        } catch (reason) {
          clearPoll();
          setDevice(null);
          setBusy(false);
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      };
      pollTimer.current = setTimeout(() => void poll(), intervalMs);
    } catch (reason) {
      setBusy(false);
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }

  async function disconnect() {
    if (busy || !isTauri()) return;
    clearPoll();
    setBusy(true);
    setError(null);
    try {
      const next = await invoke<ChannelPointsAuthStatus>("channel_points_auth_clear");
      setStatus(next);
      setDevice(null);
      void import("../lib/streaming/store").then(({ syncViewerPresence }) => {
        syncViewerPresence(true);
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  const connected = Boolean(status?.configured);

  return (
    <div className={`authbar__playback${compact ? " authbar__playback--compact" : ""}`}>
      {device ? (
        <div className="authbar__playback-panel">
          <strong>Channel Points TV login</strong>
          <p className="muted">Enter this code on Twitch:</p>
          <code className="authbar__code">{device.userCode}</code>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              clearPoll();
              setDevice(null);
              setBusy(false);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="button-secondary authbar__playback-toggle"
          disabled={busy}
          onClick={() => void (connected ? disconnect() : startLogin())}
          title={
            connected
              ? `Channel Points TV session connected as ${status?.login ?? "current account"}`
              : "Connect a dedicated Twitch TV session for Channel Points"
          }
        >
          <span
            className={`authbar__playback-dot${connected ? " authbar__playback-dot--connected" : ""}`}
            aria-hidden="true"
          />
          {busy
            ? "Channel Points…"
            : connected
              ? `Channel Points TV: ${status?.login ?? "connected"}`
              : "Connect Channel Points TV"}
        </button>
      )}
      {error ? <p className="authbar__error">{error}</p> : null}
    </div>
  );
}
