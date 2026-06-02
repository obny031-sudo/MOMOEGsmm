"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { getAdminHealth } from "@/lib/api/admin";

export default function AdminHealthPage() {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    getAdminHealth().then((r) => setHealth(r.health));
    const t = setInterval(() => {
      getAdminHealth().then((r) => setHealth(r.health));
    }, 15000);
    return () => clearInterval(t);
  }, []);

  if (!health) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <AdminTopbar title="System Health" />
      <div className="grid gap-4 p-8 md:grid-cols-2">
        {Object.entries(health).map(([key, value]) => (
          <div
            key={key}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
          >
            <p className="text-sm text-zinc-500">{key}</p>
            <p className="mt-2 text-xl font-semibold text-emerald-300">
              {String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
