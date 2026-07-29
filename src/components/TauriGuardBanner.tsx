import { useTranslation } from "react-i18next";
import { isTauri } from "../lib/tauri";
import "./TauriGuardBanner.css";

export function TauriGuardBanner() {
  const { t } = useTranslation("common");
  if (isTauri()) {
    return null;
  }
  return (
    <div className="tauri-guard" role="alert">
      <strong>{t("tauriRequiredTitle")}</strong>
      <p>{t("tauriRequiredBody")}</p>
      <code>npm run tauri:dev</code>
    </div>
  );
}
