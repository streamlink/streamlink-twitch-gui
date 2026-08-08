import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../lib/auth/store";
import { useSettingsStore } from "../lib/settings/store";
import { useWatchingStore, type StreamSession } from "../lib/streaming/store";
import {
  getFollowedChannelLogins,
  getFollowedStreams,
  searchChannels,
  streamThumbnail,
  type HelixChannel,
  type HelixStream,
} from "../lib/twitch/helix";
import {
  isMultistreamLayout,
  isUnevenLayout,
  isUnevenMainSide,
  layoutCapacity,
  MULTISTREAM_LAYOUTS,
  UNEVEN_MAIN_SIDES,
} from "../lib/streaming/layout";
import "./MultistreamPage.css";

/** watchStream only reads user_login/title/game_name — fill the rest. */
function streamLike(login: string, title = "", game = ""): HelixStream {
  return {
    id: "",
    user_id: "",
    user_login: login,
    user_name: login,
    game_id: "",
    game_name: game,
    type: "live",
    title,
    viewer_count: 0,
    started_at: "",
    language: "",
    thumbnail_url: "",
    is_mature: false,
  };
}

export function MultistreamPage() {
  const { t } = useTranslation(["multistream", "settings", "common", "routes"]);
  const session = useAuthStore((s) => s.session);
  const userId = session?.userId ?? null;
  const loggedIn = Boolean(session?.loggedIn);

  const sessions = useWatchingStore((s) => s.sessions);
  const slotChannels = useWatchingStore((s) => s.slotChannels);
  const activeChatChannel = useWatchingStore((s) => s.activeChatChannel);
  const launchError = useWatchingStore((s) => s.error);
  const watchStream = useWatchingStore((s) => s.watchStream);
  const stopSession = useWatchingStore((s) => s.stopSession);
  const stopAll = useWatchingStore((s) => s.stopAll);
  const toggleMute = useWatchingStore((s) => s.toggleMute);
  const reorderSlots = useWatchingStore((s) => s.reorderSlots);
  const setActiveChat = useWatchingStore((s) => s.setActiveChat);
  const applyLayout = useWatchingStore((s) => s.applyLayout);
  const refresh = useWatchingStore((s) => s.refresh);

  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const chatProvider = settings.chat.provider;
  const multi = !settings.streaming.seamlessSwitch;

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(id);
  }, [query]);

  const follows = useQuery({
    queryKey: ["followed-channel-logins", userId],
    enabled: loggedIn && Boolean(userId),
    queryFn: () => getFollowedChannelLogins(userId!),
    staleTime: 5 * 60_000,
  });
  const followedSet = useMemo(
    () => new Set(follows.data ?? []),
    [follows.data],
  );

  const search = useQuery({
    queryKey: ["multistream-search", debounced],
    enabled: loggedIn && debounced.length >= 2,
    queryFn: () => searchChannels(debounced),
  });

  const followedLive = useQuery({
    queryKey: ["multistream-followed-live", userId],
    enabled: loggedIn && Boolean(userId) && debounced.length < 2,
    queryFn: () => getFollowedStreams(userId!),
    staleTime: 20_000,
  });

  const sessionByChannel = useMemo(() => {
    const map = new Map<string, StreamSession>();
    for (const s of sessions) {
      map.set(s.channel.toLowerCase(), s);
    }
    return map;
  }, [sessions]);

  const runningCount = sessions.filter((s) => s.running).length;
  const cap = layoutCapacity(
    isMultistreamLayout(settings.streaming.multistreamLayout)
      ? settings.streaming.multistreamLayout
      : "2x2",
  );
  const layoutFull = runningCount >= cap;

  const addChannel = (login: string, title = "", game = "") => {
    void watchStream(streamLike(login, title, game)).catch(() => undefined);
  };

  const results = search.data?.data ?? [];
  const followedResults = results.filter((ch) =>
    followedSet.has(ch.broadcaster_login.toLowerCase()),
  );
  const otherResults = results.filter(
    (ch) => !followedSet.has(ch.broadcaster_login.toLowerCase()),
  );

  const isAdded = (login: string) =>
    slotChannels.includes(login.toLowerCase());

  const renderResult = (ch: HelixChannel) => {
    const added = isAdded(ch.broadcaster_login);
    return (
      <li key={ch.id} className="ms-result">
        {ch.thumbnail_url ? (
          <img
            src={ch.thumbnail_url}
            alt=""
            className="ms-result__thumb"
            loading="lazy"
          />
        ) : null}
        <div className="ms-result__body">
          <strong>
            {ch.display_name}
            {ch.is_live ? (
              <span className="badge badge--live" style={{ marginLeft: "0.5rem" }}>
                {t("multistream:live")}
              </span>
            ) : (
              <span className="muted" style={{ marginLeft: "0.5rem" }}>
                {t("multistream:offline")}
              </span>
            )}
          </strong>
          <span className="ms-result__title">
            {ch.game_name ? `${ch.game_name} · ` : ""}
            {ch.title}
          </span>
        </div>
        <button
          type="button"
          className="button-secondary"
          disabled={added || layoutFull}
          onClick={() => addChannel(ch.broadcaster_login, ch.title, ch.game_name)}
        >
          {added ? t("multistream:added") : t("multistream:add")}
        </button>
      </li>
    );
  };

  if (!multi) {
    return (
      <section className="page">
        <header className="page__header">
          <div>
            <h1>{t("multistream:title")}</h1>
            <p className="page__lede">{t("multistream:lede")}</p>
          </div>
        </header>
        <p className="muted">{t("multistream:seamlessNote")}</p>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>{t("multistream:title")}</h1>
          <p className="page__lede">{t("multistream:lede")}</p>
        </div>
        {sessions.length ? (
          <button
            type="button"
            className="button-secondary"
            onClick={() => void stopAll()}
          >
            {t("multistream:stopAll")}
          </button>
        ) : null}
      </header>

      <div className="ms-section">
        <label className="settings__row" style={{ maxWidth: "22rem" }}>
          <span>{t("multistream:layoutLabel")}</span>
          <select
            value={settings.streaming.multistreamLayout}
            onChange={(e) => {
              const value = e.target.value;
              if (!isMultistreamLayout(value)) return;
              if (runningCount > layoutCapacity(value)) {
                useWatchingStore.setState({
                  error: `Layout holds ${layoutCapacity(value)} streams. Stop extras first.`,
                });
                return;
              }
              setSettings({
                streaming: { ...settings.streaming, multistreamLayout: value },
              });
              applyLayout();
            }}
          >
            {MULTISTREAM_LAYOUTS.map((layout) => (
              <option key={layout} value={layout}>
                {t(`settings:layout${layout}`)}
              </option>
            ))}
          </select>
        </label>
        {isUnevenLayout(settings.streaming.multistreamLayout) ? (
          <label className="settings__row" style={{ maxWidth: "22rem" }}>
            <span>{t("settings:unevenMainSide")}</span>
            <select
              value={settings.streaming.unevenMainSide}
              onChange={(e) => {
                const value = e.target.value;
                if (!isUnevenMainSide(value)) return;
                setSettings({
                  streaming: { ...settings.streaming, unevenMainSide: value },
                });
                applyLayout();
              }}
            >
              {UNEVEN_MAIN_SIDES.map((side) => (
                <option key={side} value={side}>
                  {t(
                    `settings:mainSide${side[0]!.toUpperCase()}${side.slice(1)}`,
                  )}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <p className="muted ms-slots-meta">
          {t("multistream:slotsUsed", { used: runningCount, cap })}
          {layoutFull ? ` — ${t("multistream:layoutFull")}` : ""}
        </p>
        {launchError ? <p className="muted">{launchError}</p> : null}
      </div>

      <div className="ms-section">
        <div className="ms-section__head">
          <h2>{t("multistream:currentStreams")}</h2>
          <span className="muted">{t("multistream:dragHint")}</span>
        </div>
        {!slotChannels.length ? (
          <p className="muted">{t("multistream:currentEmpty")}</p>
        ) : (
          <ul className="ms-slots">
            {slotChannels.map((channel, index) => {
              const s = sessionByChannel.get(channel);
              const chatActive =
                (activeChatChannel ?? slotChannels[0]) === channel;
              return (
                <li
                  key={channel}
                  className={[
                    "ms-slot",
                    dragIndex === index ? "ms-slot--dragging" : "",
                    overIndex === index && dragIndex !== index
                      ? "ms-slot--dragover"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setOverIndex(index);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null && dragIndex !== index) {
                      const next = [...slotChannels];
                      const [moved] = next.splice(dragIndex, 1);
                      next.splice(index, 0, moved!);
                      reorderSlots(next);
                    }
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  onDragLeave={() => {
                    if (overIndex === index) setOverIndex(null);
                  }}
                >
                  <span
                    className="ms-slot__handle"
                    draggable
                    onDragStart={(e) => {
                      // HTML5 DnD requires payload data, otherwise Chromium
                      // (WebView2) shows the "not-allowed" cursor.
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", channel);
                      setDragIndex(index);
                    }}
                    onDragEnd={() => {
                      setDragIndex(null);
                      setOverIndex(null);
                    }}
                    aria-hidden
                  >
                    ⋮⋮
                  </span>
                  <div className="ms-slot__meta">
                    <div>
                      <span className="muted">#{index + 1} </span>
                      <strong>{s?.channel ?? channel}</strong>
                      {s ? (
                        <span className="muted">
                          {" "}
                          · {s.quality}
                          {s.game ? ` · ${s.game}` : ""}
                        </span>
                      ) : null}
                    </div>
                    {s?.status ? (
                      <p className="ms-slot__status" title={s.status}>
                        {s.status}
                      </p>
                    ) : null}
                  </div>
                  <div className="ms-slot__actions">
                    {chatProvider === "embedded" ? (
                      <button
                        type="button"
                        className={`button-secondary${chatActive ? " ms-chat-active" : ""}`}
                        aria-pressed={chatActive}
                        onClick={() => setActiveChat(channel)}
                      >
                        {chatActive
                          ? t("multistream:chatActive")
                          : t("multistream:chatPick")}
                      </button>
                    ) : null}
                    {s ? (
                      <>
                        <button
                          type="button"
                          className={`button-secondary${s.muted ? " ms-muted" : ""}`}
                          aria-pressed={Boolean(s.muted)}
                          title={
                            s.muted
                              ? t("multistream:unmute")
                              : t("multistream:mute")
                          }
                          onClick={() => void toggleMute(s.id)}
                        >
                          {s.muted
                            ? t("multistream:unmute")
                            : t("multistream:mute")}
                        </button>
                        <button
                          type="button"
                          onClick={() => void stopSession(s.id)}
                        >
                          {t("multistream:stop")}
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {chatProvider === "chatterino" && slotChannels.length ? (
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            {t("multistream:chatterinoNote")}
          </p>
        ) : null}
      </div>

      <div className="ms-section">
        <div className="ms-section__head">
          <h2>{t("multistream:searchTitle")}</h2>
        </div>
        {!loggedIn ? (
          <p className="muted">{t("multistream:loginRequired")}</p>
        ) : (
          <>
            <input
              type="search"
              className="search-hero__input"
              style={{ maxWidth: "26rem", marginBottom: "0.75rem" }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("multistream:searchPlaceholder")}
              aria-label={t("multistream:searchTitle")}
            />
            {debounced.length < 2 ? (
              <>
                <p className="muted">{t("multistream:searchMinChars")}</p>
                <div className="ms-divider">
                  {t("multistream:followedLiveTitle")}
                </div>
                {followedLive.data?.data.length ? (
                  <ul className="ms-live-grid">
                    {followedLive.data.data.map((s) => {
                      const added = isAdded(s.user_login);
                      return (
                        <li key={s.id} className="ms-live-card">
                          <img
                            src={streamThumbnail(s.thumbnail_url, 320, 180)}
                            alt=""
                            className="ms-live-card__thumb"
                            loading="lazy"
                          />
                          <div className="ms-live-card__row">
                            <span className="ms-live-card__name">
                              {s.user_name}
                            </span>
                            <button
                              type="button"
                              className="button-secondary"
                              disabled={added || layoutFull}
                              onClick={() =>
                                addChannel(s.user_login, s.title, s.game_name)
                              }
                            >
                              {added
                                ? t("multistream:added")
                                : t("multistream:add")}
                            </button>
                          </div>
                          <span className="ms-result__title">
                            {s.game_name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="muted">
                    {followedLive.isLoading
                      ? t("common:loading")
                      : t("multistream:followedEmpty")}
                  </p>
                )}
              </>
            ) : (
              <>
                {followedResults.length ? (
                  <>
                    <div className="ms-divider">
                      {t("multistream:followedSection")}
                    </div>
                    <ul className="ms-results">
                      {followedResults.map(renderResult)}
                    </ul>
                  </>
                ) : null}
                <div className="ms-divider">
                  {t("multistream:allSection")}
                </div>
                {otherResults.length ? (
                  <ul className="ms-results">{otherResults.map(renderResult)}</ul>
                ) : (
                  <p className="muted">
                    {search.isFetching
                      ? t("common:loading")
                      : followedResults.length
                        ? ""
                        : t("routes:searchEmpty")}
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
