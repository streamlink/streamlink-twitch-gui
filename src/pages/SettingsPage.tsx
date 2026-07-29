import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../lib/settings/store";
import {
  exportSettingsJson,
  importSettingsJson,
  loadPersistedSettings,
  persistSettings,
} from "../lib/settings/persist";
import type {
  ChatProvider,
  PlayerId,
  StreamlinkSource,
  ThemeMode,
} from "../lib/settings/types";

export function SettingsPage() {
  const { t } = useTranslation(["routes", "settings", "common"]);
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const replaceSettings = useSettingsStore((s) => s.replaceSettings);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void persistSettings(settings);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [settings]);

  return (
    <section className="settings">
      <h1>{t("routes:settingsTitle")}</h1>

      <fieldset className="settings__group">
        <legend>{t("settings:gui")}</legend>
        <label className="settings__row">
          <span>{t("settings:theme")}</span>
          <select
            value={settings.theme}
            onChange={(e) =>
              setSettings({ theme: e.target.value as ThemeMode })
            }
          >
            <option value="system">{t("settings:themeSystem")}</option>
            <option value="dark">{t("settings:themeDark")}</option>
            <option value="light">{t("settings:themeLight")}</option>
          </select>
        </label>
        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.gui.closeToTray}
            onChange={(e) =>
              setSettings({
                gui: { ...settings.gui, closeToTray: e.target.checked },
              })
            }
          />
          <span>{t("settings:closeToTray")}</span>
        </label>
        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.gui.minimizeOnWatch}
            onChange={(e) =>
              setSettings({
                gui: { ...settings.gui, minimizeOnWatch: e.target.checked },
              })
            }
          />
          <span>{t("settings:minimizeOnWatch")}</span>
        </label>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:streaming")}</legend>
        <label className="settings__row">
          <span>{t("settings:streamlinkSource")}</span>
          <select
            value={settings.streamlink.source}
            onChange={(e) =>
              setSettings({
                streamlink: {
                  ...settings.streamlink,
                  source: e.target.value as StreamlinkSource,
                },
              })
            }
          >
            <option value="bundled">{t("settings:streamlinkBundled")}</option>
            <option value="system">{t("settings:streamlinkSystem")}</option>
            <option value="custom">{t("settings:streamlinkCustom")}</option>
          </select>
        </label>
        {settings.streamlink.source === "custom" ? (
          <label className="settings__row">
            <span>{t("settings:streamlinkCustomPath")}</span>
            <input
              className="input"
              value={settings.streamlink.customPath}
              onChange={(e) =>
                setSettings({
                  streamlink: {
                    ...settings.streamlink,
                    customPath: e.target.value,
                  },
                })
              }
            />
          </label>
        ) : null}
        <label className="settings__row">
          <span>{t("settings:quality")}</span>
          <div className="settings__control">
            <select
              value={
                [
                  "best",
                  "1080p60",
                  "1080p",
                  "720p60",
                  "720p",
                  "480p",
                  "360p",
                  "160p",
                  "audio_only",
                  "worst",
                ].includes(settings.streaming.quality)
                  ? settings.streaming.quality
                  : "custom"
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value === "custom") {
                  setSettings({
                    streaming: {
                      ...settings.streaming,
                      quality: "",
                    },
                  });
                  return;
                }
                setSettings({
                  streaming: { ...settings.streaming, quality: value },
                });
              }}
            >
              <option value="best">best</option>
              <option value="1080p60">1080p60</option>
              <option value="1080p">1080p</option>
              <option value="720p60">720p60</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
              <option value="360p">360p</option>
              <option value="160p">160p</option>
              <option value="audio_only">audio_only</option>
              <option value="worst">worst</option>
              <option value="custom">{t("settings:qualityCustom")}</option>
            </select>
            {![
              "best",
              "1080p60",
              "1080p",
              "720p60",
              "720p",
              "480p",
              "360p",
              "160p",
              "audio_only",
              "worst",
            ].includes(settings.streaming.quality) ? (
              <input
                className="input"
                value={settings.streaming.quality}
                onChange={(e) =>
                  setSettings({
                    streaming: {
                      ...settings.streaming,
                      quality: e.target.value,
                    },
                  })
                }
                placeholder="720p,720p60"
                aria-label={t("settings:qualityCustom")}
              />
            ) : null}
          </div>
        </label>
        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.streaming.lowLatency}
            onChange={(e) =>
              setSettings({
                streaming: {
                  ...settings.streaming,
                  lowLatency: e.target.checked,
                },
              })
            }
          />
          <span>
            {t("settings:lowLatency")}
            <small className="muted">{t("settings:lowLatencyHint")}</small>
          </span>
        </label>
        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.streaming.webbrowser}
            onChange={(e) =>
              setSettings({
                streaming: {
                  ...settings.streaming,
                  webbrowser: e.target.checked,
                },
              })
            }
          />
          <span>
            {t("settings:webbrowser")}
            <small className="muted">{t("settings:webbrowserHint")}</small>
          </span>
        </label>
        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.streaming.webbrowserHeadless}
            onChange={(e) =>
              setSettings({
                streaming: {
                  ...settings.streaming,
                  webbrowserHeadless: e.target.checked,
                },
              })
            }
          />
          <span>{t("settings:webbrowserHeadless")}</span>
        </label>
        <label className="settings__row">
          <span>{t("settings:retryStreams")}</span>
          <input
            className="input"
            type="number"
            min={0}
            value={settings.streaming.retryStreams}
            onChange={(e) =>
              setSettings({
                streaming: {
                  ...settings.streaming,
                  retryStreams: Number(e.target.value) || 0,
                },
              })
            }
          />
        </label>
        <label className="settings__row">
          <span>{t("settings:retryMax")}</span>
          <input
            className="input"
            type="number"
            min={0}
            value={settings.streaming.retryMax}
            onChange={(e) =>
              setSettings({
                streaming: {
                  ...settings.streaming,
                  retryMax: Number(e.target.value) || 0,
                },
              })
            }
          />
        </label>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:player")}</legend>
        <label className="settings__row">
          <span>{t("settings:playerId")}</span>
          <select
            value={settings.player.id}
            onChange={(e) =>
              setSettings({
                player: {
                  ...settings.player,
                  id: e.target.value as PlayerId,
                },
              })
            }
          >
            <option value="mpv">mpv</option>
            <option value="vlc">VLC</option>
            <option value="mpc">MPC-HC</option>
            <option value="potplayer">PotPlayer</option>
            <option value="custom">{t("settings:chatCustom")}</option>
          </select>
        </label>
        <label className="settings__row">
          <span>{t("settings:playerCustomPath")}</span>
          <input
            className="input"
            value={settings.player.customPath}
            onChange={(e) =>
              setSettings({
                player: { ...settings.player, customPath: e.target.value },
              })
            }
          />
        </label>
        <label className="settings__row">
          <span>{t("settings:playerCustomArgs")}</span>
          <input
            className="input"
            value={settings.player.customArgs}
            onChange={(e) =>
              setSettings({
                player: { ...settings.player, customArgs: e.target.value },
              })
            }
          />
        </label>
        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.streaming.playerNoClose}
            onChange={(e) =>
              setSettings({
                streaming: {
                  ...settings.streaming,
                  playerNoClose: e.target.checked,
                },
              })
            }
          />
          <span>{t("settings:playerNoClose")}</span>
        </label>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:chat")}</legend>
        <label className="settings__row">
          <span>{t("settings:chatProvider")}</span>
          <select
            value={settings.chat.provider}
            onChange={(e) =>
              setSettings({
                chat: {
                  ...settings.chat,
                  provider: e.target.value as ChatProvider,
                },
              })
            }
          >
            <option value="embedded">{t("settings:chatEmbedded")}</option>
            <option value="chatterino">{t("settings:chatChatterino")}</option>
            <option value="browser">{t("settings:chatBrowser")}</option>
            <option value="chrome">{t("settings:chatChrome")}</option>
            <option value="custom">{t("settings:chatCustom")}</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:notifications")}</legend>
        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.notifications.followedOnline}
            onChange={(e) =>
              setSettings({
                notifications: {
                  ...settings.notifications,
                  followedOnline: e.target.checked,
                },
              })
            }
          />
          <span>{t("settings:followedOnline")}</span>
        </label>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:main")}</legend>
        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.sentryEnabled}
            onChange={(e) => setSettings({ sentryEnabled: e.target.checked })}
          />
          <span>
            {t("settings:sentryEnabled")}
            <small className="muted">{t("settings:sentryHint")}</small>
          </span>
        </label>
        <div className="settings__row">
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              const blob = new Blob([exportSettingsJson(settings)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "streamlink-twitch-gui-settings.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            {t("settings:exportSettings")}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => fileRef.current?.click()}
          >
            {t("settings:importSettings")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              replaceSettings(importSettingsJson(text));
              e.target.value = "";
            }}
          />
        </div>
      </fieldset>
    </section>
  );
}

export function SettingsBootstrap({ children }: { children: React.ReactNode }) {
  const hydrate = useSettingsStore((s) => s.hydrate);
  useEffect(() => {
    void loadPersistedSettings().then(hydrate);
  }, [hydrate]);
  return children;
}
