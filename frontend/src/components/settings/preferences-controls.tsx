"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { useTheme, type Theme } from "@/components/theme/theme-provider";

export default function PreferencesControls({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const selectClass = compact
    ? "rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
    : "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm";

  return (
    <div className={compact ? "flex flex-wrap gap-3" : "space-y-4"}>
      <label className={compact ? "" : "block"}>
        {!compact && (
          <span className="mb-2 block text-sm text-zinc-500">{t("common.language")}</span>
        )}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as "en" | "ar")}
          className={selectClass}
        >
          <option value="en">{t("common.english")}</option>
          <option value="ar">{t("common.arabic")}</option>
        </select>
      </label>
      <label className={compact ? "" : "block"}>
        {!compact && (
          <span className="mb-2 block text-sm text-zinc-500">{t("common.theme")}</span>
        )}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className={selectClass}
        >
          <option value="dark">{t("common.dark")}</option>
          <option value="light">{t("common.light")}</option>
          <option value="system">{t("common.system")}</option>
        </select>
      </label>
    </div>
  );
}
