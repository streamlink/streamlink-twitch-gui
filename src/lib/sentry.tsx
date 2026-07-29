import * as Sentry from "@sentry/react";
import { useEffect, useRef } from "react";
import { useSettingsStore } from "./settings/store";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

let initialized = false;

function ensureInit(): boolean {
  if (!dsn) return false;
  if (initialized) return true;
  Sentry.init({
    dsn,
    enabled: true,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend(event) {
      // Strip auth-ish leftovers from breadcrumbs / extras
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.authorization;
      }
      return event;
    },
  });
  initialized = true;
  return true;
}

/** Syncs the settings toggle with Sentry client state. */
export function SentryBootstrap({ children }: { children: React.ReactNode }) {
  const enabled = useSettingsStore((s) => s.settings.sentryEnabled);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const last = useRef<boolean | null>(null);

  useEffect(() => {
    if (!hydrated || !dsn) return;
    if (!ensureInit()) return;
    if (last.current === enabled) return;
    last.current = enabled;
    const client = Sentry.getClient();
    if (!client) return;
    // Toggle capture without tearing down the whole SDK.
    client.getOptions().enabled = enabled;
  }, [enabled, hydrated]);

  return children;
}

export function captureAppError(error: unknown, context?: string): void {
  if (!dsn || !useSettingsStore.getState().settings.sentryEnabled) return;
  ensureInit();
  Sentry.captureException(error, context ? { tags: { context } } : undefined);
}
