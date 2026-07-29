import { useTranslation } from "react-i18next";
import "./EmbeddedChat.css";

interface EmbeddedChatProps {
  channel: string | null;
}

export function EmbeddedChat({ channel }: EmbeddedChatProps) {
  const { t } = useTranslation("routes");

  if (!channel) {
    return (
      <aside className="embedded-chat embedded-chat--empty">
        <p className="muted">{t("chatEmpty")}</p>
      </aside>
    );
  }

  const src = `https://www.twitch.tv/embed/${encodeURIComponent(channel)}/chat?parent=localhost&parent=tauri.localhost&parent=127.0.0.1&darkpopout`;

  return (
    <aside className="embedded-chat">
      <header className="embedded-chat__header">
        {t("chatTitle", { channel })}
      </header>
      <iframe
        className="embedded-chat__frame"
        title={t("chatTitle", { channel })}
        src={src}
        allow="clipboard-write"
      />
    </aside>
  );
}
