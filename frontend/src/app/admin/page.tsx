"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { getAdminOverview, AdminOverview } from "@/lib/api/admin";
import { motion } from "framer-motion";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Activity,
  Crown,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOverview()
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        Loading overview...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-red-300">{error || "No data"}</div>
    );
  }

  const stats = [
    { label: "Total Users", value: data.overview.totalUsers, icon: Users },
    { label: "Total Orders", value: data.overview.totalOrders, icon: ShoppingBag },
    {
      label: "Revenue",
      value: `$${data.overview.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
    },
    {
      label: "Pending Orders",
      value: data.overview.pendingOrders,
      icon: Activity,
    },
    { label: "VIP Users", value: data.overview.vipUsers, icon: Crown },
    { label: "Admins", value: data.overview.admins, icon: ShieldCheck },
  ];

  return (
    <div>
      <AdminTopbar title="Admin Overview" />
      <div className="p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,.12),transparent_30%)]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <p className="text-zinc-400">Live platform intelligence</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-3xl"
            >
              <item.icon className="text-emerald-300" size={18} />
              <p className="mt-3 text-xs text-zinc-500">{item.label}</p>
              <h3 className="mt-2 text-2xl font-bold">{item.value}</h3>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <div className="mt-4 space-y-3">
              {data.recentUsers.map((user, i) => (
                <div
                  key={String((user as { _id?: string })._id || i)}
                  className="flex justify-between rounded-2xl bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{String((user as { username?: string }).username)}</p>
                    <p className="text-sm text-zinc-500">{String((user as { email?: string }).email)}</p>
                  </div>
                  <span className="text-sm text-zinc-400">
                    {String((user as { role?: string }).role)} · ${String((user as { balance?: number }).balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <div className="mt-4 space-y-3">
              {data.recentOrders.map((order, i) => (
                <div
                  key={String((order as { _id?: string })._id || i)}
                  className="flex justify-between rounded-2xl bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {String((order as { id?: string }).id)} ·{" "}
                      {String((order as { service?: string }).service)}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {String(
                        (order as { user?: { username?: string } }).user
                          ?.username || "—"
                      )}
                    </p>
                  </div>
                  <span className="text-sm text-emerald-300">
                    {String((order as { status?: string }).status)} · $
                    {String((order as { totalCharge?: number }).totalCharge)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
