"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { getAdminAudit } from "@/lib/api/admin";
import { useLanguage } from "@/lib/i18n/language-context";

type LogRow = {
  _id: string;
  actorUsername: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  ip?: string;
  createdAt: string;
};

export default function AdminAuditPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [search, setSearch] = useState("");
  const [resource, setResource] = useState("");

  const load = () => {
    getAdminAudit({ search: search || undefined, resource: resource || undefined }).then(
      (r) => setLogs(r.logs as LogRow[])
    );
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminTopbar title={t("admin.audit")} />
      <div className="p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
          />
          <select
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
          >
            <option value="">All resources</option>
            <option value="user">user</option>
            <option value="order">order</option>
            <option value="service">service</option>
            <option value="provider">provider</option>
            <option value="wallet">wallet</option>
          </select>
          <button
            onClick={load}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm"
          >
            {t("common.search")}
          </button>
        </div>
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log._id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex justify-between gap-4">
                <p className="font-medium">
                  {log.action} · {log.resource}
                </p>
                <span className="text-xs text-zinc-500 shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                {log.actorUsername} ({log.actorRole}) · {log.resourceId}
                {log.ip && <span> · IP {log.ip}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
