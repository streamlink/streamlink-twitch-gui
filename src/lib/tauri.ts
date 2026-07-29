import { invoke as tauriInvoke } from "@tauri-apps/api/core";

/** True only inside the Tauri webview (not plain `vite` in a browser). */
export function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    // Tauri 2
    typeof (window as Window & { __TAURI_INTERNALS__?: unknown })
      .__TAURI_INTERNALS__ !== "undefined"
  );
}

export async function invoke<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  if (!isTauri()) {
    throw new Error(
      "This app must be run with `npm run tauri:dev` (or a built desktop app). Plain `npm run dev` is browser-only and has no Tauri APIs.",
    );
  }
  return tauriInvoke<T>(cmd, args);
}
