import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en.json";
import ptBR from "./ptbr.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      "pt-BR": { translation: ptBR },
    },
    supportedLngs: ["pt-BR", "en"],
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      // "pt", "pt-PT" e afins caem no pt-BR; o resto vai para o inglês.
      convertDetectedLanguage: (lng: string) => (lng.toLowerCase().startsWith("pt") ? "pt-BR" : "en"),
    },
  });

const syncDocumentLang = (lng: string) => {
  document.documentElement.lang = lng === "en" ? "en" : "pt-BR";
};

syncDocumentLang(i18n.language);
i18n.on("languageChanged", syncDocumentLang);

export default i18n;
