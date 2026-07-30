import { create } from "zustand";
import { listen } from "@tauri-apps/api/event";
import { invoke, isTauri } from "../tauri";
import type { HelixStream } from "../twitch/helix";
import { useSettingsStore } from "../settings/store";
import { resolveChannelLaunch } from "../settings/types";
import { captureAppError } from "../sentry";
import {
  DEFAULT_MULTISTREAM_LAYOUT,
  isMultistreamLayout,
  layoutCapacity,
  type MultistreamLayout,
} from "./layout";

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
  /** Ordered multistream slots (lowercase logins). Ignored when seamless is on. */
  slotChannels: string[];
  activeChatChannel: string | null;
  error: string | null;
  refresh: () => Promise<void>;
  watchStream: (stream: HelixStream) => Promise<void>;
  stopSession: (id: string) => Promise<void>;
  stopAll: () => Promise<void>;
  moveSlot: (channel: string, direction: -1 | 1) => void;
  /** Drag & drop reorder: replace the slot order outright (same channels). */
  reorderSlots: (channels: string[]) => void;
  /** Retile + resync chat after layout preset changes. */
  applyLayout: () => void;
  setActiveChat: (channel: string | null) => void;
  applyStatus: (payload: StreamStatusEvent) => void;
}

let listenersBound = false;
let lastChatSyncKey = "";
let layoutTimer: ReturnType<typeof setTimeout> | null = null;

function currentLayout(): MultistreamLayout {
  const raw = useSettingsStore.getState().settings.streaming.multistreamLayout;
  return isMultistreamLayout(raw) ? raw : DEFAULT_MULTISTREAM_LAYOUT;
}

function orderedChannels(): string[] {
  const state = useWatchingStore.getState();
  const settings = useSettingsStore.getState().settings;
  if (settings.streaming.seamlessSwitch) {
    return state.sessions
      .filter((s) => s.running)
      .map((s) => s.channel.toLowerCase())
      .filter(Boolean);
  }
  const running = new Set(
    state.sessions
      .filter((s) => s.running)
      .map((s) => s.channel.toLowerCase()),
  );
  return state.slotChannels.filter((c) => running.has(c));
}

function syncSlotsFromSessions(sessions: StreamSession[]) {
  const settings = useSettingsStore.getState().settings;
  if (settings.streaming.seamlessSwitch) {
    useWatchingStore.setState({ slotChannels: [] });
    return;
  }
  const running = sessions
    .filter((s) => s.running)
    .map((s) => s.channel.toLowerCase())
    .filter(Boolean);
  const prev = useWatchingStore.getState().slotChannels;
  const kept = prev.filter((c) => running.includes(c));
  const added = running.filter((c) => !kept.includes(c));
  useWatchingStore.setState({ slotChannels: [...kept, ...added] });
}

async function syncChatterino(channels: string[]) {
  if (!isTauri()) return;
  const settings = useSettingsStore.getState().settings;
  if (settings.chat.provider !== "chatterino") return;
  if (!channels.length) {
    lastChatSyncKey = "";
    void invoke("close_owned_chatterino").catch(() => undefined);
    return;
  }
  const key = channels.join(",");
  if (key === lastChatSyncKey) return;
  lastChatSyncKey = key;
  void invoke<string>("open_chatterino_chat", { channels }).catch(
    (err: unknown) => {
      useWatchingStore.setState({
        error:
          err instanceof Error
            ? err.message
            : `Chatterino failed to open: ${String(err)}`,
      });
    },
  );
}

function scheduleLayoutAfterReady() {
  if (!isTauri()) return;
  if (layoutTimer) clearTimeout(layoutTimer);
  layoutTimer = setTimeout(() => {
    layoutTimer = null;
    const settings = useSettingsStore.getState().settings;
    const reserveChat = settings.chat.provider === "chatterino";
    const channels = orderedChannels();
    if (!channels.length) return;
    void invoke("layout_watching", {
      channels,
      reserveChat,
      layout: currentLayout(),
    }).catch(() => undefined);
  }, 100);
}

function afterSessionsChanged() {
  const channels = orderedChannels();
  void syncChatterino(channels);
  if (channels.length) {
    scheduleLayoutAfterReady();
  }
}

export async function bindStreamingListeners(): Promise<() => void> {
  if (!isTauri() || listenersBound) {
    return () => undefined;
  }
  listenersBound = true;
  const unStatus = await listen<StreamStatusEvent>("stream-status", (event) => {
    useWatchingStore.getState().applyStatus(event.payload);
  });
  const unChanged = await listen("stream-sessions-changed", () => {
    void useWatchingStore.getState().refresh().then(() => {
      afterSessionsChanged();
    });
  });
  return () => {
    listenersBound = false;
    unStatus();
    unChanged();
  };
}

export const useWatchingStore = create<WatchingState>((set, get) => ({
  sessions: [],
  slotChannels: [],
  activeChatChannel: null,
  error: null,

  refresh: async () => {
    const sessions = await invoke<StreamSession[]>("stream_list");
    syncSlotsFromSessions(sessions);
    const hadSessions = get().sessions.length > 0;
    set({ sessions });
    const active = get().activeChatChannel;
    if (active && !sessions.some((s) => s.channel === active)) {
      set({ activeChatChannel: sessions[0]?.channel ?? null });
    }
    // minimizeOnWatch hid the app while watching — bring it back once the
    // last stream ended (e.g. the user closed the player window).
    if (
      hadSessions &&
      sessions.length === 0 &&
      useSettingsStore.getState().settings.gui.minimizeOnWatch &&
      isTauri()
    ) {
      void import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
        const win = getCurrentWindow();
        void win.unminimize().then(() => win.setFocus());
      });
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
    if (payload.ready) {
      scheduleLayoutAfterReady();
    }
  },

  watchStream: async (stream) => {
    set({ error: null });
    const settings = useSettingsStore.getState().settings;
    const multi = !settings.streaming.seamlessSwitch;
    const channel = stream.user_login.toLowerCase();
    const running = get().sessions.filter((s) => s.running);
    const already = running.some((s) => s.channel.toLowerCase() === channel);

    if (multi && !already) {
      const cap = layoutCapacity(currentLayout());
      const slots = get().slotChannels.filter((c) =>
        running.some((s) => s.channel.toLowerCase() === c),
      );
      if (slots.length >= cap) {
        const msg = `Layout holds ${cap} streams. Stop one or pick a larger layout.`;
        set({ error: msg });
        throw new Error(msg);
      }
    }

    const replaceExisting =
      settings.streaming.seamlessSwitch && running.length > 0;
    const reserveChat = settings.chat.provider === "chatterino";

    const launch = resolveChannelLaunch(settings, stream.user_login, {
      title: stream.title,
      game: stream.game_name,
    });

    try {
      if (multi && !already) {
        set((state) => ({
          slotChannels: state.slotChannels.includes(channel)
            ? state.slotChannels
            : [...state.slotChannels, channel],
        }));
      } else if (!multi) {
        set({ slotChannels: [channel] });
      }

      if (reserveChat) {
        const chatChannels = multi
          ? [
              ...new Set(
                [
                  ...get().slotChannels,
                  channel,
                ].filter(Boolean),
              ),
            ]
          : [channel];
        void syncChatterino(chatChannels);
      }

      // Planned dock position for the launch geometry, so mpv opens already
      // snapped to its tile instead of resizing visibly after "ready".
      const plannedChannels = replaceExisting
        ? [channel]
        : [...new Set([...orderedChannels(), channel])];

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
          retryStreams: 0,
          retryMax: 0,
          playerNoClose: settings.streaming.playerNoClose,
          reserveChat,
          replaceExisting,
          slotIndex: Math.max(0, plannedChannels.indexOf(channel)),
          slotCount: plannedChannels.length,
          layout: currentLayout(),
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
      // Kick the debounced layout once the session is registered (orderedChannels
      // reads the store). The "ready" status event re-triggers it later; the
      // backend retries until every player window is actually tiled.
      scheduleLayoutAfterReady();
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
    const session = get().sessions.find((s) => s.id === id);
    const channel = session?.channel.toLowerCase();
    await invoke("stream_stop", { id });
    if (channel) {
      set((state) => ({
        slotChannels: state.slotChannels.filter((c) => c !== channel),
      }));
    }
    await get().refresh();
    afterSessionsChanged();
  },

  stopAll: async () => {
    await invoke("stream_stop_all");
    lastChatSyncKey = "";
    void invoke("close_owned_chatterino").catch(() => undefined);
    set({ sessions: [], slotChannels: [], activeChatChannel: null });
  },

  moveSlot: (channel, direction) => {
    const login = channel.toLowerCase();
    const slots = [...get().slotChannels];
    const i = slots.indexOf(login);
    if (i < 0) return;
    const j = i + direction;
    if (j < 0 || j >= slots.length) return;
    const tmp = slots[i]!;
    slots[i] = slots[j]!;
    slots[j] = tmp;
    set({ slotChannels: slots });
    scheduleLayoutAfterReady();
    void syncChatterino(orderedChannels());
  },

  reorderSlots: (channels) => {
    const current = new Set(get().slotChannels);
    const next = channels
      .map((c) => c.toLowerCase())
      .filter((c) => current.has(c));
    if (next.length !== current.size) return;
    set({ slotChannels: next });
    scheduleLayoutAfterReady();
    void syncChatterino(orderedChannels());
  },

  applyLayout: () => {
    scheduleLayoutAfterReady();
    void syncChatterino(orderedChannels());
  },

  setActiveChat: (channel) => set({ activeChatChannel: channel }),
}));
