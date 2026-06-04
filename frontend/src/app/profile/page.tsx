"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";
import PreferencesControls from "@/components/settings/preferences-controls";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { formatEgp } from "@/lib/format-money";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  getProfile,
  getProfileActivity,
  getSessions,
  getLoginHistory,
  requestPasswordOtp,
  confirmPasswordChange,
  requestEmailOtp,
  confirmEmailChange,
  revokeOtherSessions,
  ProfileData,
} from "@/lib/api/profile";
import {
  Wallet,
  ShoppingBag,
  Shield,
  Sparkles,
  Users,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

export default function ProfilePage() {
  useRequireAuth();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [timeline, setTimeline] = useState<
    { type: string; title: string; detail: string; at: string }[]
  >([]);
  const [sessions, setSessions] = useState<
    { _id: string; device: string; ip: string; current: boolean; lastActivity: string }[]
  >([]);
  const [loginHistory, setLoginHistory] = useState<
    { ip: string; device: string; date: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [secMsg, setSecMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    Promise.all([
      getProfile(),
      getProfileActivity().catch(() => ({ timeline: [] })),
      getSessions().catch(() => ({ sessions: [] })),
      getLoginHistory().catch(() => ({ loginHistory: [] })),
    ])
      .then(([p, a, s, h]) => {
        setProfile(p);
        setTimeline(a.timeline || []);
        setSessions(s.sessions || []);
        setLoginHistory(h.loginHistory || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center">
        {t("common.loading")}
      </main>
    );
  }

  return (
    <main className="page-shell relative min-h-screen overflow-hidden">
      <AmbientBackground />
      <FloatingDock />

      <section className="relative z-10 px-6 pt-32 pb-16">
        <div className="mx-auto max-w-6xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[40px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-3xl"
          >
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-300">
                  <Sparkles size={16} />
                  {t("profile.accountOverview")}
                </div>
                <h1 className="mt-3 text-4xl font-black">{profile.name}</h1>
                <p className="mt-1 text-zinc-500">{profile.email}</p>
                <p className="mt-2 text-sm text-zinc-400 capitalize">{profile.role}</p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/10 text-3xl font-bold text-indigo-300">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Section title={t("profile.walletSummary")} icon={Wallet}>
              <Stat label={t("wallet.available")} value={formatEgp(profile.stats.wallet)} />
              <Stat label={t("profile.spent")} value={formatEgp(profile.stats.spent)} />
            </Section>
            <Section title={t("profile.referralSummary")} icon={Users}>
              <Stat label={t("profile.referralCode")} value={profile.referral.code} />
              <Stat
                label={t("profile.earnings")}
                value={formatEgp(profile.referral.earnings)}
              />
            </Section>
            <Section title={t("profile.recentOrders")} icon={ShoppingBag}>
              <Stat label={t("profile.orders")} value={String(profile.stats.orders)} />
              <Stat label="Completed" value={String(profile.stats.completed)} />
              <Link href="/orders" className="mt-2 text-sm text-indigo-300 hover:underline">
                View all orders
              </Link>
            </Section>
          </div>

          <Section title={t("profile.activity")} icon={Activity}>
            <ul className="space-y-2">
              {timeline.slice(0, 12).map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between gap-4 rounded-2xl bg-black/20 px-4 py-3 text-sm"
                >
                  <span>
                    {item.title}
                    <span className="mt-1 block text-zinc-500">{item.detail}</span>
                  </span>
                  <span className="shrink-0 text-zinc-500">
                    {new Date(item.at).toLocaleString()}
                  </span>
                </li>
              ))}
              {timeline.length === 0 && (
                <li className="text-sm text-zinc-500">No activity yet.</li>
              )}
            </ul>
          </Section>

          <Section title={t("profile.preferences")} icon={Sparkles}>
            <PreferencesControls />
          </Section>

          <Section title={t("profile.securityCenter")} icon={Shield}>
            {secMsg && <p className="mb-3 text-sm text-emerald-300">{secMsg}</p>}

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl bg-black/20 p-4">
                <h4 className="font-medium">{t("profile.changePassword")}</h4>
                <input
                  type="password"
                  placeholder={t("profile.currentPassword")}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                />
                <button
                  onClick={async () => {
                    await requestPasswordOtp(currentPassword);
                    setSecMsg("Verification code sent to your email");
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm"
                >
                  {t("profile.sendCode")}
                </button>
                <input
                  type="text"
                  placeholder={t("profile.verificationCode")}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  placeholder={t("profile.newPassword")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                />
                <button
                  onClick={async () => {
                    await confirmPasswordChange(otpCode, newPassword);
                    setSecMsg("Password updated");
                    setOtpCode("");
                    setNewPassword("");
                    setCurrentPassword("");
                  }}
                  className="rounded-xl bg-indigo-500/20 px-4 py-2 text-sm text-indigo-300"
                >
                  {t("profile.confirmChange")}
                </button>
              </div>

              <div className="space-y-3 rounded-2xl bg-black/20 p-4">
                <h4 className="font-medium">{t("profile.changeEmail")}</h4>
                <input
                  type="email"
                  placeholder="New email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                />
                <button
                  onClick={async () => {
                    await requestEmailOtp(newEmail, currentPassword);
                    setSecMsg("Email verification code sent");
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm"
                >
                  {t("profile.sendCode")}
                </button>
                <button
                  onClick={async () => {
                    await confirmEmailChange(otpCode, newEmail);
                    setSecMsg("Email updated");
                  }}
                  className="rounded-xl bg-indigo-500/20 px-4 py-2 text-sm text-indigo-300"
                >
                  {t("profile.confirmChange")}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium">{t("profile.activeSessions")}</h4>
                <ul className="space-y-2">
                  {sessions.map((s) => (
                    <li
                      key={s._id}
                      className="rounded-xl bg-black/20 px-3 py-2 text-sm"
                    >
                      {s.device} · {s.ip}
                      {s.current && (
                        <span className="ms-2 text-emerald-300">(current)</span>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={async () => {
                    await revokeOtherSessions();
                    setSecMsg("Other sessions logged out");
                  }}
                  className="mt-3 rounded-xl border border-white/10 px-4 py-2 text-sm"
                >
                  {t("profile.logoutOthers")}
                </button>
              </div>
              <div>
                <h4 className="mb-2 font-medium">{t("profile.loginHistory")}</h4>
                <ul className="max-h-48 space-y-2 overflow-y-auto">
                  {loginHistory.map((h, i) => (
                    <li key={i} className="rounded-xl bg-black/20 px-3 py-2 text-sm">
                      {h.device} · {h.ip}
                      <span className="mt-1 block text-zinc-500">
                        {new Date(h.date).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        </div>
      </section>
    </main>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl">
      <div className="mb-4 flex items-center gap-2 text-indigo-300">
        <Icon size={18} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
