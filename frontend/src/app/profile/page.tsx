"use client";

import { useEffect, useState } from "react";
import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";
import { getProfile, ProfileData } from "@/lib/api/profile";
import {
  ShieldCheck,
  Wallet,
  Coins,
  ShoppingBag,
  CheckCircle2,
  Lock,
  Mail,
  User2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        Loading profile...
      </main>
    );
  }

  const display = {
    username: user.name,
    email: user.email,
    role: user.role,
    verified: user.verified,
    online: true,
    balance: user.stats.wallet,
    coupons: 0,
    bonus: 0,
    orders: user.stats.orders,
    completed: user.stats.orders,
    pending: 0,
    spent: 0,
    joined: user.joined || "2025",
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      <AmbientBackground />
      <FloatingDock />

      {/* Aura */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.15),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,.12),transparent_30%)]" />

      <section className="relative z-10 px-6 pt-32 pb-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[42px] border border-white/10 bg-gradient-to-br from-indigo-500/[0.08] via-violet-500/[0.04] to-emerald-500/[0.04] p-8 backdrop-blur-3xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,.05),transparent_25%)]" />

            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-300">
                  <Sparkles size={16} />
                  Profile Core
                </div>

                <h1 className="mt-4 text-5xl font-black">{display.username}</h1>
                <p className="mt-2 text-zinc-400">{user.username}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/10 bg-emerald-500/10 px-4 py-2 text-emerald-300">
                    <CheckCircle2 size={15} />
                    {display.verified ? "Verified" : "Not Verified"}
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-indigo-500/10 bg-indigo-500/10 px-4 py-2 text-indigo-300">
                    {display.role}
                  </div>
                </div>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/10 text-3xl font-bold text-indigo-300">
                {display.username.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Orders", value: display.orders, icon: ShoppingBag },
                { label: "Wallet", value: `$${display.balance}`, icon: Wallet },
                { label: "Activity", value: `${user.stats.activity}%`, icon: Coins },
                { label: "Trust", value: `${user.stats.trust}%`, icon: ShieldCheck },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[32px] border border-white/10 bg-black/20 p-5"
                >
                  <item.icon className="text-emerald-300" size={18} />
                  <p className="mt-3 text-sm text-zinc-500">{item.label}</p>
                  <h3 className="mt-2 text-2xl font-bold">{item.value}</h3>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[32px] border border-white/10 bg-black/20 p-6 space-y-4">
                <h3 className="text-xl font-semibold">Account Details</h3>
                {[
                  { icon: Mail, label: display.email },
                  { icon: User2, label: user.bio },
                  { icon: Smartphone, label: user.phone },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3"
                  >
                    <row.icon size={18} className="text-zinc-400" />
                    <span className="text-zinc-300">{row.label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-[32px] border border-white/10 bg-black/20 p-6 space-y-4">
                <h3 className="text-xl font-semibold">Security</h3>
                {[
                  { label: "Password", ok: user.security.password },
                  { label: "2FA", ok: user.security.twoFactor },
                  { label: "Device", ok: user.security.deviceVerified },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-zinc-400" />
                      {item.label}
                    </div>
                    <span
                      className={
                        item.ok ? "text-emerald-300" : "text-zinc-500"
                      }
                    >
                      {item.ok ? "Enabled" : "Off"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
