"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, getStoredLang, setStoredLang } from "./i18n";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(getStoredLang());
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    setStoredLang(newLang);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
