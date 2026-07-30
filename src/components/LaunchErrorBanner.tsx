import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StreamlinkSetupHelp } from "./SetupHelp";
import {
  isStreamlinkMissingError,
  type DoctorReport,
} from "../lib/doctor";
import { useWatchingStore } from "../lib/streaming/store";
import { invoke, isTauri } from "../lib/tauri";

/** Global watch/launch error with Streamlink install help when relevant. */
export function LaunchErrorBanner() {
  const { t } = useTranslation("routes");
  const error = useWatchingStore((s) => s.error);
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [checking, setChecking] = useState(false);

  const showHelp =
    isStreamlinkMissingError(error) ||
    Boolean(error && report && !report.streamlink.found);

  useEffect(() => {
    if (!error || !isTauri()) {
      setReport(null);
      return;
    }
    let cancelled = false;
    setChecking(true);
    invoke<DoctorReport>("get_doctor_report")
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch(() => {
        if (!cancelled) setReport(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [error]);

  if (!error) return null;

  return (
    <div className="launch-error-banner" role="alert">
      <p className="authbar__error">
        {t("launchError")}: {error}
      </p>
      {showHelp ? (
        <>
          <p className="muted">{t("launchErrorStreamlinkHelp")}</p>
          <StreamlinkSetupHelp
            status={report?.streamlink ?? { found: false }}
            onRecheck={() => {
              setChecking(true);
              invoke<DoctorReport>("get_doctor_report")
                .then(setReport)
                .finally(() => setChecking(false));
            }}
            checking={checking}
          />
        </>
      ) : null}
    </div>
  );
}
