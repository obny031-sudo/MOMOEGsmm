"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { formatEgp } from "@/lib/format-money";
import { getAdminFinance } from "@/lib/api/admin";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AdminFinancePage() {
  const { t } = useLanguage();
  const [finance, setFinance] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    getAdminFinance().then((r) => setFinance(r.finance));
  }, []);

  if (!finance) {
    return <div className="p-8">{t("common.loading")}</div>;
  }

  const cards = [
    { label: "Revenue (all)", value: formatEgp(finance.revenue) },
    { label: t("admin.revenueToday"), value: formatEgp(finance.revenueToday) },
    { label: t("admin.revenueMonth"), value: formatEgp(finance.revenueMonth) },
    { label: t("admin.providerCosts"), value: formatEgp(finance.providerCosts) },
    { label: t("admin.grossProfit"), value: formatEgp(finance.grossProfit) },
    { label: t("admin.netProfit"), value: formatEgp(finance.netProfit) },
    { label: t("admin.profitToday"), value: formatEgp(finance.profitToday) },
    { label: t("admin.profitMonth"), value: formatEgp(finance.profitMonth) },
    { label: t("admin.refunds"), value: formatEgp(finance.refunds) },
    { label: t("admin.deposits"), value: formatEgp(finance.deposits) },
    { label: "Wallet transfers", value: formatEgp(finance.walletTransfers) },
    { label: "Platform wallet total", value: formatEgp(finance.totalWalletBalance) },
  ];

  return (
    <div>
      <AdminTopbar title={t("admin.finance")} />
      <div className="p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
            >
              <p className="text-sm text-zinc-500">{c.label}</p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-300">{c.value}</h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
