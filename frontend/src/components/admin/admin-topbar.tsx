"use client";

import { useAuth } from "@/components/auth/auth-provider";
export default function AdminTopbar({ title }: { title: string }) {
  const auth = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#060814]/80 px-8 py-5 backdrop-blur-3xl">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-zinc-500">
          {auth.user?.username} · {auth.user?.role}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
          Live
        </span>
      </div>
    </header>
  );
}
