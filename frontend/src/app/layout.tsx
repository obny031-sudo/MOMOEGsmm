import type { Metadata } from "next";
import "./globals.css";

import ContactDock from "@/components/scene/contact-dock";
import LanguageToggle from "@/components/scene/language-toggle";

import {
  LanguageProvider,
} from "@/lib/i18n/language-context";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import ThemeToggle from "@/components/theme/theme-toggle";

export const metadata: Metadata = {
  title: "MOMOEG",
  description:
    "Elite SMM Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <body className="bg-[#07080c] text-white">

        <LanguageProvider>
          <ThemeProvider>
          <AuthProvider>
            {/* Floating Contact */}
            <ContactDock />

            {/* EN / AR */}
            <LanguageToggle />

            {/* Pages */}
            {children}
            <ThemeToggle />
          </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>

      </body>

    </html>
  );
}