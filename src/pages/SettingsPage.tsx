import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
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
  HotkeySettings,
  PlayerId,
  PlayerInput,
  StreamlinkSource,
  ThemeMode,
} from "../lib/settings/types";
import { defaultMpvPresets, describeMpvPresets } from "../lib/settings/mpv";
import {
  MPV_PORTABLE_URL,
  MPV_SCOOP,
  MPV_WINGET,
} from "../lib/settings/mpv";
import { MPV_INSTALL_URL } from "../lib/doctor";
import { eventToHotkey, normalizeHotkey } from "../lib/hotkeys";
import { isTauri } from "../lib/tauri";
import { openUrl } from "@tauri-apps/plugin-opener";
import { syncViewerPresence, useWatchingStore } from "../lib/streaming/store";
import "./SettingsPage.css";
import "../components/SetupHelp.css";

async function openExternal(url: string) {
  if (isTauri()) {
    await openUrl(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

const QUALITY_PRESETS = [
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
] as const;

function isPresetQuality(quality: string): boolean {
  return (QUALITY_PRESETS as readonly string[]).includes(quality);
}

export function SettingsPage() {
  const { t } = useTranslation(["routes", "settings", "common"]);
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const replaceSettings = useSettingsStore((s) => s.replaceSettings);
  const setChannelOverride = useSettingsStore((s) => s.setChannelOverride);
  const applyLayout = useWatchingStore((s) => s.applyLayout);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newChannelLogin, setNewChannelLogin] = useState("");
  const [newChannelQuality, setNewChannelQuality] = useState("");

  const qualityIsCustom = !isPresetQuality(settings.streaming.quality);
  const streamlinkIsCustom = settings.streamlink.source === "custom";
  const channelEntries = Object.entries(settings.channels);

  const captureHotkey =
    (key: keyof HotkeySettings) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        setSettings({
          hotkeys: { ...settings.hotkeys, [key]: "" },
        });
        return;
      }
      if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return;
      setSettings({
        hotkeys: {
          ...settings.hotkeys,
          [key]: normalizeHotkey(eventToHotkey(e.nativeEvent)),
        },
      });
    };

  return (
    <section className="settings">
      <header className="page__header">
        <h1>{t("routes:settingsTitle")}</h1>
      </header>

      <fieldset className="settings__group">
        <legend>{t("settings:gui")}</legend>

        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:theme")}</span>
          </div>
          <div className="settings__control">
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
          </div>
        </div>

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
          <span className="settings__check-text">
            {t("settings:closeToTray")}
          </span>
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
          <span className="settings__check-text">
            {t("settings:minimizeOnWatch")}
          </span>
        </label>

        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.gui.deepLinkAutoWatch}
            onChange={(e) =>
              setSettings({
                gui: { ...settings.gui, deepLinkAutoWatch: e.target.checked },
              })
            }
          />
          <span className="settings__check-text">
            {t("settings:deepLinkAutoWatch")}
          </span>
        </label>

        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:showSetupAgain")}</span>
            <small className="muted">{t("settings:showSetupAgainHint")}</small>
          </div>
          <div className="settings__control">
            <button
              type="button"
              className="button-secondary"
              onClick={() =>
                setSettings({
                  gui: { ...settings.gui, onboardingDone: false },
                })
              }
            >
              {t("settings:showSetupAgain")}
            </button>
          </div>
        </div>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:streaming")}</legend>

        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:streamlinkSource")}</span>
          </div>
          <div className="settings__control">
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
            <p className="muted">{t("settings:streamlinkBundledHint")}</p>
          </div>
        </div>

        <div
          className={
            streamlinkIsCustom
              ? "settings__row"
              : "settings__row settings__row--slot"
          }
          aria-hidden={!streamlinkIsCustom}
        >
          <div className="settings__label">
            <span>{t("settings:streamlinkCustomPath")}</span>
          </div>
          <div className="settings__control">
            <input
              className="input"
              value={settings.streamlink.customPath}
              disabled={!streamlinkIsCustom}
              tabIndex={streamlinkIsCustom ? 0 : -1}
              onChange={(e) =>
                setSettings({
                  streamlink: {
                    ...settings.streamlink,
                    customPath: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="settings__row settings__row--stack">
          <div className="settings__label">
            <span>{t("settings:quality")}</span>
          </div>
          <div className="settings__control">
            <select
              value={qualityIsCustom ? "custom" : settings.streaming.quality}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "custom") {
                  setSettings({
                    streaming: { ...settings.streaming, quality: "" },
                  });
                  return;
                }
                setSettings({
                  streaming: { ...settings.streaming, quality: value },
                });
              }}
            >
              {QUALITY_PRESETS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
              <option value="custom">{t("settings:qualityCustom")}</option>
            </select>
            <input
              className="input"
              value={qualityIsCustom ? settings.streaming.quality : ""}
              disabled={!qualityIsCustom}
              tabIndex={qualityIsCustom ? 0 : -1}
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
          </div>
        </div>

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
          <span className="settings__check-text">
            {t("settings:lowLatency")}
            <small className="muted">{t("settings:lowLatencyHint")}</small>
          </span>
        </label>

        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.streaming.disableAds}
            onChange={(e) =>
              setSettings({
                streaming: {
                  ...settings.streaming,
                  disableAds: e.target.checked,
                },
              })
            }
          />
          <span className="settings__check-text">
            {t("settings:disableAds")}
            <small className="muted">{t("settings:disableAdsHint")}</small>
          </span>
        </label>

        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.streaming.channelPoints}
            onChange={(e) => {
              setSettings({
                streaming: {
                  ...settings.streaming,
                  channelPoints: e.target.checked,
                },
              });
              queueMicrotask(syncViewerPresence);
            }}
          />
          <span className="settings__check-text">
            {t("settings:channelPoints")}
            <small className="muted">{t("settings:channelPointsHint")}</small>
          </span>
        </label>

        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.streaming.seamlessSwitch}
            onChange={(e) => {
              const seamless = e.target.checked;
              // Seamless and linked dock are mutually exclusive: leaving seamless
              // enables the dock grips so you don't need two toggles.
              const linkedDock = seamless ? false : true;
              setSettings({
                streaming: {
                  ...settings.streaming,
                  seamlessSwitch: seamless,
                  linkedDock,
                },
              });
              void import("../lib/tauri").then(({ invoke, isTauri }) => {
                if (isTauri()) {
                  void invoke("dock_set_linked", { enabled: linkedDock }).catch(
                    () => undefined,
                  );
                }
              });
            }}
          />
          <span className="settings__check-text">
            {t("settings:seamlessSwitch")}
            <small className="muted">{t("settings:seamlessSwitchHint")}</small>
          </span>
        </label>

        {!settings.streaming.seamlessSwitch ? (
          <label className="settings__row">
            <span>
              {t("settings:multistreamLayout")}
              <small className="muted">{t("settings:multistreamLayoutHint")}</small>
            </span>
            <select
              value={settings.streaming.multistreamLayout}
              onChange={(e) =>
                setSettings({
                  streaming: {
                    ...settings.streaming,
                    multistreamLayout: e.target
                      .value as typeof settings.streaming.multistreamLayout,
                  },
                })
              }
            >
              <option value="1">{t("settings:layout1")}</option>
              <option value="2">{t("settings:layout2")}</option>
              <option value="1x2">{t("settings:layout1x2")}</option>
              <option value="1x3">{t("settings:layout1x3")}</option>
              <option value="1x4">{t("settings:layout1x4")}</option>
              <option value="2plus1">{t("settings:layout2plus1")}</option>
              <option value="2x2">{t("settings:layout2x2")}</option>
              <option value="3plus1">{t("settings:layout3plus1")}</option>
              <option value="3x2">{t("settings:layout3x2")}</option>
              <option value="4x2">{t("settings:layout4x2")}</option>
              <option value="8x1">{t("settings:layout8x1")}</option>
            </select>
          </label>
        ) : null}

        {!settings.streaming.seamlessSwitch &&
        (settings.streaming.multistreamLayout === "2plus1" ||
          settings.streaming.multistreamLayout === "3plus1") ? (
          <label className="settings__row">
            <span>
              {t("settings:unevenMainSide")}
              <small className="muted">{t("settings:unevenMainSideHint")}</small>
            </span>
            <select
              value={settings.streaming.unevenMainSide}
              onChange={(e) => {
                setSettings({
                  streaming: {
                    ...settings.streaming,
                    unevenMainSide: e.target
                      .value as typeof settings.streaming.unevenMainSide,
                  },
                });
                applyLayout();
              }}
            >
              <option value="left">{t("settings:mainSideLeft")}</option>
              <option value="right">{t("settings:mainSideRight")}</option>
              <option value="top">{t("settings:mainSideTop")}</option>
              <option value="bottom">{t("settings:mainSideBottom")}</option>
            </select>
          </label>
        ) : null}

        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.streaming.linkedDock}
            onChange={(e) => {
              const enabled = e.target.checked;
              setSettings({
                streaming: {
                  ...settings.streaming,
                  linkedDock: enabled,
                  // Enabling dock forces multistream (seamless off).
                  seamlessSwitch: enabled ? false : settings.streaming.seamlessSwitch,
                },
              });
              void import("../lib/tauri").then(({ invoke, isTauri }) => {
                if (isTauri()) {
                  void invoke("dock_set_linked", { enabled }).catch(() => undefined);
                }
              });
            }}
          />
          <span className="settings__check-text">
            {t("settings:linkedDock")}
            <small className="muted">{t("settings:linkedDockHint")}</small>
          </span>
        </label>

        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.streaming.followRaids}
            onChange={(e) => {
              setSettings({
                streaming: {
                  ...settings.streaming,
                  followRaids: e.target.checked,
                },
              });
              void import("../lib/streaming/store").then(({ syncEventSub }) => {
                syncEventSub();
              });
            }}
          />
          <span className="settings__check-text">
            {t("settings:followRaids")}
            <small className="muted">{t("settings:followRaidsHint")}</small>
          </span>
        </label>

        {settings.streaming.linkedDock ? (
          <label className="settings__row">
            <span>
              {t("settings:chatWidthFraction")}
              <small className="muted">{t("settings:chatWidthFractionHint")}</small>
            </span>
            <input
              type="range"
              min={12}
              max={45}
              step={1}
              value={Math.round(settings.streaming.chatWidthFraction * 100)}
              onChange={(e) => {
                const fraction = Number(e.target.value) / 100;
                setSettings({
                  streaming: {
                    ...settings.streaming,
                    chatWidthFraction: fraction,
                  },
                });
                void import("../lib/tauri").then(({ invoke, isTauri }) => {
                  if (isTauri()) {
                    void invoke("dock_set_chat_fraction", { fraction }).catch(
                      () => undefined,
                    );
                  }
                });
              }}
            />
            <span className="muted">
              {Math.round(settings.streaming.chatWidthFraction * 100)}%
            </span>
          </label>
        ) : null}

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
          <span className="settings__check-text">
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
          <span className="settings__check-text">
            {t("settings:webbrowserHeadless")}
          </span>
        </label>

        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:retryStreams")}</span>
          </div>
          <div className="settings__control">
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
          </div>
        </div>

        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:retryMax")}</span>
          </div>
          <div className="settings__control">
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
          </div>
        </div>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:player")}</legend>

        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:playerId")}</span>
          </div>
          <div className="settings__control">
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
          </div>
        </div>

        {settings.player.id === "mpv" ? (
          <div className="settings__row settings__row--stack">
            <div className="settings__label">
              <span>{t("settings:playerInstallTitle")}</span>
            </div>
            <div className="settings__control">
              <div className="setup-help setup-help--settings">
                <p className="setup-help__body muted">
                  {t("settings:playerInstallOpenShell")}
                </p>
                <div className="setup-help__cmds">
                  <div>
                    <span className="muted">{t("settings:playerInstallWinget")}</span>
                    <code>{MPV_WINGET}</code>
                  </div>
                  <div>
                    <span className="muted">{t("settings:playerInstallScoop")}</span>
                    <code>{MPV_SCOOP}</code>
                  </div>
                </div>
                <p className="setup-help__body muted">
                  {t("settings:playerInstallPortable")}
                </p>
                <div className="setup-help__actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => void openExternal(MPV_PORTABLE_URL)}
                  >
                    {t("settings:playerInstallPortableLink")}
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => void openExternal(MPV_INSTALL_URL)}
                  >
                    {t("settings:playerInstallSources")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:playerCustomPath")}</span>
          </div>
          <div className="settings__control">
            <input
              className="input"
              value={settings.player.customPath}
              onChange={(e) =>
                setSettings({
                  player: { ...settings.player, customPath: e.target.value },
                })
              }
            />
          </div>
        </div>

        {settings.player.id === "mpv" ? (
          <div className="settings__row settings__row--stack">
            <div className="settings__label">
              <span>{t("settings:playerMpvPresets")}</span>
              <small className="muted">{t("settings:playerMpvPresetsLede")}</small>
              <small className="muted">
                {describeMpvPresets(settings.player.mpv).length
                  ? t("settings:playerMpvIncluded", {
                      list: describeMpvPresets(settings.player.mpv).join(", "),
                    })
                  : t("settings:playerMpvIncludedNone")}
              </small>
            </div>
            <div className="settings__control settings__mpv-presets">
              {(
                [
                  ["noBorder", "playerMpvNoBorder"],
                  ["noKeepaspectWindow", "playerMpvNoKeepaspect"],
                  ["windowMaximized", "playerMpvMaximized"],
                  ["loopReload", "playerMpvLoopReload"],
                  ["cacheRewind", "playerMpvCacheRewind"],
                ] as const
              ).map(([key, labelKey]) => (
                <label key={key} className="settings__row settings__row--check">
                  <input
                    type="checkbox"
                    checked={settings.player.mpv[key]}
                    onChange={(e) =>
                      setSettings({
                        player: {
                          ...settings.player,
                          mpv: {
                            ...settings.player.mpv,
                            [key]: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                  <span className="settings__check-text">
                    {t(`settings:${labelKey}`)}
                  </span>
                </label>
              ))}
              <button
                type="button"
                className="button-secondary"
                onClick={() =>
                  setSettings({
                    player: {
                      ...settings.player,
                      mpv: defaultMpvPresets(),
                      customArgs: "",
                    },
                  })
                }
              >
                {t("settings:playerMpvReset")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:playerCustomArgs")}</span>
            <small className="muted">{t("settings:playerCustomArgsHint")}</small>
          </div>
          <div className="settings__control">
            <input
              className="input"
              value={settings.player.customArgs}
              onChange={(e) =>
                setSettings({
                  player: { ...settings.player, customArgs: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:playerInput")}</span>
            <small className="muted">{t("settings:playerInputHint")}</small>
          </div>
          <div className="settings__control">
            <select
              value={settings.player.input}
              onChange={(e) =>
                setSettings({
                  player: {
                    ...settings.player,
                    input: e.target.value as PlayerInput,
                  },
                })
              }
            >
              <option value="default">{t("settings:playerInputDefault")}</option>
              <option value="fifo">{t("settings:playerInputFifo")}</option>
              <option value="http">{t("settings:playerInputHttp")}</option>
            </select>
          </div>
        </div>

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
          <span className="settings__check-text">
            {t("settings:playerNoClose")}
          </span>
        </label>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:chat")}</legend>
        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:chatProvider")}</span>
          </div>
          <div className="settings__control">
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
            <p className="muted">{t("settings:chatProviderHint")}</p>
          </div>
        </div>
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
          <span className="settings__check-text">
            {t("settings:followedOnline")}
            <small className="muted">{t("settings:followedOnlineHint")}</small>
          </span>
        </label>
        <div className="settings__row settings__row--stack">
          <div className="settings__label">
            <span>{t("settings:mutedFollowed")}</span>
            <small className="muted">{t("settings:mutedFollowedHint")}</small>
          </div>
          {settings.notifications.mutedFollowed.length === 0 ? (
            <p className="muted">{t("settings:mutedFollowedEmpty")}</p>
          ) : (
            <ul className="settings__muted-list">
              {settings.notifications.mutedFollowed.map((login) => (
                <li key={login} className="settings__muted-item">
                  <Link to={`/channel/${login}`}>{login}</Link>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() =>
                      setSettings({
                        notifications: {
                          ...settings.notifications,
                          mutedFollowed:
                            settings.notifications.mutedFollowed.filter(
                              (m) => m !== login,
                            ),
                        },
                      })
                    }
                  >
                    {t("settings:mutedFollowedUnmute")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:hotkeys")}</legend>
        <p className="muted settings__hint">{t("settings:hotkeysHint")}</p>
        {(
          [
            ["refresh", "hotkeyRefresh"],
            ["focusSearch", "hotkeyFocusSearch"],
            ["stopAll", "hotkeyStopAll"],
            ["cycleDockMonitor", "hotkeyCycleDockMonitor"],
            ["openSettings", "hotkeyOpenSettings"],
            ["quit", "hotkeyQuit"],
          ] as const
        ).map(([key, labelKey]) => (
          <div className="settings__row" key={key}>
            <div className="settings__label">
              <span>{t(`settings:${labelKey}`)}</span>
            </div>
            <div className="settings__control">
              <input
                className="input"
                readOnly
                value={settings.hotkeys[key]}
                placeholder="—"
                onKeyDown={captureHotkey(key)}
                aria-label={t(`settings:${labelKey}`)}
              />
            </div>
          </div>
        ))}
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:channels")}</legend>
        <p className="muted settings__hint">{t("settings:channelsHint")}</p>
        {channelEntries.length === 0 ? (
          <p className="muted">{t("settings:channelEmpty")}</p>
        ) : (
          channelEntries.map(([login, override]) => (
            <div className="settings__row" key={login}>
              <div className="settings__label">
                <span>{login}</span>
              </div>
              <div className="settings__control settings__control--row">
                <input
                  className="input"
                  value={override.quality ?? ""}
                  placeholder={t("settings:useGlobal")}
                  onChange={(e) =>
                    setChannelOverride(login, {
                      quality: e.target.value || undefined,
                    })
                  }
                  aria-label={`${login} ${t("settings:channelQuality")}`}
                />
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setChannelOverride(login, null)}
                >
                  {t("settings:channelRemove")}
                </button>
              </div>
            </div>
          ))
        )}
        <div className="settings__row">
          <div className="settings__label">
            <span>{t("settings:channelAdd")}</span>
          </div>
          <div className="settings__control settings__control--row">
            <input
              className="input"
              value={newChannelLogin}
              placeholder={t("settings:channelLogin")}
              onChange={(e) => setNewChannelLogin(e.target.value)}
            />
            <input
              className="input"
              value={newChannelQuality}
              placeholder={t("settings:channelQuality")}
              onChange={(e) => setNewChannelQuality(e.target.value)}
            />
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                const login = newChannelLogin.trim().toLowerCase();
                if (!login) return;
                setChannelOverride(login, {
                  quality: newChannelQuality.trim() || undefined,
                });
                setNewChannelLogin("");
                setNewChannelQuality("");
              }}
            >
              {t("settings:channelAdd")}
            </button>
          </div>
        </div>
      </fieldset>

      <fieldset className="settings__group">
        <legend>{t("settings:main")}</legend>
        <label className="settings__row settings__row--check">
          <input
            type="checkbox"
            checked={settings.sentryEnabled}
            onChange={(e) => setSettings({ sentryEnabled: e.target.checked })}
          />
          <span className="settings__check-text">
            {t("settings:sentryEnabled")}
            <small className="muted">{t("settings:sentryHint")}</small>
          </span>
        </label>

        <div className="settings__row settings__row--actions">
          <div className="settings__label" />
          <div className="settings__actions">
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
        </div>
      </fieldset>
    </section>
  );
}

export function SettingsBootstrap({ children }: { children: React.ReactNode }) {
  const hydrate = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    void loadPersistedSettings().then(hydrate);
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const handle = window.setTimeout(() => {
      void persistSettings(settings);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [settings, hydrated]);

  return children;
}
