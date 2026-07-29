import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { streamThumbnail, type HelixStream } from "../lib/twitch/helix";
import "./StreamGrid.css";

interface StreamGridProps {
  streams: HelixStream[];
  onWatch?: (stream: HelixStream) => void;
}

function formatViewers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(count >= 10_000 ? 0 : 1)}K`;
  }
  return String(count);
}

export function StreamGrid({ streams, onWatch }: StreamGridProps) {
  const { t } = useTranslation(["common", "routes"]);

  return (
    <div className="stream-grid">
      {streams.map((stream) => (
        <article key={stream.id} className="stream-card">
          <Link
            to={`/channel/${stream.user_login}`}
            className="stream-card__thumb-link"
          >
            <img
              className="stream-card__thumb"
              src={streamThumbnail(stream.thumbnail_url)}
              alt=""
              loading="lazy"
            />
            <span className="badge badge--live stream-card__live">
              {t("routes:liveBadge")}
            </span>
            <span className="stream-card__viewers">
              {formatViewers(stream.viewer_count)}
            </span>
          </Link>
          <div className="stream-card__body">
            <h2 className="stream-card__title">{stream.title}</h2>
            <p className="stream-card__meta">
              <Link to={`/channel/${stream.user_login}`}>{stream.user_name}</Link>
            </p>
            <p className="stream-card__game">{stream.game_name}</p>
            <button type="button" onClick={() => onWatch?.(stream)}>
              {t("common:watch")}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
