"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { getAdminAuditLogs } from "@/lib/api/admin";

type LogRow = {
  _id: string;
  actorUsername: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  createdAt: string;
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);

  useEffect(() => {
    getAdminAuditLogs().then((r) => setLogs(r.logs as LogRow[]));
  }, []);

  return (
    <div>
      <AdminTopbar title="Audit Timeline" />
      <div className="space-y-3 p-8">
        {logs.map((log) => (
          <div
            key={log._id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="flex justify-between">
              <p className="font-medium">
                {log.action} · {log.resource}
              </p>
              <span className="text-xs text-zinc-500">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              {log.actorUsername} ({log.actorRole}) · {log.resourceId}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
