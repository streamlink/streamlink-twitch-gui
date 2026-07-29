import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { HelixStream } from "../twitch/helix";
import { useSettingsStore } from "../settings/store";

export interface StreamSession {
  id: string;
  channel: string;
  quality: string;
  title?: string | null;
  game?: string | null;
  running: boolean;
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

  watchStream: async (stream) => {
    set({ error: null });
    const settings = useSettingsStore.getState().settings;
    try {
      const session = await invoke<StreamSession>("stream_start", {
        request: {
          channel: stream.user_login,
          quality: settings.streaming.quality,
          title: stream.title,
          game: stream.game_name,
          streamlinkSource: settings.streamlink.source,
          streamlinkCustomPath: settings.streamlink.customPath,
          playerId: settings.player.id,
          playerCustomPath: settings.player.customPath,
          playerCustomArgs: settings.player.customArgs,
          lowLatency: settings.streaming.lowLatency,
          webbrowser: settings.streaming.webbrowser,
          webbrowserHeadless: settings.streaming.webbrowserHeadless,
          webbrowserExecutable: settings.streaming.webbrowserExecutable,
          retryStreams: settings.streaming.retryStreams,
          retryMax: settings.streaming.retryMax,
          playerNoClose: settings.streaming.playerNoClose,
          openChat: true,
          chatProvider: settings.chat.provider,
        },
      });
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
    } catch (err) {
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
