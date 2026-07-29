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

function PlayIcon() {
  return (
    <svg
      className="stream-item__play-icon"
      viewBox="0 0 24 24"
      width="28"
      height="28"
      aria-hidden
    >
      <path fill="currentColor" d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

export function StreamGrid({ streams, onWatch }: StreamGridProps) {
  const { t } = useTranslation(["common", "routes"]);

  return (
    <div className="stream-grid">
      {streams.map((stream) => (
        <article key={stream.id} className="stream-item">
          <header className="stream-item__channel">
            <Link to={`/channel/${stream.user_login}`}>{stream.user_name}</Link>
          </header>

          <div className="stream-item__preview">
            <Link
              to={`/channel/${stream.user_login}`}
              className="stream-item__thumb-link"
              tabIndex={-1}
            >
              <img
                className="stream-item__thumb"
                src={streamThumbnail(stream.thumbnail_url)}
                alt=""
                loading="lazy"
              />
            </Link>

            <span className="badge badge--live stream-item__live">
              {t("routes:liveBadge")}
            </span>

            <span className="stream-item__viewers-chip">
              {formatViewers(stream.viewer_count)}
            </span>

            <button
              type="button"
              className="stream-item__play"
              onClick={() => onWatch?.(stream)}
              aria-label={t("common:watch")}
              title={t("common:watch")}
            >
              <PlayIcon />
            </button>

            <div className="stream-item__shade">
              <p className="stream-item__title">{stream.title}</p>
            </div>
          </div>

          <footer className="stream-item__meta">
            <span className="stream-item__game" title={stream.game_name}>
              {stream.game_name || "—"}
            </span>
          </footer>
        </article>
      ))}
    </div>
  );
}
