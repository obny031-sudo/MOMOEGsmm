"use client";

import { useEffect, useState } from "react";
import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";
import { apiFetch } from "@/lib/api/client";

export default function SupportPage() {
  const [tickets, setTickets] = useState<Record<string, unknown>[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    apiFetch<{ tickets: Record<string, unknown>[] }>("/api/v1/tickets", {
      auth: true,
    })
      .then((r) => setTickets(r.tickets))
      .catch(() => setTickets([]));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    try {
      setError("");
      await apiFetch("/api/v1/tickets", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ subject, message }),
      });
      setSubject("");
      setMessage("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <main className="relative min-h-screen bg-[#060814] text-white">
      <AmbientBackground />
      <FloatingDock />
      <section className="relative z-10 mx-auto max-w-3xl px-6 pt-32 pb-16">
        <h1 className="text-4xl font-black">Support Center</h1>
        <p className="mt-2 text-zinc-400">Open a ticket — our team will respond.</p>

        <div className="mt-8 space-y-4 rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
          <input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <textarea
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          {error && <p className="text-red-300 text-sm">{error}</p>}
          <button
            onClick={submit}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-400 py-3 font-medium"
          >
            Submit Ticket
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {tickets.map((t) => (
            <div
              key={String(t._id)}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <p className="font-medium">{String(t.subject)}</p>
              <p className="text-sm text-zinc-500">{String(t.status)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
