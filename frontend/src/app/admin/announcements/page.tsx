"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { createAnnouncement, getAdminAnnouncements } from "@/lib/api/admin";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const load = () => {
    getAdminAnnouncements().then((r) => setItems(r.announcements));
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async () => {
    await createAnnouncement({ title, body, type: "info", active: true });
    setTitle("");
    setBody("");
    load();
  };

  return (
    <div>
      <AdminTopbar title="Announcements" />
      <div className="p-8">
        <div className="mb-8 space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2"
          />
          <textarea
            placeholder="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[100px] w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2"
          />
          <button
            onClick={publish}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-5 py-2"
          >
            Publish
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={String(item._id)}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <p className="font-semibold">{String(item.title)}</p>
              <p className="text-sm text-zinc-400">{String(item.body)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
