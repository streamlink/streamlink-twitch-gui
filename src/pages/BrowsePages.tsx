import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthBar } from "../components/AuthBar";
import { DoctorPanel } from "../components/DoctorPanel";
import { EmbeddedChat } from "../components/EmbeddedChat";
import { LoadingGrid } from "../components/LoadingGrid";
import { StreamGrid } from "../components/StreamGrid";
import { useAuthStore } from "../lib/auth/store";
import { useWatchingStore } from "../lib/streaming/store";
import { getFollowedStreams, getTopGames, getTopStreams } from "../lib/twitch/helix";
import { useSettingsStore } from "../lib/settings/store";

export function FollowedPage() {
  const { t } = useTranslation(["routes", "common"]);
  const session = useAuthStore((s) => s.session);
  const watchStream = useWatchingStore((s) => s.watchStream);
  const launchError = useWatchingStore((s) => s.error);
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
      {launchError ? <p className="authbar__error">{launchError}</p> : null}
      {!loggedIn ? <p className="muted">{t("routes:followedLoginRequired")}</p> : null}
      {query.isLoading ? <p className="muted">{t("common:loading")}</p> : null}
      {query.isError ? (
        <p className="muted">{(query.error as Error).message}</p>
      ) : null}
      {query.data?.data.length === 0 ? (
        <p className="muted">{t("routes:followedEmpty")}</p>
      ) : null}
      {query.data?.data?.length ? (
        <StreamGrid
          streams={query.data.data}
          onWatch={(stream) => {
            void watchStream(stream);
          }}
        />
      ) : null}
    </section>
  );
}

export function StreamsPage() {
  const { t } = useTranslation(["routes", "common"]);
  const session = useAuthStore((s) => s.session);
  const authLoading = useAuthStore((s) => s.loading);
  const watchStream = useWatchingStore((s) => s.watchStream);
  const loggedIn = Boolean(session?.loggedIn);

  const query = useQuery({
    queryKey: ["top-streams"],
    enabled: loggedIn,
    queryFn: () => getTopStreams(),
    staleTime: 20_000,
  });

  return (
    <section>
      <h1>{t("routes:streamsTitle")}</h1>
      <AuthBar />
      {!loggedIn && !authLoading ? (
        <p className="muted">{t("routes:followedLoginRequired")}</p>
      ) : null}
      {authLoading || query.isLoading || query.isFetching ? (
        query.data?.data?.length ? null : <LoadingGrid />
      ) : null}
      {query.isError ? (
        <p className="muted">{(query.error as Error).message}</p>
      ) : null}
      {query.data?.data?.length ? (
        <StreamGrid
          streams={query.data.data}
          onWatch={(stream) => {
            void watchStream(stream);
          }}
        />
      ) : null}
    </section>
  );
}

export function WatchingPage() {
  const { t } = useTranslation(["routes", "common"]);
  const sessions = useWatchingStore((s) => s.sessions);
  const refresh = useWatchingStore((s) => s.refresh);
  const stopSession = useWatchingStore((s) => s.stopSession);
  const stopAll = useWatchingStore((s) => s.stopAll);
  const activeChatChannel = useWatchingStore((s) => s.activeChatChannel);
  const setActiveChat = useWatchingStore((s) => s.setActiveChat);
  const chatProvider = useSettingsStore((s) => s.settings.chat.provider);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, 4000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return (
    <section className="watching-layout">
      <div className="watching-layout__main">
        <div className="watching-layout__header">
          <h1>{t("routes:watchingTitle")}</h1>
          {sessions.length ? (
            <button type="button" className="button-secondary" onClick={() => void stopAll()}>
              {t("routes:watchingStopAll")}
            </button>
          ) : null}
        </div>
        {!sessions.length ? <p className="muted">{t("routes:watchingEmpty")}</p> : null}
        <ul className="watching-list">
          {sessions.map((session) => (
            <li key={session.id} className="watching-list__item">
              <div>
                <strong>{session.channel}</strong>
                <span className="muted">
                  {" "}
                  · {session.quality}
                  {session.game ? ` · ${session.game}` : ""}
                </span>
              </div>
              <div className="watching-list__actions">
                {chatProvider === "embedded" ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setActiveChat(session.channel)}
                  >
                    {t("routes:chatTitle", { channel: session.channel })}
                  </button>
                ) : null}
                <button type="button" onClick={() => void stopSession(session.id)}>
                  {t("common:stop")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {chatProvider === "embedded" ? (
        <EmbeddedChat channel={activeChatChannel ?? sessions[0]?.channel ?? null} />
      ) : null}
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
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!session?.loggedIn) {
      return;
    }
    void queryClient.prefetchQuery({
      queryKey: ["top-streams"],
      queryFn: () => getTopStreams(),
      staleTime: 20_000,
    });
    void queryClient.prefetchQuery({
      queryKey: ["top-games"],
      queryFn: () => getTopGames(),
      staleTime: 60_000,
    });
    if (session.userId) {
      void queryClient.prefetchQuery({
        queryKey: ["followed-streams", session.userId],
        queryFn: () => getFollowedStreams(session.userId!),
        staleTime: 20_000,
      });
    }
  }, [session?.loggedIn, session?.userId, queryClient]);

  return children;
}
