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
    <html lang="en" suppressHydrationWarning>

      <body className="page-shell antialiased">

        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <ContactDock />
              <LanguageToggle />
              {children}
              <ThemeToggle />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>

      </body>

    </html>
  );
}