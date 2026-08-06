import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  clearTwitchWebsiteAuth,
  completeWebsiteAuthSave,
  getTwitchWebsiteAuthStatus,
  saveTwitchWebsiteAuth,
  websiteAuthLabel,
  type TwitchWebsiteAuthStatus,
} from "../lib/auth/website";

export function TwitchWebsiteAuth({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation("common");
  const [status, setStatus] = useState<TwitchWebsiteAuthStatus | null>(null);
  const [token, setToken] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void getTwitchWebsiteAuthStatus()
      .then((next) => {
        if (alive) setStatus(next);
      })
      .catch((reason: unknown) => {
        if (alive) {
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  async function save() {
    if (!token.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await saveTwitchWebsiteAuth(token);
      const completed = completeWebsiteAuthSave(token, next);
      setToken(completed.token);
      setStatus(completed.status);
      void import("../lib/streaming/store").then(({ syncViewerPresence }) => {
        syncViewerPresence(true);
      });
      setExpanded(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await clearTwitchWebsiteAuth();
      setToken("");
      setStatus(next);
      setExpanded(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  const connected = Boolean(status?.configured && status.streamlinkConfigured);
  const label = status
    ? websiteAuthLabel(status)
    : t("playbackAuthChecking");

  return (
    <div
      className={`authbar__playback${compact ? " authbar__playback--compact" : ""}`}
    >
      <button
        type="button"
        className="button-secondary authbar__playback-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span
          className={`authbar__playback-dot${connected ? " authbar__playback-dot--connected" : ""}`}
          aria-hidden="true"
        />
        {connected ? t("playbackAuthConnected") : t("playbackAuthSetup")}
      </button>

      {expanded ? (
        <div className="authbar__playback-panel">
          <strong>{t("playbackAuthTitle")}</strong>
          <p className="muted">{label}</p>

          {connected ? (
            <>
              <p className="muted">
                {t("playbackAuthConnectedHint", {
                  login: status?.login ?? t("playbackAuthCurrentAccount"),
                })}
              </p>
              <button
                type="button"
                className="button-secondary"
                disabled={busy}
                onClick={() => void disconnect()}
              >
                {busy ? t("playbackAuthRemoving") : t("playbackAuthRemove")}
              </button>
            </>
          ) : (
            <>
              <p className="muted">{t("playbackAuthExplanation")}</p>
              <p className="authbar__playback-warning">
                {t("playbackAuthWarning")}
              </p>
              <label className="authbar__playback-field">
                <span>{t("playbackAuthToken")}</span>
                <input
                  className="input"
                  type="password"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void save();
                    }
                  }}
                />
              </label>
              <button
                type="button"
                disabled={busy || !token.trim()}
                onClick={() => void save()}
              >
                {busy ? t("playbackAuthSaving") : t("playbackAuthSave")}
              </button>
            </>
          )}

          {status?.configPath ? (
            <small className="muted authbar__playback-path">
              {t("playbackAuthConfigPath", { path: status.configPath })}
            </small>
          ) : null}
          {error ? <p className="authbar__error">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
