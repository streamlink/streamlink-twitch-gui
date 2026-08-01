/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TWITCH_CLIENT_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
