import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ChannelResults } from "../components/ChannelResults";
import { GameGrid } from "../components/GameGrid";
import { LoadMore } from "../components/LoadMore";
import { LoadingGrid } from "../components/LoadingGrid";
import { StreamGrid } from "../components/StreamGrid";
import { useAuthStore } from "../lib/auth/store";
import { useWatchingStore } from "../lib/streaming/store";
import { useSettingsStore } from "../lib/settings/store";
import {
  getChannelStreams,
  getChannelTeams,
  getStreamsByGame,
  getStreamsByUserIds,
  getTeamByName,
  getTopGames,
  getUsersByLogin,
  searchCategories,
  searchChannels,
  type HelixStream,
} from "../lib/twitch/helix";
import "../pages/SettingsPage.css";

function useLoggedIn() {
  const session = useAuthStore((s) => s.session);
  return Boolean(session?.loggedIn);
}

export function GamesPage() {
  const { t } = useTranslation(["routes", "common"]);
  const loggedIn = useLoggedIn();
  const authLoading = useAuthStore((s) => s.loading);
  const query = useInfiniteQuery({
    queryKey: ["top-games"],
    enabled: loggedIn,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getTopGames(pageParam),
    getNextPageParam: (last) => last.pagination?.cursor,
    staleTime: 60_000,
  });

  const games = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>{t("routes:gamesTitle")}</h1>
          <p className="page__lede">{t("routes:gamesLede")}</p>
        </div>
      </header>
      {!loggedIn && !authLoading ? (
        <p className="muted">{t("routes:followedLoginRequired")}</p>
      ) : null}
      {(authLoading || query.isLoading) && !games.length ? (
        <LoadingGrid count={8} />
      ) : null}
      {query.isError ? (
        <p className="muted">{(query.error as Error).message}</p>
      ) : null}
      {games.length ? (
        <>
          <GameGrid games={games} />
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

export function GameStreamsPage() {
  const { t } = useTranslation("routes");
  const { gameId = "" } = useParams();
  const loggedIn = useLoggedIn();
  const watchStream = useWatchingStore((s) => s.watchStream);

  const query = useInfiniteQuery({
    queryKey: ["game-streams", gameId],
    enabled: loggedIn && Boolean(gameId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getStreamsByGame(gameId, pageParam),
    getNextPageParam: (last) => last.pagination?.cursor,
  });

  const streams = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <section className="page">
      <p>
        <Link to="/games">{t("gamesTitle")}</Link>
      </p>
      <h1>{t("gameStreamsTitle")}</h1>
      {query.isLoading ? <LoadingGrid /> : null}
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
      ) : !query.isLoading ? (
        <p className="muted">{t("followedEmpty")}</p>
      ) : null}
    </section>
  );
}

export function SearchPage() {
  const { t } = useTranslation(["routes", "common"]);
  const loggedIn = useLoggedIn();
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  const channels = useQuery({
    queryKey: ["search-channels", submitted],
    enabled: loggedIn && submitted.length > 0,
    queryFn: () => searchChannels(submitted),
  });
  const categories = useQuery({
    queryKey: ["search-categories", submitted],
    enabled: loggedIn && submitted.length > 0,
    queryFn: () => searchCategories(submitted),
  });

  const busy = channels.isFetching || categories.isFetching;

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>{t("routes:searchTitle")}</h1>
          <p className="page__lede">{t("routes:searchLede")}</p>
        </div>
      </header>

      <form
        className="search-hero"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(q.trim());
        }}
      >
        <input
          type="search"
          className="search-hero__input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("routes:searchPlaceholder")}
          aria-label={t("common:search")}
          autoFocus
        />
        <button type="submit" disabled={!loggedIn || !q.trim()}>
          {t("common:search")}
        </button>
      </form>

      {!loggedIn ? (
        <p className="muted">{t("routes:followedLoginRequired")}</p>
      ) : null}

      {!submitted && loggedIn ? (
        <div className="empty-panel">
          <strong>{t("routes:searchIdleTitle")}</strong>
          <p className="muted">{t("routes:searchIdleBody")}</p>
        </div>
      ) : null}

      {submitted ? (
        <div className="search-layout">
          <section className="search-panel">
            <div className="search-panel__head">
              <h2>{t("routes:searchChannels")}</h2>
              {busy ? <span className="muted">{t("common:loading")}</span> : null}
            </div>
            {channels.isError ? (
              <p className="muted">{(channels.error as Error).message}</p>
            ) : null}
            {channels.data ? (
              <ChannelResults channels={channels.data.data} />
            ) : busy ? (
              <LoadingGrid count={4} />
            ) : null}
          </section>

          <section className="search-panel">
            <div className="search-panel__head">
              <h2>{t("routes:searchCategories")}</h2>
            </div>
            {categories.data?.data?.length ? (
              <GameGrid games={categories.data.data} />
            ) : !busy ? (
              <p className="muted">{t("routes:searchEmpty")}</p>
            ) : (
              <LoadingGrid count={6} />
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}

export function ChannelPage() {
  const { t } = useTranslation(["routes", "common", "settings"]);
  const { login = "" } = useParams();
  const loggedIn = useLoggedIn();
  const watchStream = useWatchingStore((s) => s.watchStream);
  const channels = useSettingsStore((s) => s.settings.channels);
  const setChannelOverride = useSettingsStore((s) => s.setChannelOverride);
  const globalQuality = useSettingsStore((s) => s.settings.streaming.quality);
  const [overrideQuality, setOverrideQuality] = useState(
    () => channels[login.toLowerCase()]?.quality ?? "",
  );

  useEffect(() => {
    setOverrideQuality(channels[login.toLowerCase()]?.quality ?? "");
  }, [channels, login]);

  const userQuery = useQuery({
    queryKey: ["channel-user", login],
    enabled: loggedIn && Boolean(login),
    queryFn: () => getUsersByLogin([login]),
  });
  const user = userQuery.data?.data[0];

  const streamQuery = useQuery({
    queryKey: ["channel-stream", login],
    enabled: loggedIn && Boolean(login),
    queryFn: () => getChannelStreams(login),
  });
  const live = streamQuery.data?.data[0] as HelixStream | undefined;

  const teamsQuery = useQuery({
    queryKey: ["channel-teams", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getChannelTeams(user!.id),
  });

  const title = useMemo(
    () => user?.display_name ?? login,
    [user?.display_name, login],
  );

  return (
    <section className="page">
      <h1>{title}</h1>
      {!loggedIn ? <p className="muted">{t("routes:followedLoginRequired")}</p> : null}
      {user ? (
        <div className="channel-header">
          <img
            src={user.profile_image_url}
            alt=""
            width={72}
            height={72}
            className="channel-header__avatar"
          />
          <div>
            <p className="muted">@{user.login}</p>
            {live ? (
              <>
                <p>{live.title}</p>
                <p className="muted">
                  {live.game_name} · {live.viewer_count}
                </p>
                <div className="channel-header__actions">
                  <button type="button" onClick={() => void watchStream(live)}>
                    {t("common:watch")}
                  </button>
                </div>
              </>
            ) : (
              <p className="muted">{t("routes:channelOffline")}</p>
            )}
          </div>
        </div>
      ) : null}

      {login ? (
        <fieldset className="settings__group">
          <legend>{t("routes:channelOverrideTitle")}</legend>
          <div className="settings__row">
            <div className="settings__label">
              <span>{t("routes:channelOverrideQuality")}</span>
              <small className="muted">
                {t("settings:useGlobal")}: {globalQuality}
              </small>
            </div>
            <div className="settings__control settings__control--row">
              <input
                className="input"
                value={overrideQuality}
                placeholder={globalQuality}
                onChange={(e) => setOverrideQuality(e.target.value)}
              />
              <button
                type="button"
                className="button-secondary"
                onClick={() =>
                  setChannelOverride(login, {
                    quality: overrideQuality.trim() || undefined,
                  })
                }
              >
                {t("routes:channelOverrideSave")}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setChannelOverride(login, null);
                  setOverrideQuality("");
                }}
              >
                {t("routes:channelOverrideClear")}
              </button>
            </div>
          </div>
        </fieldset>
      ) : null}

      {teamsQuery.data?.data?.length ? (
        <>
          <h2>{t("routes:channelTeams")}</h2>
          <ul className="team-list">
            {teamsQuery.data.data.map((team) => (
              <li key={team.id}>
                <Link to={`/team/${team.team_name}`}>{team.team_display_name}</Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export function TeamPage() {
  const { t } = useTranslation(["routes", "common"]);
  const { teamName = "" } = useParams();
  const loggedIn = useLoggedIn();
  const watchStream = useWatchingStore((s) => s.watchStream);

  const teamQuery = useQuery({
    queryKey: ["team", teamName],
    enabled: loggedIn && Boolean(teamName),
    queryFn: () => getTeamByName(teamName),
  });

  const members = teamQuery.data?.users ?? [];
  const memberIds = members.map((m) => m.user_id);

  const liveQuery = useQuery({
    queryKey: ["team-live", teamName, memberIds.join(",")],
    enabled: loggedIn && memberIds.length > 0,
    queryFn: () => getStreamsByUserIds(memberIds),
    staleTime: 30_000,
  });

  const liveByLogin = useMemo(() => {
    const map = new Map<string, HelixStream>();
    for (const stream of liveQuery.data ?? []) {
      map.set(stream.user_login.toLowerCase(), stream);
    }
    return map;
  }, [liveQuery.data]);

  const liveStreams = useMemo(
    () =>
      members
        .map((m) => liveByLogin.get(m.user_login.toLowerCase()))
        .filter((s): s is HelixStream => Boolean(s)),
    [members, liveByLogin],
  );

  const title =
    teamQuery.data?.team_display_name ??
    t("routes:teamTitle", { team: teamName });

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>{title}</h1>
          {teamQuery.data?.info ? (
            <p className="page__lede">{teamQuery.data.info}</p>
          ) : null}
        </div>
      </header>

      {!loggedIn ? (
        <p className="muted">{t("routes:followedLoginRequired")}</p>
      ) : null}
      {teamQuery.isLoading ? <LoadingGrid count={4} /> : null}
      {teamQuery.isError ? (
        <p className="muted">{(teamQuery.error as Error).message}</p>
      ) : null}
      {teamQuery.isSuccess && !teamQuery.data ? (
        <div className="empty-panel">
          <strong>{t("routes:teamEmpty")}</strong>
        </div>
      ) : null}

      {liveStreams.length ? (
        <>
          <h2>{t("routes:teamLive")}</h2>
          <StreamGrid
            streams={liveStreams}
            onWatch={(stream) => {
              void watchStream(stream);
            }}
          />
        </>
      ) : null}

      {members.length ? (
        <>
          <h2>{t("routes:teamMembers")}</h2>
          <ul className="team-member-list">
            {members.map((member) => {
              const live = liveByLogin.get(member.user_login.toLowerCase());
              return (
                <li key={member.user_id} className="team-member">
                  <Link to={`/channel/${member.user_login}`}>
                    {member.user_name}
                  </Link>
                  {live ? (
                    <span className="badge badge--live">{t("routes:liveBadge")}</span>
                  ) : (
                    <span className="muted">{t("routes:teamOffline")}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}
