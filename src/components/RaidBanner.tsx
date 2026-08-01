import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { listen } from "@tauri-apps/api/event";
import { isTauri } from "../lib/tauri";
import {
  enqueueRaid,
  raidDedupeKey,
  type RaidOutgoingEvent,
} from "../lib/streaming/raid";
import { useWatchingStore } from "../lib/streaming/store";
import { useSettingsStore } from "../lib/settings/store";
import "./RaidBanner.css";

const COUNTDOWN_SECS = 15;

/**
 * Listens for `raid-outgoing` from Rust EventSub. Shows a 15s cancellable
 * prompt, then replaces only that watching slot via `followRaid`.
 */
export function RaidBanner() {
  const { t } = useTranslation("common");
  const [queue, setQueue] = useState<RaidOutgoingEvent[]>([]);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECS);
  const active = queue[0] ?? null;
  const cooldownRef = useRef<Set<string>>(new Set());
  const followingRef = useRef(false);
  const sessions = useWatchingStore((s) => s.sessions);
  const followRaids = useSettingsStore((s) => s.settings.streaming.followRaids);

  useEffect(() => {
    if (!isTauri()) return;
    let unlisten: (() => void) | undefined;
    void listen<RaidOutgoingEvent>("raid-outgoing", (event) => {
      if (!useSettingsStore.getState().settings.streaming.followRaids) return;
      const payload = event.payload;
      if (!payload?.fromChannel || !payload?.toChannel) return;
      const key = raidDedupeKey(payload);
      if (cooldownRef.current.has(key)) return;
      setQueue((q) => enqueueRaid(q, payload));
    }).then((fn) => {
      unlisten = fn;
    });
    return () => unlisten?.();
  }, []);

  // Drop prompt if the raiding session is already gone.
  useEffect(() => {
    if (!active) return;
    const still = sessions.some(
      (s) => s.running && s.channel.toLowerCase() === active.fromChannel,
    );
    if (!still) {
      setQueue((q) => q.slice(1));
      setSeconds(COUNTDOWN_SECS);
    }
  }, [sessions, active]);

  useEffect(() => {
    if (!active || !followRaids) return;
    setSeconds(COUNTDOWN_SECS);
    const tick = window.setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [active?.fromChannel, active?.toChannel, followRaids]);

  useEffect(() => {
    if (!active || seconds > 0 || followingRef.current) return;
    void accept();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- accept closes over active
  }, [seconds, active]);

  async function accept() {
    if (!active || followingRef.current) return;
    followingRef.current = true;
    const key = raidDedupeKey(active);
    cooldownRef.current.add(key);
    window.setTimeout(() => cooldownRef.current.delete(key), 60_000);
    try {
      await useWatchingStore.getState().followRaid(active);
    } catch {
      // error already in store
    } finally {
      followingRef.current = false;
      setQueue((q) => q.slice(1));
      setSeconds(COUNTDOWN_SECS);
    }
  }

  function stay() {
    if (!active) return;
    const key = raidDedupeKey(active);
    cooldownRef.current.add(key);
    window.setTimeout(() => cooldownRef.current.delete(key), 60_000);
    setQueue((q) => q.slice(1));
    setSeconds(COUNTDOWN_SECS);
  }

  if (!active || !followRaids) return null;

  return (
    <div className="raid-banner" role="status">
      <div className="raid-banner__text">
        <strong>
          {t("raidBannerTitle", {
            from: active.fromChannel,
            to: active.toChannel,
          })}
        </strong>
        <span className="muted">
          {t("raidBannerBody", { seconds })}
        </span>
      </div>
      <div className="raid-banner__actions">
        <button type="button" className="button-primary" onClick={() => void accept()}>
          {t("raidFollowNow")}
        </button>
        <button type="button" className="button-secondary" onClick={stay}>
          {t("raidStay")}
        </button>
      </div>
    </div>
  );
}
