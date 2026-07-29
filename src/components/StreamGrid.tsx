import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { streamThumbnail, type HelixStream } from "../lib/twitch/helix";
import "./StreamGrid.css";

interface StreamGridProps {
  streams: HelixStream[];
  onWatch?: (stream: HelixStream) => void;
}

export function StreamGrid({ streams, onWatch }: StreamGridProps) {
  const { t } = useTranslation("common");

  return (
    <div className="stream-grid">
      {streams.map((stream) => (
        <article key={stream.id} className="stream-card">
          <Link to={`/channel/${stream.user_login}`} className="stream-card__thumb-link">
            <img
              className="stream-card__thumb"
              src={streamThumbnail(stream.thumbnail_url)}
              alt=""
              loading="lazy"
            />
          </Link>
          <div className="stream-card__body">
            <h2 className="stream-card__title">{stream.title}</h2>
            <p className="stream-card__meta">
              <Link to={`/channel/${stream.user_login}`}>{stream.user_name}</Link>
              {" · "}
              {stream.game_name} · {stream.viewer_count}
            </p>
            <button type="button" onClick={() => onWatch?.(stream)}>
              {t("watch")}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
