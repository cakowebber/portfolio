import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { Localized } from "@/lib/content";

export function useLocale() {
  const { i18n } = useTranslation();
  const lang: keyof Localized = i18n.language === "en" ? "en" : "pt";

  const pick = useCallback((text: Localized) => text[lang], [lang]);
  const toggle = useCallback(() => i18n.changeLanguage(lang === "en" ? "pt-BR" : "en"), [i18n, lang]);

  return { lang, pick, toggle, intl: lang === "en" ? "en-US" : "pt-BR" };
}
