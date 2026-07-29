import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { HelixChannel } from "../lib/twitch/helix";
import "./ChannelResults.css";

interface ChannelResultsProps {
  channels: HelixChannel[];
}

export function ChannelResults({ channels }: ChannelResultsProps) {
  const { t } = useTranslation("routes");

  if (!channels.length) {
    return <p className="muted">{t("searchEmpty")}</p>;
  }

  return (
    <ul className="channel-results">
      {channels.map((ch) => (
        <li key={ch.id}>
          <Link
            to={`/channel/${ch.broadcaster_login}`}
            className="channel-result"
          >
            <div className="channel-result__media">
              <img
                src={ch.thumbnail_url}
                alt=""
                className="channel-result__thumb"
                loading="lazy"
              />
              {ch.is_live ? (
                <span className="badge badge--live">{t("liveBadge")}</span>
              ) : null}
            </div>
            <div className="channel-result__body">
              <span className="channel-result__name">{ch.display_name}</span>
              <span className="channel-result__login">
                @{ch.broadcaster_login}
              </span>
              <span className="channel-result__meta">
                {ch.is_live
                  ? ch.game_name || ch.title
                  : ch.title || t("channelOffline")}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
