/**
 * i18n infrastructure for The Origin.
 *
 * Sets up react-i18next with a basic English translation resource.
 * Additional locales can be added by importing their JSON and adding
 * them to the `resources` object below.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
});

export default i18n;
