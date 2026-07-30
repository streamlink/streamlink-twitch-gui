import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke, isTauri } from "../lib/tauri";
import type { DoctorReport } from "../lib/doctor";
import { PlayerSetupHelp, StreamlinkSetupHelp, ChatterinoSetupHelp } from "./SetupHelp";
import "./DoctorPanel.css";

export function DoctorPanel() {
  const { t } = useTranslation("routes");
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(() => {
    if (!isTauri()) {
      setError("Desktop shell required (`npm run tauri:dev`).");
      return;
    }
    setChecking(true);
    invoke<DoctorReport>("get_doctor_report")
      .then((data) => {
        setReport(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <section className="doctor">
      <div className="doctor__header">
        <h2>{t("doctorTitle")}</h2>
        <button
          type="button"
          className="button-secondary button-with-spinner"
          onClick={refresh}
          disabled={checking}
        >
          {checking ? <span className="spinner" aria-hidden /> : null}
          {checking ? t("doctorChecking") : t("doctorRecheck")}
        </button>
      </div>
      {checking ? (
        <p className="doctor__checking muted">
          <span className="spinner" aria-hidden />
          {t("doctorChecking")}
        </p>
      ) : null}
      {error ? <p className="muted">{error}</p> : null}
      {!report && !error && !checking ? <p className="muted">…</p> : null}
      {report ? (
        <ul className="doctor__list">
          <li>
            {report.streamlink.found
              ? t("doctorStreamlinkOk", {
                  version: report.streamlink.version ?? "?",
                })
              : t("doctorStreamlinkMissing")}
            {report.streamlink.found && report.streamlink.path ? (
              <p className="doctor__path muted">
                {t("doctorToolPath", { path: report.streamlink.path })}
              </p>
            ) : null}
            {!report.streamlink.found ? (
              <StreamlinkSetupHelp
                status={report.streamlink}
                onRecheck={refresh}
                checking={checking}
              />
            ) : null}
          </li>
          <li>
            {report.mpv.found
              ? t("doctorPlayerOk", {
                  version: report.mpv.version ?? "?",
                })
              : t("doctorPlayerMissing")}
            {report.mpv.found && report.mpv.path ? (
              <p className="doctor__path muted">
                {t("doctorToolPath", { path: report.mpv.path })}
              </p>
            ) : null}
            {!report.mpv.found ? (
              <PlayerSetupHelp
                status={report.mpv}
                onRecheck={refresh}
                checking={checking}
              />
            ) : null}
          </li>
          <li>
            {report.chatterino.found
              ? t("doctorChatOk")
              : t("doctorChatMissing")}
            {report.chatterino.found && report.chatterino.path ? (
              <p className="doctor__path muted">
                {t("doctorToolPath", { path: report.chatterino.path })}
              </p>
            ) : null}
            {!report.chatterino.found ? (
              <ChatterinoSetupHelp
                status={report.chatterino}
                onRecheck={refresh}
                checking={checking}
              />
            ) : null}
          </li>
        </ul>
      ) : null}
    </section>
  );
}
