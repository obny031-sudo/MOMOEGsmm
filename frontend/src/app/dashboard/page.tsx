"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";
import { getDashboardSafe, DashboardData } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  Wallet,
  Bell,
  ShieldCheck,
  Sparkles,
  LogOut,
  Crown,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function DashboardPage() {
  const router = useRouter();
  const auth = useRequireAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const logout = useCallback(() => {
    auth.logout();
    router.replace("/login");
  }, [auth, router]);

  const loadDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");

      const { data } = await getDashboardSafe();
      setDashboard(data);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        auth.logout();
        router.replace("/login");
        return;
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard";
      console.error("Dashboard Error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [auth, router]);

  useEffect(() => {
    if (auth.isLoading || !auth.isAuthenticated) return;
    loadDashboard();
  }, [auth.isLoading, auth.isAuthenticated, loadDashboard]);

  /* AUTO REFRESH - كل 30 ثانية */
  useEffect(() => {
    if (loading || error || !dashboard) return;

    const interval = setInterval(() => {
      loadDashboard(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [dashboard, error, loading, loadDashboard]);

  /* GREETING MESSAGE */
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 18) {
      return "Good Afternoon";
    }

    return "Good Evening";
  }, []);

  if (auth.isLoading || !auth.isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060814] text-white">
        <motion.div
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
          className="rounded-[36px] border border-white/10 bg-white/[0.04] px-8 py-5 backdrop-blur-3xl"
        >
          Checking authentication...
        </motion.div>
      </main>
    );
  }

  /* LOADING STATE */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060814] text-white">
        <motion.div
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
          className="rounded-[36px] border border-white/10 bg-white/[0.04] px-8 py-5 backdrop-blur-3xl"
        >
          Loading MOMOEG...
        </motion.div>
      </main>
    );
  }

  /* ERROR STATE */
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060814] text-white">
        <div className="rounded-[36px] border border-red-500/10 bg-red-500/10 px-8 py-6">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => loadDashboard()}
            className="rounded-2xl bg-red-500/20 px-4 py-2 text-red-300 hover:bg-red-500/30 transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  /* SAFE DATA ACCESS */
  if (!dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060814] text-white">
        <div className="rounded-[36px] border border-yellow-500/10 bg-yellow-500/10 px-8 py-6 text-yellow-300">
          No dashboard data available
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060814] text-white">
      <AmbientBackground />
      <FloatingDock />

      {/* AURA */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,.18),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,.15),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(168,85,247,.12),transparent_30%)]" />

      <section className="relative z-10 px-6 pt-32 pb-16">
        <div className="mx-auto max-w-7xl">
          {/* HERO */}
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="relative overflow-hidden rounded-[42px] border border-white/10 bg-gradient-to-br from-indigo-500/[0.08] via-violet-500/[0.04] to-emerald-500/[0.04] p-8 backdrop-blur-3xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,.05),transparent_25%)]" />

            <div className="relative flex flex-wrap items-start justify-between gap-6">
              {/* LEFT */}
              <div>
                <div className="flex items-center gap-2 text-indigo-300">
                  <Sparkles size={16} />
                  MOMOEG Elite
                </div>

                <h1 className="mt-4 text-5xl font-black">
                  {greeting},
                  <br />
                  {dashboard?.username || "Elite User"}
                </h1>

                <p className="mt-3 text-zinc-400">Premium Command Center</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/10 bg-emerald-500/10 px-4 py-2 text-emerald-300">
                    <CheckCircle2 size={15} />
                    {dashboard?.verified ? "Verified" : "Not Verified"}
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-indigo-500/10 bg-indigo-500/10 px-4 py-2 text-indigo-300">
                    <Crown size={15} />
                    {dashboard?.profile?.rank || "Standard"}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex gap-3">
                {/* NOTIFICATION */}
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-3xl">
                  <Bell size={20} />
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] text-black font-bold">
                    {dashboard?.notifications || 0}
                  </div>
                </div>

                {/* LOGOUT */}
                <button
                  onClick={logout}
                  className="rounded-3xl border border-red-500/10 bg-red-500/10 p-4 text-red-300 hover:bg-red-500/20 transition"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            {/* WALLET + PROFILE */}
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
              {/* WALLET */}
              <div className="rounded-[36px] border border-emerald-500/10 bg-emerald-500/[0.05] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Wallet size={18} />
                    Wallet Core
                  </div>

                  <div className="rounded-xl bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                    Secure
                  </div>
                </div>

                <h2 className="mt-5 text-5xl font-black text-emerald-300">
                  $
                  <CountUp end={dashboard?.balance || 0} decimals={0} />
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-black/20 p-4">
                    <p className="text-sm text-zinc-500">Pending</p>
                    <h3 className="mt-2 text-2xl font-bold">
                      ${dashboard?.pending || 0}
                    </h3>
                  </div>

                  <div className="rounded-3xl bg-black/20 p-4">
                    <p className="text-sm text-zinc-500">Bonus</p>
                    <h3 className="mt-2 text-2xl font-bold text-emerald-300">
                      ${dashboard?.bonus || 0}
                    </h3>
                  </div>
                </div>
              </div>

              {/* PROFILE */}
              <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-500/10 text-xl font-bold text-indigo-300">
                    {dashboard?.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {dashboard?.username || "User"}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {dashboard?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-black/20 p-3">
                    <span>Rank</span>
                    <span>{dashboard?.profile?.rank || "Standard"}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-black/20 p-3">
                    <span>Status</span>
                    <span>{dashboard?.profile?.status || "Active"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-7 grid gap-4 md:grid-cols-4">
              {[
                { title: "Deposit", icon: "💸", href: "/wallet" },
                { title: "Orders", icon: "🛒", href: "/orders" },
                { title: "Wallet", icon: "🏦", href: "/wallet" },
                { title: "Support", icon: "🛡", href: "/support" },
              ].map((item) => (
                <Link key={item.title} href={item.href}>
                  <motion.div
                    whileHover={{
                      y: -3,
                      scale: 1.02,
                    }}
                    className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-3xl transition hover:border-indigo-500/20 hover:bg-indigo-500/[0.06] cursor-pointer"
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* STATS */}
            <div className="mt-7 grid gap-5 md:grid-cols-4">
              {[
                {
                  title: "Balance",
                  value: dashboard?.balance || 0,
                  prefix: "$",
                  color: "from-emerald-500/15 to-emerald-500/5",
                },
                {
                  title: "Orders",
                  value: dashboard?.stats?.orders || 0,
                  color: "from-indigo-500/15 to-indigo-500/5",
                },
                {
                  title: "Growth",
                  value: dashboard?.stats?.growth || 0,
                  suffix: "%",
                  color: "from-violet-500/15 to-violet-500/5",
                },
                {
                  title: "Health",
                  value: dashboard?.health || 0,
                  suffix: "%",
                  color: "from-cyan-500/15 to-cyan-500/5",
                },
              ].map((x, i) => (
                <motion.div
                  key={i}
                  whileHover={{
                    y: -4,
                  }}
                  className={`rounded-[36px] border border-white/10 bg-gradient-to-br ${x.color} p-6 backdrop-blur-3xl`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500">{x.title}</p>
                    <div className="rounded-xl bg-white/10 px-2 py-1 text-xs">
                      Live
                    </div>
                  </div>

                  <h2 className="mt-5 text-4xl font-black">
                    {x.prefix}
                    <CountUp end={x.value} decimals={0} />
                    {x.suffix}
                  </h2>
                </motion.div>
              ))}
            </div>

            {/* FEEDS */}
            <div className="mt-7 grid gap-6 lg:grid-cols-3">
              {dashboard?.orderFeed && (
                <FeedBox
                  title="Orders"
                  data={dashboard.orderFeed}
                  color="bg-indigo-400"
                />
              )}

              {dashboard?.depositFeed && (
                <FeedBox
                  title="Deposits"
                  data={dashboard.depositFeed}
                  color="bg-emerald-400"
                />
              )}

              {dashboard?.processingFeed && (
                <FeedBox
                  title="Processing"
                  data={dashboard.processingFeed}
                  color="bg-orange-400"
                />
              )}
            </div>

            {/* INTELLIGENCE */}
            <div className="mt-7 rounded-[38px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Intelligence Status</p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    Secure Node · Premium Route · Stable API
                  </h3>
                </div>

                <div className="rounded-3xl bg-emerald-500/10 px-5 py-3 text-emerald-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} />
                    {dashboard?.health || 0}% Healthy
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* FEED BOX COMPONENT */
interface FeedBoxProps {
  title: string;
  data: string[];
  color: string;
}

function FeedBox({ title, data, color }: FeedBoxProps) {
  if (!data || data.length === 0) {
    return (
      <div className="overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-3xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <div className="rounded-xl bg-white/10 px-2 py-1 text-xs text-zinc-400">
            Live
          </div>
        </div>
        <div className="relative mt-5 h-[280px] flex items-center justify-center text-zinc-500">
          No data available
        </div>
      </div>
    );
  }

  const duplicatedData = [...data, ...data];

  return (
    <div className="overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-3xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="rounded-xl bg-white/10 px-2 py-1 text-xs text-zinc-400">
          Live
        </div>
      </div>

      <div className="relative mt-5 h-[280px] overflow-hidden">
        <motion.div
          animate={{
            y: [0, -(data.length * 72)],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="space-y-3"
        >
          {duplicatedData.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{
                x: 3,
              }}
              className="flex items-center gap-3 rounded-3xl border border-white/5 bg-black/20 px-4 py-4"
            >
              <motion.div
                animate={{
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
                className={`h-2.5 w-2.5 rounded-full ${color}`}
              />

              <span className="text-sm text-zinc-200">{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}