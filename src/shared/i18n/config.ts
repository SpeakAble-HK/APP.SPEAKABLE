import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import zhHK from "./zh-HK.json";
import zhCN from "./zh-CN.json";
import en from "./en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "zh-HK": { translation: zhHK },
      "zh-CN": { translation: zhCN },
      en:      { translation: en },
    },
    // Default and fallback: Traditional Chinese
    lng: "zh-HK",
    fallbackLng: "zh-HK",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Persist to localStorage; honour stored preference on reload
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "speakable_lang",
    },
  });

export default i18n;
