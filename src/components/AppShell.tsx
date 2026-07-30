import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { AuthBar } from "./AuthBar";
import "./AppShell.css";

const primaryLinks = [
  { to: "/", key: "followed" as const },
  { to: "/streams", key: "streams" as const },
  { to: "/games", key: "games" as const },
  { to: "/search", key: "search" as const },
  { to: "/watching", key: "watching" as const },
  { to: "/multistream", key: "multistream" as const },
];

const secondaryLinks = [
  { to: "/settings", key: "settings" as const },
  { to: "/about", key: "about" as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("nav");
  const { t: tc } = useTranslation("common");

  return (
    <div className="shell">
      <aside className="shell__nav" aria-label={tc("appName")}>
        <div className="shell__brand">
          <img
            className="shell__brand-mark"
            src="/app-icon.png"
            width={28}
            height={28}
            alt=""
          />
          <div>
            <div className="shell__brand-title">{tc("appNameShort")}</div>
            <div className="shell__brand-sub">{tc("appTagline")}</div>
          </div>
        </div>

        <div className="shell__section">
          <h2 className="shell__section-label">{t("browse")}</h2>
          <nav className="shell__links" aria-label={t("browse")}>
            {primaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "shell__link shell__link--active" : "shell__link"
                }
                end={link.to === "/"}
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="shell__section shell__section--footer">
          <h2 className="shell__section-label">{t("system")}</h2>
          <nav className="shell__links" aria-label={t("system")}>
            {secondaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "shell__link shell__link--active" : "shell__link"
                }
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <div className="shell__content">
        <header className="shell__top">
          <AuthBar compact />
        </header>
        <main className="shell__main">{children}</main>
      </div>
    </div>
  );
}
