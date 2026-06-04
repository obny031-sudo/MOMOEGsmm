"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/admin-topbar";
import { getOwnerDashboard, setPanicMode } from "@/lib/api/admin";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { useLanguage } from "@/lib/i18n/language-context";

export default function OwnerControlPage() {
  const { isOwner, ready } = useAdminGuard();
  const router = useRouter();
  const { t } = useLanguage();
  const [panic, setPanic] = useState(false);
  const [audit, setAudit] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (ready && !isOwner) router.replace("/admin");
  }, [ready, isOwner, router]);

  useEffect(() => {
    if (!isOwner) return;
    getOwnerDashboard().then((r) => {
      setPanic(r.panicMode);
      setAudit(r.recentAudit);
    });
  }, [isOwner]);

  if (!ready || !isOwner) {
    return <div className="p-8">{t("common.loading")}</div>;
  }

  return (
    <div>
      <AdminTopbar title={t("admin.owner")} />
      <div className="p-8 space-y-6">
        <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-6">
          <h2 className="text-xl font-bold text-red-300">{t("admin.panicButton")}</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Disables maintenance mode, deposits, registration, and logs out all staff sessions.
          </p>
          <button
            onClick={async () => {
              const next = !panic;
              await setPanicMode(next);
              setPanic(next);
            }}
            className={`mt-4 rounded-2xl px-6 py-3 font-medium ${
              panic ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/30 text-red-200"
            }`}
          >
            {panic ? "Disable panic mode" : "Activate panic mode"}
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Recent audit</h3>
          <ul className="mt-3 space-y-2">
            {audit.map((log, i) => (
              <li
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm"
              >
                <span className="text-indigo-300">{String(log.action)}</span>
                <span className="text-zinc-500"> · {String(log.actorUsername)}</span>
                <span className="float-right text-zinc-500">
                  {new Date(String(log.createdAt)).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
