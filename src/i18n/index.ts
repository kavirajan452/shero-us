import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import bn from "./locales/bn.json";
import mr from "./locales/mr.json";
import gu from "./locales/gu.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";
import zh from "./locales/zh.json";

export const languages = [
  { code: "en-IN", label: "English (India)", flag: "🇮🇳", group: "indian" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳", group: "indian" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳", group: "indian" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳", group: "indian" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳", group: "indian" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳", group: "indian" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳", group: "indian" },
  { code: "mr", label: "मराठी", flag: "🇮🇳", group: "indian" },
  { code: "gu", label: "ગુજરાતી", flag: "🇮🇳", group: "indian" },
  { code: "en", label: "English", flag: "🇬🇧", group: "international" },
  { code: "es", label: "Español", flag: "🇪🇸", group: "international" },
  { code: "fr", label: "Français", flag: "🇫🇷", group: "international" },
  { code: "ar", label: "العربية", flag: "🇸🇦", group: "international" },
  { code: "zh", label: "中文", flag: "🇨🇳", group: "international" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      "en-IN": { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
      kn: { translation: kn },
      ml: { translation: ml },
      bn: { translation: bn },
      mr: { translation: mr },
      gu: { translation: gu },
      es: { translation: es },
      fr: { translation: fr },
      ar: { translation: ar },
      zh: { translation: zh },
    },
    fallbackLng: "en-IN",
    lng: (typeof window !== "undefined" ? localStorage.getItem("shero-lang") : null) || "en-IN",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "shero-lang",
    },
  });

export default i18n;
