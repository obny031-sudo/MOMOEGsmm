"use client";

import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";
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

  /* Dynamic Mock Data */

  const user = {
    username: "momo_user",
    email: "user@email.com",
    role: "Elite Member",
    verified: true,
    online: true,
    balance: 125.40,
    coupons: 3,
    bonus: 18,
    orders: 52,
    completed: 47,
    pending: 5,
    spent: 342,
    joined: "2025",
  };

  return (

    <main className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">

      <AmbientBackground />
      <FloatingDock />

      {/* Aura */}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.12),transparent_25%)]"/>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,.10),transparent_25%)]"/>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-16">

        {/* Header */}

        <motion.div
          initial={{
            opacity:0,
            y:15
          }}
          animate={{
            opacity:1,
            y:0
          }}
          className="mb-8 flex flex-wrap items-center justify-between gap-5"
        >

          <div>

            <div className="flex items-center gap-2 text-indigo-300">

              <Sparkles size={16}/>

              Elite Identity

            </div>

            <h1 className="mt-2 text-5xl font-bold">

              Profile Center

            </h1>

            <p className="mt-2 text-zinc-400">

              Dynamic member dashboard

            </p>

          </div>

          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">

            {user.online
              ? "Online"
              : "Offline"}

          </div>

        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">

          {/* LEFT */}

          <motion.div
            initial={{
              opacity:0,
              x:-15
            }}
            animate={{
              opacity:1,
              x:0
            }}
            className="rounded-[40px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-3xl"
          >

            {/* Avatar */}

            <div className="flex flex-col items-center text-center">

              <div className="relative">

                <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl"/>

                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 text-5xl font-bold shadow-[0_0_50px_rgba(99,102,241,.25)]">

                  {user.username[0]
                    .toUpperCase()}

                </div>

              </div>

              <h2 className="mt-6 text-3xl font-bold">

                {user.username}

              </h2>

              <p className="mt-1 text-zinc-400">

                {user.role}

              </p>

              <div className="mt-4 flex gap-3">

                {user.verified && (

                  <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">

                    Verified

                  </div>

                )}

                <div className="rounded-2xl bg-indigo-500/10 px-3 py-2 text-sm text-indigo-300">

                  Joined {user.joined}

                </div>

              </div>

            </div>

            {/* Info */}

            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3 rounded-3xl bg-black/20 p-4">

                <User2
                  size={18}
                  className="text-indigo-300"
                />

                <div>

                  <p className="text-xs text-zinc-500">
                    Username
                  </p>

                  <h3>
                    {user.username}
                  </h3>

                </div>

              </div>

              <div className="flex items-center gap-3 rounded-3xl bg-black/20 p-4">

                <Mail
                  size={18}
                  className="text-emerald-300"
                />

                <div>

                  <p className="text-xs text-zinc-500">
                    Email
                  </p>

                  <h3>
                    {user.email}
                  </h3>

                </div>

              </div>

              <div className="flex items-center gap-3 rounded-3xl bg-black/20 p-4">

                <ShieldCheck
                  size={18}
                  className="text-emerald-300"
                />

                <div>

                  <p className="text-xs text-zinc-500">
                    Status
                  </p>

                  <h3>

                    {user.verified
                      ? "Verified Member"
                      : "Unverified"}

                  </h3>

                </div>

              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* Wallet */}

            <motion.div
              initial={{
                opacity:0,
                y:10
              }}
              animate={{
                opacity:1,
                y:0
              }}
              className="rounded-[40px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
            >

              <div className="flex items-center justify-between">

                <h3 className="text-2xl font-semibold">
                  Wallet
                </h3>

                <Wallet
                  size={20}
                  className="text-emerald-300"
                />

              </div>

              <div className="mt-5 grid grid-cols-3 gap-4">

                <div className="rounded-3xl bg-black/20 p-5">

                  <p className="text-sm text-zinc-500">
                    Balance
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-emerald-300">
                    ${user.balance}
                  </h2>

                </div>

                <div className="rounded-3xl bg-black/20 p-5">

                  <p className="text-sm text-zinc-500">
                    Coupons
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-indigo-300">
                    {user.coupons}
                  </h2>

                </div>

                <div className="rounded-3xl bg-black/20 p-5">

                  <p className="text-sm text-zinc-500">
                    Bonus
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-yellow-300">
                    ${user.bonus}
                  </h2>

                </div>

              </div>

            </motion.div>

            {/* Stats */}

            <motion.div
              initial={{
                opacity:0,
                y:10
              }}
              animate={{
                opacity:1,
                y:0
              }}
              className="rounded-[40px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
            >

              <h3 className="text-2xl font-semibold">
                Activity
              </h3>

              <div className="mt-5 grid grid-cols-4 gap-4">

                {[
                  {
                    icon:ShoppingBag,
                    value:user.orders,
                    label:"Orders",
                    color:"text-indigo-300",
                  },
                  {
                    icon:CheckCircle2,
                    value:user.completed,
                    label:"Done",
                    color:"text-emerald-300",
                  },
                  {
                    icon:Coins,
                    value:user.pending,
                    label:"Pending",
                    color:"text-yellow-300",
                  },
                  {
                    icon:Wallet,
                    value:`$${user.spent}`,
                    label:"Spent",
                    color:"text-pink-300",
                  },
                ].map((x,i)=>(

                  <div
                    key={i}
                    className="rounded-3xl bg-black/20 p-4 text-center transition hover:bg-white/[0.04]"
                  >

                    <x.icon
                      size={18}
                      className={`mx-auto ${x.color}`}
                    />

                    <h2 className="mt-3 text-2xl font-bold">

                      {x.value}

                    </h2>

                    <p className="text-xs text-zinc-500">

                      {x.label}

                    </p>

                  </div>

                ))}

              </div>

            </motion.div>

            {/* Security */}

            <motion.div
              initial={{
                opacity:0,
                y:10
              }}
              animate={{
                opacity:1,
                y:0
              }}
              className="rounded-[40px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
            >

              <div className="flex items-center justify-between">

                <h3 className="text-2xl font-semibold">
                  Security
                </h3>

                <Lock
                  size={18}
                  className="text-red-300"
                />

              </div>

              <div className="mt-5 flex flex-wrap gap-3">

                <button className="rounded-2xl bg-indigo-500/10 px-4 py-3 text-indigo-300 hover:bg-indigo-500/20">
                  Change Password
                </button>

                <button className="rounded-2xl bg-white/[0.05] px-4 py-3 text-zinc-300 hover:bg-white/[0.08]">
                  Secure Session
                </button>

                <button className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-emerald-300 hover:bg-emerald-500/20">

                  <div className="flex items-center gap-2">

                    <Smartphone size={16}/>
                    Devices

                  </div>

                </button>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

    </main>
  );
}