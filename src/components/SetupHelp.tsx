import { openUrl } from "@tauri-apps/plugin-opener";
import { useTranslation } from "react-i18next";
import {
  CHATTERINO_INSTALL_URL,
  CHATTERINO_CHOCO,
  CHATTERINO_WINGET,
  MPV_INSTALL_URL,
  MPV_PORTABLE_URL,
  MPV_SCOOP,
  MPV_WINGET,
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

function RecheckButton({
  onRecheck,
  checking,
  secondary = false,
}: {
  onRecheck: () => void;
  checking: boolean;
  secondary?: boolean;
}) {
  const { t } = useTranslation("onboarding");
  return (
    <button
      type="button"
      className={`${secondary ? "button-secondary " : ""}button-with-spinner`}
      onClick={onRecheck}
      disabled={checking}
    >
      {checking ? <span className="spinner" aria-hidden /> : null}
      {checking ? t("checking") : t("recheck")}
    </button>
  );
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
          </div>
          {onRecheck ? (
            <div className="setup-help__actions setup-help__actions--recheck">
              <RecheckButton onRecheck={onRecheck} checking={checking} />
            </div>
          ) : null}
        </>
      )}
      {found && onRecheck ? (
        <div className="setup-help__actions">
          <RecheckButton onRecheck={onRecheck} checking={checking} secondary />
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
        <>
          <p className="setup-help__status">{t("playerFound")}</p>
          {status?.path ? (
            <p className="setup-help__path muted">
              {t("playerFoundPath", { path: status.path })}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="setup-help__title">{t("playerMissingTitle")}</p>
          <p className="setup-help__body muted">{t("playerMissingBody")}</p>
          <p className="setup-help__body muted">{t("playerOpenShell")}</p>
          <div className="setup-help__cmds">
            <div>
              <span className="muted">{t("playerWinget")}</span>
              <code>{MPV_WINGET}</code>
            </div>
            <div>
              <span className="muted">{t("playerScoop")}</span>
              <code>{MPV_SCOOP}</code>
            </div>
          </div>
          <p className="setup-help__body muted">{t("playerPortableBody")}</p>
          <div className="setup-help__actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => void openExternal(MPV_INSTALL_URL)}
            >
              {t("playerDocs")}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => void openExternal(MPV_PORTABLE_URL)}
            >
              {t("playerPortable")}
            </button>
          </div>
          {onRecheck ? (
            <div className="setup-help__actions setup-help__actions--recheck">
              <RecheckButton onRecheck={onRecheck} checking={checking} />
            </div>
          ) : null}
        </>
      )}
      {found && onRecheck ? (
        <div className="setup-help__actions">
          <RecheckButton onRecheck={onRecheck} checking={checking} secondary />
        </div>
      ) : null}
    </div>
  );
}

export function ChatterinoSetupHelp({
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
          <p className="setup-help__status">{t("chatterinoFound")}</p>
          {status?.path ? (
            <p className="setup-help__path muted">
              {t("chatterinoFoundPath", { path: status.path })}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="setup-help__title">{t("chatterinoMissingTitle")}</p>
          <p className="setup-help__body muted">{t("chatterinoMissingBody")}</p>
          <div className="setup-help__cmds">
            <div>
              <span className="muted">{t("chatterinoWinget")}</span>
              <code>{CHATTERINO_WINGET}</code>
            </div>
            <div>
              <span className="muted">{t("chatterinoChoco")}</span>
              <code>{CHATTERINO_CHOCO}</code>
            </div>
          </div>
          <div className="setup-help__actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => void openExternal(CHATTERINO_INSTALL_URL)}
            >
              {t("chatterinoDocs")}
            </button>
          </div>
          {onRecheck ? (
            <div className="setup-help__actions setup-help__actions--recheck">
              <RecheckButton onRecheck={onRecheck} checking={checking} />
            </div>
          ) : null}
        </>
      )}
      {found && onRecheck ? (
        <div className="setup-help__actions">
          <RecheckButton onRecheck={onRecheck} checking={checking} secondary />
        </div>
      ) : null}
    </div>
  );
}
