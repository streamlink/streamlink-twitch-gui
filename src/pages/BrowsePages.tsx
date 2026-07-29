import { useTranslation } from "react-i18next";
import { DoctorPanel } from "../components/DoctorPanel";

export function FollowedPage() {
  const { t } = useTranslation("routes");
  return (
    <section>
      <h1>{t("followedTitle")}</h1>
      <p className="muted">{t("followedLoginRequired")}</p>
    </section>
  );
}

export function StreamsPage() {
  const { t } = useTranslation("routes");
  return (
    <section>
      <h1>{t("streamsTitle")}</h1>
    </section>
  );
}

export function GamesPage() {
  const { t } = useTranslation("routes");
  return (
    <section>
      <h1>{t("gamesTitle")}</h1>
    </section>
  );
}

export function SearchPage() {
  const { t } = useTranslation(["routes", "common"]);
  return (
    <section>
      <h1>{t("routes:searchTitle")}</h1>
      <input
        type="search"
        className="input"
        placeholder={t("routes:searchPlaceholder")}
        aria-label={t("common:search")}
      />
    </section>
  );
}

export function WatchingPage() {
  const { t } = useTranslation("routes");
  return (
    <section>
      <h1>{t("watchingTitle")}</h1>
      <p className="muted">{t("watchingEmpty")}</p>
    </section>
  );
}

export function AboutPage() {
  const { t } = useTranslation("routes");
  return (
    <section>
      <h1>{t("aboutTitle")}</h1>
      <p>{t("aboutBlurb")}</p>
      <DoctorPanel />
    </section>
  );
}
