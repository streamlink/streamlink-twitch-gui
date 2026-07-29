import { create } from "zustand";
import { openUrl } from "@tauri-apps/plugin-opener";
import { clearHelixAuthCache } from "../twitch/helix";
import { invoke, isTauri } from "../tauri";

export interface AuthSession {
  loggedIn: boolean;
  accessToken?: string | null;
  userId?: string | null;
  login?: string | null;
  displayName?: string | null;
  profileImageUrl?: string | null;
  scopes: string[];
}

export interface DeviceCodeResponse {
  deviceCode: string;
  expiresIn: number;
  interval: number;
  userCode: string;
  verificationUri: string;
}

interface AuthState {
  session: AuthSession | null;
  loading: boolean;
  device: DeviceCodeResponse | null;
  error: string | null;
  refreshSession: () => Promise<void>;
  startLogin: () => Promise<void>;
  cancelLogin: () => void;
  logout: () => Promise<void>;
}

let pollTimer: ReturnType<typeof setTimeout> | null = null;

function clearPoll() {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  loading: true,
  device: null,
  error: null,

  refreshSession: async () => {
    set({ loading: true, error: null });
    if (!isTauri()) {
      set({
        session: { loggedIn: false, scopes: [] },
        loading: false,
        error: null,
      });
      return;
    }
    try {
      const session = await invoke<AuthSession>("auth_get_session");
      set({ session, loading: false });
    } catch (err) {
      set({
        session: { loggedIn: false, scopes: [] },
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  startLogin: async () => {
    clearPoll();
    set({ error: null, device: null, loading: true });
    if (!isTauri()) {
      set({
        loading: false,
        error:
          "Run `npm run tauri:dev` to log in — browser Vite has no desktop APIs.",
      });
      return;
    }
    try {
      const device = await invoke<DeviceCodeResponse>("auth_start_device_login");
      set({ device, loading: false });
      await openUrl(device.verificationUri);

      const poll = async () => {
        if (!get().device) {
          return;
        }
        try {
          const session = await invoke<AuthSession | null>(
            "auth_poll_device_login",
            { deviceCode: device.deviceCode },
          );
          if (session?.loggedIn) {
            clearPoll();
            set({ session, device: null, error: null });
            return;
          }
          const waitMs = Math.max(device.interval, 1) * 1000;
          pollTimer = setTimeout(() => {
            void poll();
          }, waitMs);
        } catch (err) {
          clearPoll();
          set({
            device: null,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      };
      pollTimer = setTimeout(() => {
        void poll();
      }, Math.max(device.interval, 1) * 1000);
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  cancelLogin: () => {
    clearPoll();
    set({ device: null });
  },

  logout: async () => {
    clearPoll();
    if (isTauri()) {
      await invoke("auth_logout");
    }
    clearHelixAuthCache();
    set({ session: { loggedIn: false, scopes: [] }, device: null });
  },
}));
