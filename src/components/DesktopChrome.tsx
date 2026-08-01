import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { invoke, isTauri } from "../lib/tauri";
import { useAuthStore } from "../lib/auth/store";
import { useSettingsStore } from "../lib/settings/store";
import { getFollowedStreams } from "../lib/twitch/helix";
import { shouldNotifyFollowedLive } from "../lib/notifications/followedLive";

/**
 * Desktop-only chrome: tray icon, close-to-tray, followed-live notifications.
 */
export function DesktopChrome() {
  const { t } = useTranslation(["common", "routes"]);
  const closeToTray = useSettingsStore((s) => s.settings.gui.closeToTray);
  const notifyFollowed = useSettingsStore(
    (s) => s.settings.notifications.followedOnline,
  );
  const mutedFollowed = useSettingsStore(
    (s) => s.settings.notifications.mutedFollowed,
  );
  const hydrated = useSettingsStore((s) => s.hydrated);
  const session = useAuthStore((s) => s.session);
  const knownLive = useRef<Set<string>>(new Set());
  const primed = useRef(false);
  const closeToTrayRef = useRef(closeToTray);
  closeToTrayRef.current = closeToTray;

  useEffect(() => {
    if (!isTauri() || !hydrated) return;
    let unlistenClose: (() => void) | undefined;
    let disposed = false;

    void (async () => {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const { TrayIcon } = await import("@tauri-apps/api/tray");
      const { Menu } = await import("@tauri-apps/api/menu");
      const { defaultWindowIcon } = await import("@tauri-apps/api/app");

      if (disposed) return;

      const win = getCurrentWindow();
      const showWindow = async () => {
        await win.show();
        await win.unminimize();
        await win.setFocus();
      };

      const menu = await Menu.new({
        items: [
          {
            id: "show",
            text: t("common:appNameShort"),
            action: () => {
              void showWindow();
            },
          },
          {
            id: "quit",
            text: t("common:quit"),
            action: () => {
              void invoke("app_quit");
            },
          },
        ],
      });

      const icon = await defaultWindowIcon();
      try {
        await TrayIcon.new({
          id: "main-tray",
          icon: icon ?? undefined,
          tooltip: t("common:appName"),
          menu,
          menuOnLeftClick: false,
          action: (event) => {
            if (
              event.type === "Click" &&
              event.button === "Left" &&
              event.buttonState === "Up"
            ) {
              void showWindow();
            }
          },
        });
      } catch {
        // Tray may already exist after HMR; ignore.
      }

      unlistenClose = await win.onCloseRequested(async (event) => {
        if (closeToTrayRef.current) {
          event.preventDefault();
          await win.hide();
        }
      });
    })();

    return () => {
      disposed = true;
      unlistenClose?.();
    };
  }, [hydrated, t]);

  const followedQuery = useQuery({
    queryKey: ["followed-streams-notify", session?.userId],
    enabled:
      isTauri() &&
      notifyFollowed &&
      Boolean(session?.loggedIn && session.userId),
    queryFn: () => getFollowedStreams(session!.userId!),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  useEffect(() => {
    primed.current = false;
    knownLive.current = new Set();
  }, [session?.userId]);

  useEffect(() => {
    if (!notifyFollowed || !followedQuery.data) return;
    const next = new Set(
      followedQuery.data.data.map((s) => s.user_login.toLowerCase()),
    );

    if (!primed.current) {
      knownLive.current = next;
      primed.current = true;
      return;
    }

    const newlyLive = [...next]
      .filter((login) => !knownLive.current.has(login))
      .filter((login) =>
        shouldNotifyFollowedLive(login, {
          followedOnline: notifyFollowed,
          mutedFollowed,
        }),
      );
    knownLive.current = next;

    if (!newlyLive.length || !isTauri()) return;

    void (async () => {
      const {
        isPermissionGranted,
        requestPermission,
        sendNotification,
      } = await import("@tauri-apps/plugin-notification");

      let granted = await isPermissionGranted();
      if (!granted) {
        granted = (await requestPermission()) === "granted";
      }
      if (!granted) return;

      for (const login of newlyLive.slice(0, 3)) {
        const stream = followedQuery.data.data.find(
          (s) => s.user_login.toLowerCase() === login,
        );
        sendNotification({
          title: t("routes:notifyLiveTitle", {
            channel: stream?.user_name ?? login,
          }),
          body: stream?.title ?? t("routes:notifyLiveBody"),
        });
      }
    })();
  }, [followedQuery.data, mutedFollowed, notifyFollowed, t]);

  return null;
}
