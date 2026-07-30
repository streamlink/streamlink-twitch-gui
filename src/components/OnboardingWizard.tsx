import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthBar } from "./AuthBar";
import { PlayerSetupHelp, StreamlinkSetupHelp } from "./SetupHelp";
import type { DoctorReport } from "../lib/doctor";
import { useAuthStore } from "../lib/auth/store";
import { useSettingsStore } from "../lib/settings/store";
import { invoke, isTauri } from "../lib/tauri";
import "./OnboardingWizard.css";

const STEPS = 3;

export function OnboardingWizard() {
  const { t } = useTranslation(["onboarding", "common"]);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const onboardingDone = useSettingsStore((s) => s.settings.gui.onboardingDone);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const settings = useSettingsStore((s) => s.settings);
  const session = useAuthStore((s) => s.session);
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [checking, setChecking] = useState(false);

  const open = hydrated && isTauri() && !onboardingDone;

  const refresh = useCallback(() => {
    if (!isTauri()) return;
    setChecking(true);
    invoke<DoctorReport>("get_doctor_report")
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const finish = () => {
    setSettings({
      gui: { ...settings.gui, onboardingDone: true },
    });
  };

  if (!open) return null;

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding__panel">
        <header className="onboarding__header">
          <div>
            <p className="muted onboarding__step">
              {t("onboarding:stepOf", { current: step + 1, total: STEPS })}
            </p>
            <h2 id="onboarding-title">{t("onboarding:title")}</h2>
            <p className="muted">{t("onboarding:lede")}</p>
          </div>
        </header>

        <div className="onboarding__body">
          {step === 0 ? (
            <section>
              <h3>{t("onboarding:stepStreamlink")}</h3>
              <StreamlinkSetupHelp
                status={report?.streamlink}
                onRecheck={refresh}
                checking={checking}
              />
            </section>
          ) : null}
          {step === 1 ? (
            <section>
              <h3>{t("onboarding:stepPlayer")}</h3>
              <PlayerSetupHelp
                status={report?.mpv}
                onRecheck={refresh}
                checking={checking}
              />
            </section>
          ) : null}
          {step === 2 ? (
            <section>
              <h3>{t("onboarding:stepLogin")}</h3>
              <p className="muted">{t("onboarding:loginBody")}</p>
              {session?.loggedIn ? (
                <p>
                  {t("onboarding:loginDone", {
                    name: session.displayName ?? session.login ?? "?",
                  })}
                </p>
              ) : (
                <AuthBar />
              )}
            </section>
          ) : null}
        </div>

        <footer className="onboarding__footer">
          <button type="button" className="button-secondary" onClick={finish}>
            {t("onboarding:skip")}
          </button>
          <div className="onboarding__nav">
            {step > 0 ? (
              <button
                type="button"
                className="button-secondary"
                onClick={() => setStep((s) => s - 1)}
              >
                {t("onboarding:back")}
              </button>
            ) : null}
            {step < STEPS - 1 ? (
              <button type="button" onClick={() => setStep((s) => s + 1)}>
                {t("onboarding:next")}
              </button>
            ) : (
              <button type="button" onClick={finish}>
                {t("onboarding:finish")}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
