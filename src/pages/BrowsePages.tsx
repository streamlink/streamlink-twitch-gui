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
import { PageRefreshButton } from "../components/PageRefreshButton";
import { StreamGrid } from "../components/StreamGrid";
import { useUpdaterCheck } from "../components/DeepLinkAndUpdaterBootstrap";
import { useAuthStore } from "../lib/auth/store";
import { useWatchingStore } from "../lib/streaming/store";
import {
  isMultistreamLayout,
  layoutCapacity,
} from "../lib/streaming/layout";
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
  const refreshing = query.isFetching && !query.isFetchingNextPage;

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>{t("routes:followedTitle")}</h1>
          <p className="page__lede">{t("routes:followedLede")}</p>
        </div>
        {loggedIn ? (
          <PageRefreshButton
            refreshing={refreshing}
            onRefresh={() => void query.refetch()}
          />
        ) : null}
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
  const refreshing = query.isFetching && !query.isFetchingNextPage;

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>{t("routes:streamsTitle")}</h1>
          <p className="page__lede">{t("routes:streamsLede")}</p>
        </div>
        {loggedIn ? (
          <PageRefreshButton
            refreshing={refreshing}
            onRefresh={() => void query.refetch()}
          />
        ) : null}
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
  const { t } = useTranslation(["routes", "common", "settings"]);
  const sessions = useWatchingStore((s) => s.sessions);
  const slotChannels = useWatchingStore((s) => s.slotChannels);
  const refresh = useWatchingStore((s) => s.refresh);
  const stopSession = useWatchingStore((s) => s.stopSession);
  const stopAll = useWatchingStore((s) => s.stopAll);
  const toggleMute = useWatchingStore((s) => s.toggleMute);
  const moveSlot = useWatchingStore((s) => s.moveSlot);
  const applyLayout = useWatchingStore((s) => s.applyLayout);
  const activeChatChannel = useWatchingStore((s) => s.activeChatChannel);
  const setActiveChat = useWatchingStore((s) => s.setActiveChat);
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const chatProvider = settings.chat.provider;
  const multi = !settings.streaming.seamlessSwitch;
  const launchError = useWatchingStore((s) => s.error);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, 4000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const orderedSessions = multi
    ? slotChannels
        .map((ch) =>
          sessions.find((s) => s.channel.toLowerCase() === ch && s.running),
        )
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
    : sessions;

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
        {multi ? (
          <label className="settings__row" style={{ marginBottom: "0.75rem" }}>
            <span>{t("settings:multistreamLayout")}</span>
            <select
              value={settings.streaming.multistreamLayout}
              onChange={(e) => {
                const value = e.target.value;
                if (!isMultistreamLayout(value)) return;
                if (orderedSessions.length > layoutCapacity(value)) {
                  useWatchingStore.setState({
                    error: `Layout holds ${layoutCapacity(value)} streams. Stop extras first.`,
                  });
                  return;
                }
                setSettings({
                  streaming: {
                    ...settings.streaming,
                    multistreamLayout: value,
                  },
                });
                applyLayout();
              }}
            >
              <option value="1">{t("settings:layout1")}</option>
              <option value="2">{t("settings:layout2")}</option>
              <option value="2plus1">{t("settings:layout2plus1")}</option>
              <option value="2x2">{t("settings:layout2x2")}</option>
              <option value="3plus1">{t("settings:layout3plus1")}</option>
              <option value="3x2">{t("settings:layout3x2")}</option>
              <option value="4x2">{t("settings:layout4x2")}</option>
              <option value="8x1">{t("settings:layout8x1")}</option>
            </select>
          </label>
        ) : null}
        {launchError ? <p className="muted">{launchError}</p> : null}
        {!sessions.length ? <p className="muted">{t("routes:watchingEmpty")}</p> : null}
        <ul className="watching-list">
          {orderedSessions.map((session, index) => (
            <li key={session.id} className="watching-list__item">
              <div className="watching-list__meta">
                <div>
                  {multi ? (
                    <span className="muted">#{index + 1} </span>
                  ) : null}
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
                {multi ? (
                  <>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={index === 0}
                      onClick={() => moveSlot(session.channel, -1)}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={index >= orderedSessions.length - 1}
                      onClick={() => moveSlot(session.channel, 1)}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </>
                ) : null}
                {chatProvider === "embedded" ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setActiveChat(session.channel)}
                  >
                    {t("routes:chatTitle", { channel: session.channel })}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="button-secondary"
                  aria-pressed={Boolean(session.muted)}
                  onClick={() => void toggleMute(session.id)}
                >
                  {session.muted ? "Unmute" : "Mute"}
                </button>
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
