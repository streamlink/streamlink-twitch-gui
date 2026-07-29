import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../lib/settings/store";
import type { ThemeMode } from "../lib/settings/types";

export function SettingsPage() {
  const { t } = useTranslation(["routes", "settings"]);
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);

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
                  source: e.target.value as typeof settings.streamlink.source,
                },
              })
            }
          >
            <option value="bundled">{t("settings:streamlinkBundled")}</option>
            <option value="system">{t("settings:streamlinkSystem")}</option>
            <option value="custom">{t("settings:streamlinkCustom")}</option>
          </select>
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
                  provider: e.target.value as typeof settings.chat.provider,
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
      </fieldset>
    </section>
  );
}
