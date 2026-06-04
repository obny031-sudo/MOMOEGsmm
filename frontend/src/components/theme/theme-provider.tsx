"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { apiFetch } from "@/lib/api/client";

export type Theme = "dark" | "light" | "system";

type ResolvedTheme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme === "light" ? "light" : "dark";
}

function applyDom(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.classList.toggle("light", resolved === "light");
  document.documentElement.setAttribute("data-theme", resolved);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("momoeg-theme") as Theme | null;
    const pref = auth.user?.preferences?.theme as Theme | undefined;
    const initial =
      pref && ["dark", "light", "system"].includes(pref)
        ? pref
        : stored === "light" || stored === "system"
          ? stored
          : "dark";
    setThemeState(initial);
    const resolved = resolveTheme(initial);
    setResolvedTheme(resolved);
    applyDom(resolved);
  }, [auth.user?.preferences?.theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = resolveTheme("system");
      setResolvedTheme(resolved);
      applyDom(resolved);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const persistTheme = useCallback(
    async (next: Theme) => {
      localStorage.setItem("momoeg-theme", next);
      if (auth.isAuthenticated) {
        try {
          await apiFetch("/api/v1/profile/preferences", {
            method: "PATCH",
            auth: true,
            body: JSON.stringify({ theme: next }),
          });
        } catch {
          /* offline */
        }
      }
    },
    [auth.isAuthenticated]
  );

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      const resolved = resolveTheme(next);
      setResolvedTheme(resolved);
      applyDom(resolved);
      void persistTheme(next);
    },
    [persistTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
