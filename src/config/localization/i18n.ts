import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// Deliberately imported from the dependency-free leaf module, NOT from
// helper.ts — helper.ts itself imports `i18n` (for its own t() calls),
// so importing helper.ts from here would form a circular dependency
// (i18n.ts <-> helper.ts) whose resolution order depends on which one
// Metro happens to load first, and getStorage would randomly come back
// undefined when helper.ts lost that race.
import { getStorage } from "../../services/storage/mmkv";
import { syncAppDirection } from "../../services/utils/rtl/rtlManager";
import en from "../localization/en.json";
import ur from "../localization/ur.json";

// Language detector using MMKV
const languageDetector = {
  type: "languageDetector" as const,
  async: true,
  init: () => {},
  detect: async (callback: (lang: string) => void) => {
    try {
      const storage = getStorage();
      if (storage) {
        const savedLanguage = storage.getString("appLanguage");
        callback(savedLanguage || "en");
      } else {
        callback("en");
      }
    } catch (error) {
      console.log("Error loading language:", error);
      callback("en");
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      const storage = getStorage();
      if (storage) {
        storage.set("appLanguage", language);
      }
    } catch (error) {
      console.log("Error saving language:", error);
    }
  },
};

// @ts-ignore
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    fallbackLng: "en",
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Global, single source of truth for RTL: reacts to every language change,
// no matter where in the app it was triggered from (Settings toggle now,
// anything else later). Also fires once for the initial detected language
// on cold start, so a persisted "ur" selection from before this existed
// gets reconciled automatically too.
i18n.on("languageChanged", (language) => {
  syncAppDirection(language);
});

export default i18n;