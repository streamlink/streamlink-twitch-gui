import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import common from "../locales/en/common.json";
import nav from "../locales/en/nav.json";
import routes from "../locales/en/routes.json";
import settings from "../locales/en/settings.json";
import errors from "../locales/en/errors.json";

void i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common", "nav", "routes", "settings", "errors"],
  resources: {
    en: {
      common,
      nav,
      routes,
      settings,
      errors,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
