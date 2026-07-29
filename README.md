# Streamlink Twitch GUI (rewrite)

Windows desktop Twitch browser for [Streamlink](https://streamlink.github.io/), rewritten with **Tauri 2 + React + TypeScript**.

The previous NW.js + Ember application lives in `legacy/` for reference.

## Develop

```bash
npm install
npm run tauri:dev
```

`npm run dev` is the same as `tauri:dev` (desktop shell). For the Vite UI only (no Streamlink/login APIs), use `npm run dev:web`.

## Requirements

- Node.js 20+
- Rust (stable)
- WebView2 (Windows)
- Optional: mpv, Chatterino (Streamlink is bundled in release builds)

## License

MIT — see [LICENSE](LICENSE). Upstream project: [streamlink/streamlink-twitch-gui](https://github.com/streamlink/streamlink-twitch-gui).
