"use client";

import { useEffect, useState } from "react";
import { getAdminWallet } from "@/lib/api/admin";

export default function AdminWalletPage() {
  const [totals, setTotals] = useState({ totalBalance: 0, totalSpent: 0 });
  const [users, setUsers] = useState<
    { username: string; email: string; balance: number; spent: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminWallet()
      .then((r) => {
        setTotals(r.totals);
        setUsers(
          r.users as {
            username: string;
            email: string;
            balance: number;
            spent: number;
          }[]
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading wallet data...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black">Wallet Controls</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[28px] border border-emerald-500/10 bg-emerald-500/10 p-6">
          <p className="text-sm text-zinc-400">Total platform balance</p>
          <h2 className="mt-2 text-4xl font-bold text-emerald-300">
            ${totals.totalBalance.toFixed(2)}
          </h2>
        </div>
        <div className="rounded-[28px] border border-indigo-500/10 bg-indigo-500/10 p-6">
          <p className="text-sm text-zinc-400">Total spent</p>
          <h2 className="mt-2 text-4xl font-bold text-indigo-300">
            ${totals.totalSpent.toFixed(2)}
          </h2>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {users.map((user, i) => (
          <div
            key={i}
            className="flex justify-between rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
          >
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-emerald-300">${user.balance}</p>
              <p className="text-zinc-500">spent ${user.spent}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
