import { openUrl } from "@tauri-apps/plugin-opener";
import { useTranslation } from "react-i18next";
import {
  MPV_INSTALL_URL,
  STREAMLINK_INSTALL_URL,
  STREAMLINK_SCOOP,
  STREAMLINK_WINGET,
  type ToolStatus,
} from "../lib/doctor";
import { isTauri } from "../lib/tauri";
import "./SetupHelp.css";

async function openExternal(url: string) {
  if (isTauri()) {
    await openUrl(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export function StreamlinkSetupHelp({
  status,
  onRecheck,
  checking = false,
}: {
  status?: ToolStatus | null;
  onRecheck?: () => void;
  checking?: boolean;
}) {
  const { t } = useTranslation("onboarding");
  const found = Boolean(status?.found);

  return (
    <div className={`setup-help${found ? " setup-help--ok" : ""}`}>
      {found ? (
        <>
          <p className="setup-help__status">
            {t("streamlinkFound", {
              version: status?.version ?? "?",
            })}
          </p>
          {status?.path ? (
            <p className="setup-help__path muted">
              {t("streamlinkFoundPath", { path: status.path })}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="setup-help__title">{t("streamlinkMissingTitle")}</p>
          <p className="setup-help__body muted">{t("streamlinkMissingBody")}</p>
          <div className="setup-help__cmds">
            <div>
              <span className="muted">{t("streamlinkWinget")}</span>
              <code>{STREAMLINK_WINGET}</code>
            </div>
            <div>
              <span className="muted">{t("streamlinkScoop")}</span>
              <code>{STREAMLINK_SCOOP}</code>
            </div>
          </div>
          <div className="setup-help__actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => void openExternal(STREAMLINK_INSTALL_URL)}
            >
              {t("streamlinkDocs")}
            </button>
            {onRecheck ? (
              <button
                type="button"
                onClick={onRecheck}
                disabled={checking}
              >
                {t("recheck")}
              </button>
            ) : null}
          </div>
        </>
      )}
      {found && onRecheck ? (
        <div className="setup-help__actions">
          <button
            type="button"
            className="button-secondary"
            onClick={onRecheck}
            disabled={checking}
          >
            {t("recheck")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function PlayerSetupHelp({
  status,
  onRecheck,
  checking = false,
}: {
  status?: ToolStatus | null;
  onRecheck?: () => void;
  checking?: boolean;
}) {
  const { t } = useTranslation("onboarding");
  const found = Boolean(status?.found);

  return (
    <div className={`setup-help${found ? " setup-help--ok" : ""}`}>
      {found ? (
        <p className="setup-help__status">{t("playerFound")}</p>
      ) : (
        <>
          <p className="setup-help__title">{t("playerMissingTitle")}</p>
          <p className="setup-help__body muted">{t("playerMissingBody")}</p>
          <div className="setup-help__actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => void openExternal(MPV_INSTALL_URL)}
            >
              {t("playerDocs")}
            </button>
            {onRecheck ? (
              <button type="button" onClick={onRecheck} disabled={checking}>
                {t("recheck")}
              </button>
            ) : null}
          </div>
        </>
      )}
      {found && onRecheck ? (
        <div className="setup-help__actions">
          <button
            type="button"
            className="button-secondary"
            onClick={onRecheck}
            disabled={checking}
          >
            {t("recheck")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
