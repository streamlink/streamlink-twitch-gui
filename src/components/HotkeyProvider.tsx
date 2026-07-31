import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { invoke, isTauri } from "../lib/tauri";
import { useSettingsStore } from "../lib/settings/store";
import { useWatchingStore } from "../lib/streaming/store";
import { isTypingTarget, matchesHotkey } from "../lib/hotkeys";

export function HotkeyProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hotkeys = useSettingsStore((s) => s.settings.hotkeys);
  const stopAll = useWatchingStore((s) => s.stopAll);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const typing = isTypingTarget(e.target);

      if (matchesHotkey(e, hotkeys.refresh) && !typing) {
        e.preventDefault();
        void queryClient.invalidateQueries();
        return;
      }
      if (matchesHotkey(e, hotkeys.focusSearch)) {
        e.preventDefault();
        navigate("/search");
        window.setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>(
            ".search-hero__input",
          );
          input?.focus();
          input?.select();
        }, 50);
        return;
      }
      if (matchesHotkey(e, hotkeys.openSettings) && !typing) {
        e.preventDefault();
        navigate("/settings");
        return;
      }
      if (matchesHotkey(e, hotkeys.stopAll) && !typing) {
        e.preventDefault();
        void stopAll();
        return;
      }
      if (matchesHotkey(e, hotkeys.cycleDockMonitor) && !typing && isTauri()) {
        e.preventDefault();
        void invoke("dock_cycle_monitor");
        return;
      }
      if (matchesHotkey(e, hotkeys.quit) && !typing && isTauri()) {
        e.preventDefault();
        void invoke("app_quit");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hotkeys, navigate, queryClient, stopAll]);

  return children;
}
