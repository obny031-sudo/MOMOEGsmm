"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";

import {
  useLanguage,
} from "@/lib/i18n/language-context";

export default function LanguageToggle() {

  const language =
    useLanguage();

  if (!language)
    return null;

  const {
    lang,
    toggleLanguage,
  } = language;

  return (
    <motion.button
      whileHover={{
        scale:1.05,
      }}
      whileTap={{
        scale:.95,
      }}
      onClick={
        toggleLanguage
      }
      className="
        fixed
        bottom-5
        left-5
        z-[999]
        flex
        items-center
        gap-2
        rounded-2xl
        border
        border-white/10
        bg-[#0b0c11]/80
        px-4
        py-3
        text-sm
        text-white
        backdrop-blur-3xl
        shadow-[0_10px_40px_rgba(0,0,0,.35)]
      "
    >
      <Languages size={16}/>

      {lang === "en"
        ? "AR"
        : "EN"}
    </motion.button>
  );
}