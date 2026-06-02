"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

const items = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Services",
    href: "/services",
  },
  {
    label: "Orders",
    href: "/orders",
  },
  {
    label: "Wallet",
    href: "/wallet",
  },
  {
    label: "Alerts",
    href: "/notifications",
  },
  {
    label: "Profile",
    href: "/profile",
  },
];

export default function FloatingDock() {
  const pathname = usePathname();
  const auth = useAuth();

  return (
    <motion.header
      initial={{
        opacity: 0,
        y: -30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="fixed left-1/2 top-5 z-50 w-[94%] max-w-7xl -translate-x-1/2"
    >
      <div className="flex items-center justify-between rounded-[34px] border border-white/10 bg-white/[0.035] px-7 py-5 backdrop-blur-3xl shadow-[0_10px_80px_rgba(0,0,0,.35)]">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,.8)]" />

          <h1 className="font-semibold tracking-[.25em]">
            MOMOEG
          </h1>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-3">

          {items.map((item) => {
            const active =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  rounded-2xl px-4 py-2 text-sm transition
                  ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}

        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">

          {auth.isAuthenticated &&
            ["admin", "moderator", "staff"].includes(
              auth.user?.role || ""
            ) && (
            <Link
              href="/admin"
              className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-2.5 text-sm text-indigo-200 transition hover:bg-indigo-500/20"
            >
              Admin
            </Link>
          )}

          <Link
            href="/login"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm transition hover:bg-white/[0.08]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-2xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:scale-[1.02]"
          >
            Register
          </Link>

        </div>

      </div>
    </motion.header>
  );
}