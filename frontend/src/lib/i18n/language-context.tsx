"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import ar from "./ar";
import en from "./en";

type Language =
  | "en"
  | "ar";

const LanguageContext =
  createContext<any>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [lang,
    setLang] =
    useState<Language>(
      "en"
    );

  useEffect(() => {

    const saved =
      localStorage.getItem(
        "lang"
      ) as Language;

    if (saved)
      setLang(saved);

  }, []);

  useEffect(() => {

    document.documentElement.dir =
      lang === "ar"
        ? "rtl"
        : "ltr";

    localStorage.setItem(
      "lang",
      lang
    );

  }, [lang]);

  const toggleLanguage =
    () => {
      setLang(
        (
          prev
        ) =>
          prev === "en"
            ? "ar"
            : "en"
      );
    };

  const t =
    lang === "ar"
      ? ar
      : en;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage =
  () =>
    useContext(
      LanguageContext
    );