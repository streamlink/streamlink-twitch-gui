import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke, isTauri } from "../lib/tauri";
import type { DoctorReport } from "../lib/doctor";
import { PlayerSetupHelp, StreamlinkSetupHelp } from "./SetupHelp";
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
          className="button-secondary"
          onClick={refresh}
          disabled={checking}
        >
          {t("doctorRecheck")}
        </button>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      {!report && !error ? <p className="muted">…</p> : null}
      {report ? (
        <ul className="doctor__list">
          <li>
            {report.streamlink.found
              ? t("doctorStreamlinkOk", {
                  version: report.streamlink.version ?? "?",
                })
              : t("doctorStreamlinkMissing")}
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
              ? t("doctorPlayerOk", { name: "mpv" })
              : t("doctorPlayerMissing")}
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
          </li>
        </ul>
      ) : null}
    </section>
  );
}
