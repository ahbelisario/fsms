import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadLang, setLang } from "@/src/i18n/lang";
import { t as rawT } from "@/src/i18n";

type Lang = "es" | "en";

type Ctx = {
  lang: Lang;
  setLanguage: (lang: Lang) => Promise<void>;
  t: typeof rawT;
  ready: boolean;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const l = await loadLang();   
      setLangState(l);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = async (next: Lang) => {
    await setLang(next);
    setLangState(next);
  };

  const value = useMemo(
    () => ({ lang, setLanguage, t: rawT, ready }),
    [lang, ready]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
