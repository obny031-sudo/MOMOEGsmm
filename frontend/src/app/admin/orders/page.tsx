"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { formatEgp } from "@/lib/format-money";
import {
  getAdminOrders,
  getAdminOrder,
  updateAdminOrder,
  retryAdminOrder,
  refundAdminOrder,
  exportAdminOrders,
} from "@/lib/api/admin";

type OrderRow = {
  _id: string;
  id: string;
  service: string;
  category?: string;
  status: string;
  totalCharge: number;
  providerCost?: number;
  profit?: number;
  quantity: number;
  link: string;
  progress: number;
  providerOrderId?: string;
  user: { username: string; email?: string; _id?: string } | null;
  provider?: { name: string } | null;
  timeline?: { event: string; message?: string; createdAt?: string }[];
  createdAt: string;
};

const FILTERS = [
  "All",
  "Queued",
  "Processing",
  "Completed",
  "Failed",
  "Refunded",
  "Cancelled",
  "Partial",
];

const STATUS_COLOR: Record<string, string> = {
  Pending: "text-yellow-300",
  Queued: "text-yellow-300",
  Sent: "text-blue-300",
  Processing: "text-blue-300",
  Running: "text-blue-300",
  Completed: "text-emerald-300",
  Partial: "text-orange-300",
  Failed: "text-red-300",
  Refunded: "text-purple-300",
  Cancelled: "text-zinc-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<OrderRow | null>(null);

  const load = () => {
    setLoading(true);
    getAdminOrders({
      status: filter === "All" ? undefined : filter,
      search: search || undefined,
    })
      .then((r) => setOrders(r.orders as OrderRow[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const analytics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) =>
      ["Pending", "Queued", "Processing", "Sent", "Running"].includes(o.status)
    ).length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    const failed = orders.filter((o) => o.status === "Failed").length;
    const revenue = orders.reduce((s, o) => s + (o.totalCharge || 0), 0);
    const profit = orders.reduce((s, o) => s + (o.profit || 0), 0);
    return { total, pending, completed, failed, revenue, profit };
  }, [orders]);

  const openOrder = async (id: string) => {
    const r = await getAdminOrder(id);
    setSelected(r.order as OrderRow);
  };

  const updateStatus = async (id: string, status: string) => {
    await updateAdminOrder(id, { status });
    load();
    if (selected?._id === id) openOrder(id);
  };

  const handleExport = async () => {
    const r = await exportAdminOrders();
    const blob = new Blob([JSON.stringify(r.export, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminTopbar title="Orders Center" />
      <div className="p-8">
        <div className="mb-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total", value: analytics.total },
            { label: "Pending", value: analytics.pending },
            { label: "Completed", value: analytics.completed },
            { label: "Failed", value: analytics.failed },
            { label: "Revenue", value: formatEgp(analytics.revenue) },
            { label: "Profit", value: formatEgp(analytics.profit) },
          ].map((x) => (
            <div
              key={x.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-3xl"
            >
              <p className="text-xs text-zinc-500">{x.label}</p>
              <p className="mt-1 text-xl font-bold">{x.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-sm ${
                filter === f
                  ? "bg-indigo-500/20 text-white"
                  : "border border-white/10 text-zinc-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <input
            placeholder="Search order, service, link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
          />
          <button
            onClick={load}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm"
          >
            Search
          </button>
          <button
            onClick={handleExport}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm"
          >
            Export
          </button>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div className="overflow-x-auto rounded-[24px] border border-white/10">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-zinc-500">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Revenue</th>
                  <th className="p-3">Profit</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="p-3">
                      <button
                        onClick={() => openOrder(order._id)}
                        className="text-left text-indigo-300 hover:underline"
                      >
                        {order.id}
                      </button>
                    </td>
                    <td className="p-3">{order.user?.username || "—"}</td>
                    <td className="p-3">{order.service}</td>
                    <td className="p-3">{order.quantity}</td>
                    <td className="p-3">{formatEgp(order.totalCharge)}</td>
                    <td className="p-3">{formatEgp(order.profit ?? 0)}</td>
                    <td className="p-3">
                      {order.provider?.name || "—"}
                      {order.providerOrderId && (
                        <span className="block text-xs text-zinc-500">
                          {order.providerOrderId}
                        </span>
                      )}
                    </td>
                    <td className={`p-3 font-medium ${STATUS_COLOR[order.status] || ""}`}>
                      {order.status}
                    </td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs"
                      >
                        {FILTERS.filter((f) => f !== "All").map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
            <div className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a0f1c] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selected.id}</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <p className="mt-2 text-sm text-zinc-500">{selected.service}</p>
              <p className="text-sm text-zinc-500 break-all">{selected.link}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    await retryAdminOrder(selected._id);
                    openOrder(selected._id);
                    load();
                  }}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs"
                >
                  Retry
                </button>
                <button
                  onClick={async () => {
                    await refundAdminOrder(selected._id, "Admin refund");
                    openOrder(selected._id);
                    load();
                  }}
                  className="rounded-xl border border-purple-500/30 px-3 py-1.5 text-xs text-purple-300"
                >
                  Refund
                </button>
              </div>

              <h3 className="mt-6 text-sm font-semibold text-zinc-400">Timeline</h3>
              <ul className="mt-2 space-y-2">
                {(selected.timeline || []).map((t, i) => (
                  <li
                    key={i}
                    className="rounded-xl bg-black/20 px-3 py-2 text-sm"
                  >
                    <span className="text-emerald-300">{t.event}</span>
                    {t.message && (
                      <span className="mt-1 block text-zinc-500">{t.message}</span>
                    )}
                  </li>
                ))}
                {(selected.timeline || []).length === 0 && (
                  <li className="text-sm text-zinc-500">No timeline events yet.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
