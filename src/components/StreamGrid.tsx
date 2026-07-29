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
          <img
            className="stream-card__thumb"
            src={streamThumbnail(stream.thumbnail_url)}
            alt=""
            loading="lazy"
          />
          <div className="stream-card__body">
            <h2 className="stream-card__title">{stream.title}</h2>
            <p className="stream-card__meta">
              {stream.user_name} · {stream.game_name} · {stream.viewer_count}
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
