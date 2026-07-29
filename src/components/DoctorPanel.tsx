import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

interface ToolStatus {
  found: boolean;
  path?: string | null;
  version?: string | null;
  source?: string | null;
}

interface DoctorReport {
  streamlink: ToolStatus;
  mpv: ToolStatus;
  chatterino: ToolStatus;
  minStreamlinkVersion: string;
}

export function DoctorPanel() {
  const { t } = useTranslation("routes");
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    invoke<DoctorReport>("get_doctor_report")
      .then((data) => {
        if (!cancelled) {
          setReport(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="doctor">
      <h2>{t("doctorTitle")}</h2>
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
          </li>
          <li>
            {report.mpv.found
              ? t("doctorPlayerOk", { name: "mpv" })
              : t("doctorPlayerMissing")}
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
