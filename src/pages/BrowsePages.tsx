import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { AuthBar } from "../components/AuthBar";
import { DoctorPanel } from "../components/DoctorPanel";
import { StreamGrid } from "../components/StreamGrid";
import { useAuthStore } from "../lib/auth/store";
import { getFollowedStreams, getTopStreams } from "../lib/twitch/helix";

export function FollowedPage() {
  const { t } = useTranslation(["routes", "common"]);
  const session = useAuthStore((s) => s.session);
  const loggedIn = Boolean(session?.loggedIn && session.userId);

  const query = useQuery({
    queryKey: ["followed-streams", session?.userId],
    enabled: loggedIn,
    queryFn: () => getFollowedStreams(session!.userId!),
  });

  return (
    <section>
      <h1>{t("routes:followedTitle")}</h1>
      <AuthBar />
      {!loggedIn ? <p className="muted">{t("routes:followedLoginRequired")}</p> : null}
      {query.isLoading ? <p className="muted">{t("common:loading")}</p> : null}
      {query.isError ? (
        <p className="muted">{(query.error as Error).message}</p>
      ) : null}
      {query.data?.data.length === 0 ? (
        <p className="muted">{t("routes:followedEmpty")}</p>
      ) : null}
      {query.data?.data?.length ? <StreamGrid streams={query.data.data} /> : null}
    </section>
  );
}

export function StreamsPage() {
  const { t } = useTranslation("routes");
  const session = useAuthStore((s) => s.session);
  const loggedIn = Boolean(session?.loggedIn);

  const query = useQuery({
    queryKey: ["top-streams"],
    enabled: loggedIn,
    queryFn: () => getTopStreams(),
  });

  return (
    <section>
      <h1>{t("streamsTitle")}</h1>
      <AuthBar />
      {!loggedIn ? <p className="muted">{t("followedLoginRequired")}</p> : null}
      {query.data?.data?.length ? <StreamGrid streams={query.data.data} /> : null}
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

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const refreshSession = useAuthStore((s) => s.refreshSession);
  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);
  return children;
}
