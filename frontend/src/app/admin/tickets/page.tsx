"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { getAdminTickets, replyAdminTicket } from "@/lib/api/admin";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Record<string, unknown>[]>([]);
  const [reply, setReply] = useState<Record<string, string>>({});

  const load = () => {
    getAdminTickets().then((r) => setTickets(r.tickets));
  };

  useEffect(() => {
    load();
  }, []);

  const sendReply = async (id: string) => {
    const message = reply[id];
    if (!message) return;
    await replyAdminTicket(id, { message, status: "Pending" });
    setReply({ ...reply, [id]: "" });
    load();
  };

  return (
    <div>
      <AdminTopbar title="Support Tickets" />
      <div className="space-y-4 p-8">
        {tickets.map((ticket) => {
          const id = String(ticket._id);
          return (
            <div
              key={id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex justify-between">
                <p className="font-semibold">{String(ticket.subject)}</p>
                <span className="text-sm text-zinc-500">
                  {String(ticket.status)}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  placeholder="Admin reply..."
                  value={reply[id] || ""}
                  onChange={(e) =>
                    setReply({ ...reply, [id]: e.target.value })
                  }
                  className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2"
                />
                <button
                  onClick={() => sendReply(id)}
                  className="rounded-xl bg-indigo-500/30 px-4 py-2 text-sm"
                >
                  Reply
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
