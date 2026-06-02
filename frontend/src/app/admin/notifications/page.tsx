"use client";

import { useEffect, useState } from "react";
import { getAdminNotifications } from "@/lib/api/admin";

type NotifRow = {
  _id: string;
  type: string;
  title: string;
  text: string;
  read: boolean;
  user?: { username: string; email: string };
  createdAt: string;
};

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotifRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminNotifications()
      .then((r) => setItems(r.notifications as NotifRow[]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading notifications...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black">Notifications</h1>
      <p className="mt-2 text-zinc-400">{items.length} system notifications</p>

      <div className="mt-6 space-y-3">
        {items.map((n) => (
          <div
            key={n._id}
            className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-3xl"
          >
            <div className="flex justify-between">
              <p className="font-semibold">{n.title}</p>
              <span className="text-xs text-zinc-500">{n.type}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{n.text}</p>
            <p className="mt-2 text-xs text-zinc-500">
              {n.user?.username || "—"} · {n.read ? "read" : "unread"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
