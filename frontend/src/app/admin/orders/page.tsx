"use client";

import { useEffect, useState } from "react";
import { getAdminOrders, updateAdminOrder } from "@/lib/api/admin";

type OrderRow = {
  _id: string;
  id: string;
  service: string;
  status: string;
  totalCharge: number;
  quantity: number;
  progress: number;
  user: { username: string } | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getAdminOrders()
      .then((r) => setOrders(r.orders as OrderRow[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateAdminOrder(id, { status });
    load();
  };

  if (loading) return <div className="p-8">Loading orders...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black">Order Management</h1>
      <p className="mt-2 text-zinc-400">{orders.length} orders</p>

      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <div
            key={order._id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-3xl"
          >
            <div>
              <p className="font-semibold">
                {order.id} · {order.service}
              </p>
              <p className="text-sm text-zinc-500">
                {order.user?.username || "—"} · qty {order.quantity} · $
                {order.totalCharge}
              </p>
            </div>
            <select
              value={order.status}
              onChange={(e) => updateStatus(order._id, e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="Pending">Pending</option>
              <option value="Running">Running</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
