"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ar from "./ar";
import en from "./en";
import { translate } from "./translate";
import { useAuth } from "@/components/auth/auth-provider";
import { apiFetch } from "@/lib/api/client";

export type Language = "en" | "ar";

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language | null;
    const pref = auth.user?.preferences?.language as Language | undefined;
    if (pref && ["en", "ar"].includes(pref)) {
      setLangState(pref);
    } else if (saved === "en" || saved === "ar") {
      setLangState(saved);
    }
  }, [auth.user?.preferences?.language]);

  const persistLang = useCallback(
    async (next: Language) => {
      localStorage.setItem("lang", next);
      document.documentElement.lang = next;
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      if (auth.isAuthenticated) {
        try {
          await apiFetch("/api/v1/profile/preferences", {
            method: "PATCH",
            auth: true,
            body: JSON.stringify({ language: next }),
          });
        } catch {
          /* offline */
        }
      }
    },
    [auth.isAuthenticated]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback(
    (next: Language) => {
      setLangState(next);
      void persistLang(next);
    },
    [persistLang]
  );

  const dict = lang === "ar" ? ar : en;

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      dir: lang === "ar" ? "rtl" : "ltr",
      toggleLanguage: () => setLang(lang === "en" ? "ar" : "en"),
      t: (key, fallback) => translate(dict as Record<string, unknown>, key, fallback),
    }),
    [lang, setLang, dict]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
