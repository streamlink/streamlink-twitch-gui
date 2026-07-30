import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DoctorPanel } from "../components/DoctorPanel";
import { EmbeddedChat } from "../components/EmbeddedChat";
import { LoadMore } from "../components/LoadMore";
import { LoadingGrid } from "../components/LoadingGrid";
import { StreamGrid } from "../components/StreamGrid";
import { useUpdaterCheck } from "../components/DeepLinkAndUpdaterBootstrap";
import { useAuthStore } from "../lib/auth/store";
import { useWatchingStore } from "../lib/streaming/store";
import { getFollowedStreams, getTopGames, getTopStreams } from "../lib/twitch/helix";
import { useSettingsStore } from "../lib/settings/store";

export function FollowedPage() {
  const { t } = useTranslation(["routes", "common"]);
  const session = useAuthStore((s) => s.session);
  const watchStream = useWatchingStore((s) => s.watchStream);
  const loggedIn = Boolean(session?.loggedIn && session.userId);

  const query = useInfiniteQuery({
    queryKey: ["followed-streams", session?.userId],
    enabled: loggedIn,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getFollowedStreams(session!.userId!, pageParam),
    getNextPageParam: (last) => last.pagination?.cursor,
  });

  const streams = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>{t("routes:followedTitle")}</h1>
          <p className="page__lede">{t("routes:followedLede")}</p>
        </div>
      </header>
      {!loggedIn ? <p className="muted">{t("routes:followedLoginRequired")}</p> : null}
      {query.isLoading ? <LoadingGrid /> : null}
      {query.isError ? (
        <p className="muted">{(query.error as Error).message}</p>
      ) : null}
      {loggedIn && !query.isLoading && streams.length === 0 ? (
        <div className="empty-panel">
          <strong>{t("routes:followedEmpty")}</strong>
        </div>
      ) : null}
      {streams.length ? (
        <>
          <StreamGrid
            streams={streams}
            onWatch={(stream) => {
              void watchStream(stream);
            }}
          />
          <LoadMore
            hasMore={Boolean(query.hasNextPage)}
            isFetching={query.isFetchingNextPage}
            onLoadMore={() => void query.fetchNextPage()}
          />
        </>
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

  const query = useInfiniteQuery({
    queryKey: ["top-streams"],
    enabled: loggedIn,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getTopStreams(pageParam),
    getNextPageParam: (last) => last.pagination?.cursor,
    staleTime: 20_000,
  });

  const streams = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>{t("routes:streamsTitle")}</h1>
          <p className="page__lede">{t("routes:streamsLede")}</p>
        </div>
      </header>
      {!loggedIn && !authLoading ? (
        <p className="muted">{t("routes:followedLoginRequired")}</p>
      ) : null}
      {(authLoading || query.isLoading) && !streams.length ? (
        <LoadingGrid />
      ) : null}
      {query.isError ? (
        <p className="muted">{(query.error as Error).message}</p>
      ) : null}
      {streams.length ? (
        <>
          <StreamGrid
            streams={streams}
            onWatch={(stream) => {
              void watchStream(stream);
            }}
          />
          <LoadMore
            hasMore={Boolean(query.hasNextPage)}
            isFetching={query.isFetchingNextPage}
            onLoadMore={() => void query.fetchNextPage()}
          />
        </>
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
              <div className="watching-list__meta">
                <div>
                  <strong>{session.channel}</strong>
                  <span className="muted">
                    {" "}
                    · {session.quality}
                    {session.game ? ` · ${session.game}` : ""}
                  </span>
                </div>
                {session.status ? (
                  <p
                    className={`watching-list__status watching-list__status--${session.phase ?? "info"}`}
                    title={session.status}
                  >
                    {session.status}
                  </p>
                ) : null}
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
  const { status, version, error, check, install } = useUpdaterCheck();

  return (
    <section className="page">
      <header className="page__header">
        <h1>{t("aboutTitle")}</h1>
        <p className="page__lede">{t("aboutBlurb")}</p>
      </header>
      <p className="muted">{t("deepLinkHint")}</p>
      <div className="channel-header__actions" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className="button-secondary"
          disabled={status === "checking"}
          onClick={() => void check()}
        >
          {status === "checking" ? t("updateChecking") : t("checkUpdates")}
        </button>
        {status === "available" && version ? (
          <button type="button" onClick={() => void install()}>
            {t("updateInstall")} ({version})
          </button>
        ) : null}
      </div>
      {status === "available" && version ? (
        <p>{t("updateAvailable", { version })}</p>
      ) : null}
      {status === "none" ? <p className="muted">{t("updateNone")}</p> : null}
      {status === "error" ? (
        <p className="authbar__error">
          {t("updateError")}
          {error ? ` — ${error}` : ""}
        </p>
      ) : null}
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
    void queryClient.prefetchInfiniteQuery({
      queryKey: ["top-streams"],
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam }) => getTopStreams(pageParam),
      getNextPageParam: (last) => last.pagination?.cursor,
      staleTime: 20_000,
      pages: 1,
    });
    void queryClient.prefetchInfiniteQuery({
      queryKey: ["top-games"],
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam }) => getTopGames(pageParam),
      getNextPageParam: (last) => last.pagination?.cursor,
      staleTime: 60_000,
      pages: 1,
    });
    if (session.userId) {
      void queryClient.prefetchInfiniteQuery({
        queryKey: ["followed-streams", session.userId],
        initialPageParam: undefined as string | undefined,
        queryFn: ({ pageParam }) =>
          getFollowedStreams(session.userId!, pageParam),
        getNextPageParam: (last) => last.pagination?.cursor,
        staleTime: 20_000,
        pages: 1,
      });
    }
  }, [session?.loggedIn, session?.userId, queryClient]);

  return children;
}
