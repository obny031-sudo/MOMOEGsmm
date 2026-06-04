"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import {
  bulkUpdateServices,
  createAdminService,
  createAdminCategory,
  getAdminCategories,
  getAdminProviders,
  getAdminServices,
  updateAdminService,
} from "@/lib/api/admin";
import { formatEgp } from "@/lib/format-money";
import { useLanguage } from "@/lib/i18n/language-context";

type ServiceRow = {
  _id: string;
  serviceId: number;
  title: string;
  category: string;
  subcategory?: string;
  price: number;
  costPrice?: number;
  sellingPrice?: number;
  profitMargin?: number;
  min: number;
  max: number;
  active: boolean;
  provider?: { _id: string; name: string } | string;
  providerServiceId?: string;
};

export default function AdminServicesPage() {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [providers, setProviders] = useState<{ _id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkPercent, setBulkPercent] = useState("10");
  const [newCat, setNewCat] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      getAdminServices(),
      getAdminProviders().catch(() => ({ providers: [] })),
      getAdminCategories().catch(() => ({ categories: [] })),
    ])
      .then(([s, p, c]) => {
        setServices(s.services as ServiceRow[]);
        setProviders(p.providers as { _id: string; name: string }[]);
        setCategories(c.categories as { _id: string; name: string }[]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="p-8">{t("common.loading")}</div>;

  return (
    <div>
      <AdminTopbar title={t("admin.services")} />
      <div className="p-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              createAdminService({
                title: "New Service",
                category: categories[0]?.name || "General",
                price: 10,
                min: 100,
                max: 10000,
              }).then(load)
            }
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-5 py-2 text-sm"
          >
            Add Service
          </button>
          <button
            onClick={() =>
              bulkUpdateServices({ ids: selected, updates: { active: true } }).then(
                load
              )
            }
            disabled={!selected.length}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm"
          >
            {t("admin.enable")} ({selected.length})
          </button>
          <button
            onClick={() =>
              bulkUpdateServices({ ids: selected, updates: { active: false } }).then(
                load
              )
            }
            disabled={!selected.length}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm"
          >
            {t("admin.disable")}
          </button>
          <input
            value={bulkPercent}
            onChange={(e) => setBulkPercent(e.target.value)}
            className="w-20 rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-sm"
          />
          <button
            onClick={() =>
              bulkUpdateServices({
                ids: selected,
                updates: { pricePercent: Number(bulkPercent) },
              }).then(load)
            }
            disabled={!selected.length}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm"
          >
            Bulk price +%
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="New category name"
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
          <button
            onClick={() =>
              newCat &&
              createAdminCategory({ name: newCat }).then(() => {
                setNewCat("");
                load();
              })
            }
            className="rounded-xl border border-white/10 px-4 py-2 text-sm"
          >
            Add category
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-3xl"
            >
              <div className="flex flex-wrap items-start gap-4">
                <input
                  type="checkbox"
                  checked={selected.includes(service._id)}
                  onChange={() => toggleSelect(service._id)}
                />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold">
                    #{service.serviceId} · {service.title}
                  </p>
                  <p className="text-sm text-zinc-500">{service.category}</p>
                </div>
                <div className="grid gap-2 md:grid-cols-4 text-sm">
                  <label>
                    <span className="text-zinc-500">{t("admin.costPrice")}</span>
                    <input
                      type="number"
                      defaultValue={service.costPrice ?? 0}
                      onBlur={(e) =>
                        updateAdminService(service._id, {
                          costPrice: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                    />
                  </label>
                  <label>
                    <span className="text-zinc-500">{t("admin.sellingPrice")}</span>
                    <input
                      type="number"
                      defaultValue={service.sellingPrice ?? service.price}
                      onBlur={(e) =>
                        updateAdminService(service._id, {
                          sellingPrice: Number(e.target.value),
                          price: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                    />
                  </label>
                  <label>
                    <span className="text-zinc-500">Provider ID</span>
                    <input
                      defaultValue={service.providerServiceId || ""}
                      onBlur={(e) =>
                        updateAdminService(service._id, {
                          providerServiceId: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                    />
                  </label>
                  <label>
                    <span className="text-zinc-500">{t("admin.providerMapping")}</span>
                    <select
                      defaultValue={
                        typeof service.provider === "object"
                          ? service.provider?._id
                          : (service.provider as string) || ""
                      }
                      onChange={(e) =>
                        updateAdminService(service._id, {
                          provider: e.target.value || null,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                    >
                      <option value="">None</option>
                      {providers.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="text-right text-sm">
                  <p className="text-emerald-300">{formatEgp(service.price)}/1k</p>
                  <p className="text-zinc-500">
                    margin {formatEgp(service.profitMargin ?? 0)}
                  </p>
                  <button
                    onClick={() =>
                      updateAdminService(service._id, {
                        active: !service.active,
                      }).then(load)
                    }
                    className={`mt-2 rounded-xl px-3 py-1 ${
                      service.active
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {service.active ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
