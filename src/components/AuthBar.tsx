import { useTranslation } from "react-i18next";
import { useAuthStore } from "../lib/auth/store";
import "./AuthBar.css";

export function AuthBar() {
  const { t } = useTranslation("common");
  const session = useAuthStore((s) => s.session);
  const device = useAuthStore((s) => s.device);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const startLogin = useAuthStore((s) => s.startLogin);
  const cancelLogin = useAuthStore((s) => s.cancelLogin);
  const logout = useAuthStore((s) => s.logout);

  if (loading && !session) {
    return <div className="authbar muted">{t("loading")}</div>;
  }

  return (
    <div className="authbar">
      {error ? <p className="authbar__error">{error}</p> : null}
      {device ? (
        <div className="authbar__device">
          <p>
            {t("authDevicePrompt", { code: device.userCode })}
          </p>
          <code className="authbar__code">{device.userCode}</code>
          <button type="button" className="button-secondary" onClick={cancelLogin}>
            {t("cancel")}
          </button>
        </div>
      ) : null}
      {session?.loggedIn ? (
        <div className="authbar__user">
          {session.profileImageUrl ? (
            <img
              src={session.profileImageUrl}
              alt=""
              className="authbar__avatar"
              width={28}
              height={28}
            />
          ) : null}
          <span>{session.displayName ?? session.login}</span>
          <button type="button" className="button-secondary" onClick={() => void logout()}>
            {t("logout")}
          </button>
        </div>
      ) : !device ? (
        <button type="button" onClick={() => void startLogin()} disabled={loading}>
          {t("login")}
        </button>
      ) : null}
    </div>
  );
}
