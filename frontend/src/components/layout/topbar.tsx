"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { formatEgp } from "@/lib/format-money";

export default function Topbar() {
  const { user } = useAuth();
  const balance = user?.balance ?? 0;

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/5 px-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="glass rounded-2xl px-4 py-2 text-sm text-zinc-300">
          Balance: {formatEgp(balance)}
        </div>

        <div className="h-10 w-10 rounded-2xl bg-indigo-500 glow" />
      </div>
    </header>
  );
}
