import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/translation.json";
import srTranslation from "./locales/sr/translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      sr: { translation: srTranslation },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
