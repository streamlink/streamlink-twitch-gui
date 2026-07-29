import { create } from "zustand";
import { listen } from "@tauri-apps/api/event";
import { invoke, isTauri } from "../tauri";
import type { HelixStream } from "../twitch/helix";
import { useSettingsStore } from "../settings/store";
import { resolveChannelLaunch } from "../settings/types";
import { captureAppError } from "../sentry";

export interface StreamSession {
  id: string;
  channel: string;
  quality: string;
  title?: string | null;
  game?: string | null;
  running: boolean;
  status?: string;
  phase?: string;
  ready?: boolean;
}

export interface StreamStatusEvent {
  id: string;
  channel: string;
  line: string;
  status: string;
  phase: string;
  ready: boolean;
}

interface WatchingState {
  sessions: StreamSession[];
  activeChatChannel: string | null;
  error: string | null;
  refresh: () => Promise<void>;
  watchStream: (stream: HelixStream) => Promise<void>;
  stopSession: (id: string) => Promise<void>;
  stopAll: () => Promise<void>;
  setActiveChat: (channel: string | null) => void;
  applyStatus: (payload: StreamStatusEvent) => void;
}

let listenersBound = false;

export async function bindStreamingListeners(): Promise<() => void> {
  if (!isTauri() || listenersBound) {
    return () => undefined;
  }
  listenersBound = true;
  const unStatus = await listen<StreamStatusEvent>("stream-status", (event) => {
    useWatchingStore.getState().applyStatus(event.payload);
  });
  const unChanged = await listen("stream-sessions-changed", () => {
    void useWatchingStore.getState().refresh();
  });
  return () => {
    listenersBound = false;
    unStatus();
    unChanged();
  };
}

export const useWatchingStore = create<WatchingState>((set, get) => ({
  sessions: [],
  activeChatChannel: null,
  error: null,

  refresh: async () => {
    const sessions = await invoke<StreamSession[]>("stream_list");
    set({ sessions });
    const active = get().activeChatChannel;
    if (active && !sessions.some((s) => s.channel === active)) {
      set({ activeChatChannel: sessions[0]?.channel ?? null });
    }
  },

  applyStatus: (payload) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === payload.id
          ? {
              ...session,
              status: payload.status,
              phase: payload.phase,
              ready: payload.ready,
            }
          : session,
      ),
    }));
  },

  watchStream: async (stream) => {
    set({ error: null });
    const settings = useSettingsStore.getState().settings;
    const launch = resolveChannelLaunch(settings, stream.user_login);
    const replaceExisting =
      settings.streaming.seamlessSwitch && get().sessions.some((s) => s.running);
    try {
      const session = await invoke<StreamSession>("stream_start", {
        request: {
          channel: stream.user_login,
          quality: launch.quality,
          title: stream.title,
          game: stream.game_name,
          streamlinkSource: settings.streamlink.source,
          streamlinkCustomPath: settings.streamlink.customPath,
          playerId: launch.playerId,
          playerCustomPath: settings.player.customPath,
          playerCustomArgs: launch.playerCustomArgs,
          lowLatency: launch.lowLatency,
          disableAds: launch.disableAds,
          playerInput: settings.player.input,
          webbrowser: settings.streaming.webbrowser,
          webbrowserHeadless: settings.streaming.webbrowserHeadless,
          webbrowserExecutable: settings.streaming.webbrowserExecutable,
          retryStreams: settings.streaming.retryStreams,
          retryMax: settings.streaming.retryMax,
          playerNoClose: settings.streaming.playerNoClose,
          openChat: true,
          chatProvider: settings.chat.provider,
          replaceExisting,
        },
      });
      if (settings.gui.minimizeOnWatch && isTauri()) {
        void import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
          void getCurrentWindow().minimize();
        });
      }
      set((state) => ({
        sessions: [
          ...state.sessions.filter((s) => s.id !== session.id),
          session,
        ],
        activeChatChannel:
          settings.chat.provider === "embedded"
            ? stream.user_login
            : state.activeChatChannel,
      }));
      // Keep list honest while dual-process handoff may still be running.
      void get().refresh();
    } catch (err) {
      captureAppError(err, "stream_start");
      set({
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },

  stopSession: async (id) => {
    await invoke("stream_stop", { id });
    await get().refresh();
  },

  stopAll: async () => {
    await invoke("stream_stop_all");
    set({ sessions: [], activeChatChannel: null });
  },

  setActiveChat: (channel) => set({ activeChatChannel: channel }),
}));
