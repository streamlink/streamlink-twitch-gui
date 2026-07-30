import { create } from "zustand";
import { openUrl } from "@tauri-apps/plugin-opener";
import { invoke, isTauri } from "../tauri";

export interface AuthSession {
  loggedIn: boolean;
  // The access token stays in Rust; Helix calls go through the helix_fetch proxy.
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

/** Tagged union returned by auth_poll_device_login. */
export type DevicePoll =
  | { state: "pending" }
  | { state: "slowDown" }
  | { state: "done"; session: AuthSession };

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

      // RFC 8628: poll at `interval`, and add 5 s each time Twitch answers
      // slow_down (capped) instead of hammering the token endpoint.
      let pollIntervalMs = Math.max(device.interval, 1) * 1000;
      const poll = async () => {
        if (!get().device) {
          return;
        }
        try {
          const result = await invoke<DevicePoll>("auth_poll_device_login", {
            deviceCode: device.deviceCode,
          });
          if (result.state === "done" && result.session?.loggedIn) {
            clearPoll();
            set({ session: result.session, device: null, error: null });
            return;
          }
          if (result.state === "slowDown") {
            pollIntervalMs = Math.min(pollIntervalMs + 5000, 30_000);
          }
          pollTimer = setTimeout(() => {
            void poll();
          }, pollIntervalMs);
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
      }, pollIntervalMs);
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
    set({ session: { loggedIn: false, scopes: [] }, device: null });
  },
}));
