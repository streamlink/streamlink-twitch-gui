import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../lib/settings/store";
import {
  TWITCH_LANGUAGES,
  summarizeLanguages,
} from "../lib/twitch/languages";
import "./LanguageFilter.css";

/**
 * Multi-select broadcast languages for browse stream lists.
 * Persists to `settings.streaming.streamLanguages` (empty = all).
 */
export function LanguageFilter() {
  const { t } = useTranslation("common");
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = useSettingsStore((s) => s.settings.streaming.streamLanguages);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function setLanguages(next: string[]) {
    const { settings, setSettings } = useSettingsStore.getState();
    setSettings({
      streaming: { ...settings.streaming, streamLanguages: next },
    });
  }

  function toggle(code: string) {
    const next = selected.includes(code)
      ? selected.filter((c) => c !== code)
      : [...selected, code];
    setLanguages(next);
  }

  function clear() {
    setLanguages([]);
  }

  const summary = summarizeLanguages(selected, t("languagesAll"));

  return (
    <div className="language-filter" ref={rootRef}>
      <button
        type="button"
        className="button-secondary language-filter__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {t("languages")}: {summary}
      </button>
      {open ? (
        <div className="language-filter__panel" id={panelId} role="group">
          <div className="language-filter__toolbar">
            <strong>{t("languages")}</strong>
            <button
              type="button"
              className="language-filter__clear"
              onClick={clear}
              disabled={!selected.length}
            >
              {t("languagesClear")}
            </button>
          </div>
          <ul className="language-filter__list">
            {TWITCH_LANGUAGES.map((lang) => {
              const checked = selected.includes(lang.code);
              return (
                <li key={lang.code}>
                  <label className="language-filter__option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(lang.code)}
                    />
                    <span>{lang.label}</span>
                    <span className="muted">{lang.code}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
