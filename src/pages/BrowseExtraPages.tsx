import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ChannelResults } from "../components/ChannelResults";
import { GameGrid } from "../components/GameGrid";
import { LoadingGrid } from "../components/LoadingGrid";
import { StreamGrid } from "../components/StreamGrid";
import { useAuthStore } from "../lib/auth/store";
import { useWatchingStore } from "../lib/streaming/store";
import {
  getChannelStreams,
  getChannelTeams,
  getStreamsByGame,
  getTopGames,
  getUsersByLogin,
  searchCategories,
  searchChannels,
  type HelixStream,
} from "../lib/twitch/helix";

function useLoggedIn() {
  const session = useAuthStore((s) => s.session);
  return Boolean(session?.loggedIn);
}

export function GamesPage() {
  const { t } = useTranslation(["routes", "common"]);
  const loggedIn = useLoggedIn();
  const authLoading = useAuthStore((s) => s.loading);
  const query = useQuery({
    queryKey: ["top-games"],
    enabled: loggedIn,
    queryFn: () => getTopGames(),
    staleTime: 60_000,
  });

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
      {(authLoading || query.isLoading) && !query.data?.data?.length ? (
        <LoadingGrid count={8} />
      ) : null}
      {query.isError ? (
        <p className="muted">{(query.error as Error).message}</p>
      ) : null}
      {query.data?.data?.length ? <GameGrid games={query.data.data} /> : null}
    </section>
  );
}

export function GameStreamsPage() {
  const { t } = useTranslation("routes");
  const { gameId = "" } = useParams();
  const loggedIn = useLoggedIn();
  const watchStream = useWatchingStore((s) => s.watchStream);

  const query = useQuery({
    queryKey: ["game-streams", gameId],
    enabled: loggedIn && Boolean(gameId),
    queryFn: () => getStreamsByGame(gameId),
  });

  return (
    <section>
      <p>
        <Link to="/games">{t("gamesTitle")}</Link>
      </p>
      <h1>{t("gameStreamsTitle")}</h1>
      {query.data?.data?.length ? (
        <StreamGrid
          streams={query.data.data}
          onWatch={(stream) => {
            void watchStream(stream);
          }}
        />
      ) : (
        <p className="muted">{t("followedEmpty")}</p>
      )}
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
  const { t } = useTranslation(["routes", "common"]);
  const { login = "" } = useParams();
  const loggedIn = useLoggedIn();
  const watchStream = useWatchingStore((s) => s.watchStream);

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
                <button type="button" onClick={() => void watchStream(live)}>
                  {t("common:watch")}
                </button>
              </>
            ) : (
              <p className="muted">{t("routes:channelOffline")}</p>
            )}
          </div>
        </div>
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
  const { t } = useTranslation("routes");
  const { teamName = "" } = useParams();
  return (
    <section>
      <h1>{t("teamTitle", { team: teamName })}</h1>
      <p className="muted">{t("teamStub")}</p>
    </section>
  );
}
