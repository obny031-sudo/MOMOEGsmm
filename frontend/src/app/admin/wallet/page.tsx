"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { formatEgp } from "@/lib/format-money";
import {
  addAdminBalance,
  deductAdminBalance,
  getAdminUsers,
  getAdminTransfers,
  getAdminWallet,
  transferBalance,
} from "@/lib/api/admin";
import { useLanguage } from "@/lib/i18n/language-context";

type UserRow = { _id: string; username: string; email: string; balance: number };

export default function AdminWalletPage() {
  const { t } = useLanguage();
  const [totals, setTotals] = useState({ totalBalance: 0, totalSpent: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [transfers, setTransfers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [selectedUser, setSelectedUser] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const load = () => {
    Promise.all([
      getAdminWallet(),
      getAdminUsers({ limit: 100 }),
      getAdminTransfers(),
    ])
      .then(([w, u, tr]) => {
        setTotals(w.totals);
        setUsers(
          (u.users as UserRow[]).map((x) => ({
            _id: String(x._id),
            username: String(x.username),
            email: String(x.email),
            balance: Number(x.balance),
          }))
        );
        setTransfers(tr.transfers);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const notify = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      notify(t("common.success"));
      setAmount("");
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : t("common.error"));
    }
  };

  if (loading) return <div className="p-8">{t("common.loading")}</div>;

  return (
    <div>
      <AdminTopbar title={t("admin.wallet")} />
      <div className="p-8">
        {msg && <p className="mb-4 text-sm text-emerald-300">{msg}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-emerald-500/10 bg-emerald-500/10 p-6">
            <p className="text-sm text-zinc-400">Platform balance</p>
            <h2 className="mt-2 text-4xl font-bold text-emerald-300">
              {formatEgp(totals.totalBalance)}
            </h2>
          </div>
          <div className="rounded-[28px] border border-indigo-500/10 bg-indigo-500/10 p-6">
            <p className="text-sm text-zinc-400">Total spent</p>
            <h2 className="mt-2 text-4xl font-bold text-indigo-300">
              {formatEgp(totals.totalSpent)}
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: t("admin.addBalance"),
              action: () =>
                addAdminBalance({
                  userId: selectedUser,
                  amount: Number(amount),
                  reason,
                }),
            },
            {
              title: t("admin.deductBalance"),
              action: () =>
                deductAdminBalance({
                  userId: selectedUser,
                  amount: Number(amount),
                  reason,
                }),
            },
            {
              title: t("admin.transfer"),
              action: () =>
                transferBalance({
                  fromUserId: selectedUser,
                  toUserId: targetUser,
                  amount: Number(amount),
                  note: reason,
                }),
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
            >
              <h3 className="font-semibold">{card.title}</h3>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              >
                <option value="">{t("admin.selectUser")}</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.username} ({formatEgp(u.balance)})
                  </option>
                ))}
              </select>
              {card.title === t("admin.transfer") && (
                <select
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                >
                  <option value="">To user</option>
                  {users
                    .filter((u) => u._id !== selectedUser)
                    .map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.username}
                      </option>
                    ))}
                </select>
              )}
              <input
                placeholder={t("admin.amount")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
              <input
                placeholder={t("admin.reason")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
              <button
                onClick={() => run(card.action)}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 py-2 text-sm font-medium"
              >
                {t("common.submit")}
              </button>
            </div>
          ))}
        </div>

        <h3 className="mt-10 text-lg font-semibold">{t("admin.transferHistory")}</h3>
        <div className="mt-4 space-y-2">
          {transfers.map((tr, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm"
            >
              <span className="text-emerald-300">
                {(tr as { fromUser?: { username?: string } }).fromUser?.username}
              </span>
              {" → "}
              <span className="text-indigo-300">
                {(tr as { toUser?: { username?: string } }).toUser?.username}
              </span>
              <span className="float-right">{formatEgp(Number(tr.amount))}</span>
            </div>
          ))}
          {transfers.length === 0 && (
            <p className="text-zinc-500">No transfers yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
