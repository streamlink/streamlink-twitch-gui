import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isTauri } from "../lib/tauri";
import "./UpdateBanner.css";

type Phase =
  | "hidden"
  | "available"
  | "downloading"
  | "installing"
  | "error";

interface UpdateHandle {
  version: string;
  downloadAndInstall: (
    cb?: (event: {
      event: "Started" | "Progress" | "Finished";
      data: { contentLength?: number; chunkLength: number };
    }) => void,
  ) => Promise<void>;
}

/**
 * One-shot update check shortly after app start. Shows a banner only when an
 * update is available; download progress is visible and the installer opens
 * (NSIS basicUi) before the app relaunches into the new version.
 */
export function UpdateBanner() {
  const { t } = useTranslation("common");
  const [phase, setPhase] = useState<Phase>("hidden");
  const [version, setVersion] = useState("");
  const [progress, setProgress] = useState(0);
  const updateRef = useRef<UpdateHandle | null>(null);

  useEffect(() => {
    if (!isTauri()) return;
    // Slight delay so the check does not compete with boot work (auth,
    // settings, first paint). Failures (offline, endpoint down) stay silent.
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const { check } = await import("@tauri-apps/plugin-updater");
          const update = (await check()) as UpdateHandle | null;
          if (update) {
            updateRef.current = update;
            setVersion(update.version);
            setPhase("available");
          }
        } catch {
          // stay hidden
        }
      })();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  const install = async () => {
    const update = updateRef.current;
    if (!update) return;
    setPhase("downloading");
    setProgress(0);
    try {
      let total = 0;
      let downloaded = 0;
      await update.downloadAndInstall((event) => {
        if (event.event === "Started" && event.data.contentLength) {
          total = event.data.contentLength;
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (total > 0) {
            setProgress(Math.min(99, Math.round((downloaded / total) * 100)));
          }
        } else if (event.event === "Finished") {
          setPhase("installing");
        }
      });
      setPhase("installing");
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    } catch {
      setPhase("error");
    }
  };

  if (phase === "hidden") return null;

  return (
    <div className="update-banner" role="status">
      {phase === "available" ? (
        <>
          <span className="update-banner__text">
            <strong>{t("updateAvailableTitle", { version })}</strong>
            <small className="muted">{t("updateAvailableBody")}</small>
          </span>
          <div className="update-banner__actions">
            <button type="button" onClick={() => void install()}>
              {t("updateNow")}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => setPhase("hidden")}
            >
              {t("updateLater")}
            </button>
          </div>
        </>
      ) : null}
      {phase === "downloading" ? (
        <span className="update-banner__text">
          <strong>{t("updateDownloading", { progress })}</strong>
          <span className="update-banner__bar">
            <span
              className="update-banner__fill"
              style={{ width: `${progress}%` }}
            />
          </span>
        </span>
      ) : null}
      {phase === "installing" ? (
        <span className="update-banner__text">
          <strong>{t("updateInstalling")}</strong>
        </span>
      ) : null}
      {phase === "error" ? (
        <>
          <span className="update-banner__text">
            <strong>{t("updateFailed")}</strong>
          </span>
          <div className="update-banner__actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => setPhase("hidden")}
            >
              {t("close")}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
