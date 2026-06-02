"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";
import { getOrders, reorder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Search,
  Activity,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  XCircle,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

const filters = [
  "All",
  "Running",
  "Completed",
  "Pending",
];

const timeline = [
  "Order Created",
  "Payment Verified",
  "Processing Started",
  "Tracking Updated",
  "Completion Phase",
];

export default function OrdersPage() {
  const auth = useAuth();
  const [orders, setOrders] =
    useState<any[]>([]);
  const [actionError, setActionError] = useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [selected, setSelected] =
    useState<any>(null);

  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
      setSelected(data.length ? data[0] : null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered =
    useMemo(() => {
      return orders.filter(
        (order) => {
          const searchMatch =
            order.service
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const filterMatch =
            filter === "All"
              ? true
              : order.status ===
                filter;

          return (
            searchMatch &&
            filterMatch
          );
        }
      );
    }, [
      orders,
      search,
      filter,
    ]);

  const running =
    orders.filter(
      (o) =>
        o.status ===
        "Running"
    ).length;

  const completed =
    orders.filter(
      (o) =>
        o.status ===
        "Completed"
    ).length;

  const pending =
    orders.filter(
      (o) =>
        o.status ===
        "Pending"
    ).length;

  const statusColor =
    (
      status: string
    ) => {
      switch (status) {
        case "Running":
          return "bg-emerald-500/10 text-emerald-300";

        case "Completed":
          return "bg-indigo-500/10 text-indigo-300";

        default:
          return "bg-orange-500/10 text-orange-300";
      }
    };

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <AmbientBackground />
      <FloatingDock />

      <section className="relative z-10 px-6 pt-36 pb-16">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-10">

            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
              ✦ Mission Control
            </span>

            <h1 className="mt-5 text-6xl font-bold">
              Orders
            </h1>

            <p className="mt-3 text-lg text-zinc-400">
              Track and manage
              operations.
            </p>

            {loading && (
              <p className="mt-4 text-zinc-500">Loading orders...</p>
            )}

            {!loading && orders.length === 0 && (
              <p className="mt-4 text-zinc-500">
                No orders yet.{" "}
                <a href="/services" className="text-emerald-300 hover:underline">
                  Place your first order
                </a>
              </p>
            )}

          </div>

          {/* Analytics */}
          <div className="mb-6 grid gap-5 md:grid-cols-3">

            {[
              {
                label: "Running",
                value: running,
                icon: Activity,
              },
              {
                label: "Completed",
                value: completed,
                icon: CheckCircle2,
              },
              {
                label: "Pending",
                value: pending,
                icon: Clock3,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18}/>
                  {item.label}
                </div>

                <h3 className="mt-4 text-4xl font-bold">
                  {item.value}
                </h3>

              </div>
            ))}

          </div>

          {/* Search */}
          <div className="mb-5 flex items-center gap-3 rounded-[30px] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-3xl">

            <Search
              size={18}
            />

            <input
              value={search}
              onChange={(e)=>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search orders..."
              className="w-full bg-transparent outline-none"
            />

          </div>

          {/* Filters */}
          <div className="mb-7 flex flex-wrap gap-3">

            {filters.map(
              (f)=>(
                <button
                  key={f}
                  onClick={()=>
                    setFilter(f)
                  }
                  className={`
                    rounded-2xl px-4 py-2 text-sm
                    ${
                      filter===f
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/[0.04]"
                    }
                  `}
                >
                  {f}
                </button>
              )
            )}

          </div>

          <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr]">

            {/* Orders List */}
            <div className="space-y-5">

              {filtered.map(
                (
                  order
                )=>(
                  <motion.div
                    key={
                      order.id
                    }
                    whileHover={{
                      y:-3
                    }}
                    onClick={()=>
                      setSelected(
                        order
                      )
                    }
                    className="cursor-pointer rounded-[36px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-xl font-semibold">
                            {
                              order.service
                            }
                          </h3>

                          <span
                            className={`rounded-xl px-3 py-1 text-xs ${statusColor(order.status)}`}
                          >
                            {
                              order.status
                            }
                          </span>

                          <span className="rounded-xl bg-orange-500/10 px-3 py-1 text-xs text-orange-200">
                            {
                              order.priority
                            }
                          </span>

                        </div>

                        <p className="mt-2 text-zinc-500">
                          Order {
                            order.id
                          }
                        </p>

                      </div>

                      <ArrowRight
                        size={18}
                      />

                    </div>

                    {/* Progress */}
                    <div className="mt-6">

                      <div className="mb-2 flex justify-between text-sm text-zinc-400">
                        <span>
                          Progress
                        </span>

                        <span>
                          {
                            order.progress
                          }%
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-white/10">

                        <motion.div
                          initial={{
                            width:0
                          }}
                          animate={{
                            width:`${order.progress}%`
                          }}
                          className="h-3 rounded-full bg-indigo-400"
                        />

                      </div>

                    </div>

                  </motion.div>
                )
              )}

            </div>

            {/* Intelligence */}
            <AnimatePresence mode="wait">

              {selected && (
                <motion.div
                  key={
                    selected.id
                  }
                  initial={{
                    opacity:0,
                    x:25,
                  }}
                  animate={{
                    opacity:1,
                    x:0,
                  }}
                  exit={{
                    opacity:0,
                    x:25,
                  }}
                  className="sticky top-28 h-fit rounded-[40px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-3xl"
                >

                  <h3 className="text-2xl font-semibold">
                    Order Intelligence
                  </h3>

                  <div className="mt-6 space-y-4">

                    <div className="rounded-3xl bg-black/20 p-4">
                      <p className="text-sm text-zinc-500">
                        Service
                      </p>

                      <h4 className="mt-1">
                        {
                          selected.service
                        }
                      </h4>
                    </div>

                    <div className="rounded-3xl bg-black/20 p-4">
                      <p className="text-sm text-zinc-500">
                        Quantity
                      </p>

                      <h4 className="mt-1">
                        {
                          selected.amount
                        }
                      </h4>
                    </div>

                    <div className="rounded-3xl bg-black/20 p-4">
                      <p className="text-sm text-zinc-500">
                        Status
                      </p>

                      <h4 className="mt-1">
                        {
                          selected.status
                        }
                      </h4>
                    </div>

                    {/* Timeline */}
                    <div className="rounded-3xl border border-indigo-500/10 bg-indigo-500/[0.04] p-5">

                      <h4 className="mb-4 font-medium">
                        Timeline
                      </h4>

                      <div className="space-y-4">

                        {timeline.map(
                          (
                            step,
                            i
                          )=>(
                            <div
                              key={i}
                              className="flex items-center gap-3"
                            >
                              <div className="h-2 w-2 rounded-full bg-indigo-400" />

                              <span className="text-sm text-zinc-300">
                                {
                                  step
                                }
                              </span>
                            </div>
                          )
                        )}

                      </div>

                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-3">

                      <button className="rounded-2xl bg-white py-3 text-black">
                        Track
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!selected?._id && !selected?.id) return;
                          try {
                            setActionError("");
                            const result = await reorder(String(selected._id));
                            auth.patchUser({ balance: result.balance });
                            await loadOrders();
                          } catch (err) {
                            setActionError(
                              err instanceof ApiError
                                ? err.message
                                : "Reorder failed"
                            );
                          }
                        }}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3"
                      >
                        <RotateCcw size={15}/>
                        Reorder
                      </button>

                      <button className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/10 bg-red-500/[0.04] py-3 text-red-300">
                        <XCircle size={15}/>
                        Cancel
                      </button>

                    </div>

                  </div>

                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>
      </section>
    </main>
  );
}