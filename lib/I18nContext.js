"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { TRANSLATIONS } from "./translations";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("lo");

  const value = useMemo(() => {
    const t = (key) => TRANSLATIONS[key]?.[lang] ?? key;
    return { lang, setLang, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
