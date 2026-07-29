import { useEffect, type ReactNode } from "react";
import { bindStreamingListeners } from "../lib/streaming/store";

/** Bind Streamlink status / session events for the app lifetime. */
export function StreamingBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void bindStreamingListeners().then((unlisten) => {
      cleanup = unlisten;
    });
    return () => cleanup?.();
  }, []);
  return children;
}
