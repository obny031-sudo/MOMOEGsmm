"use client";

import { useEffect, useState } from "react";
import {
  getAdminServices,
  updateAdminService,
  createAdminService,
} from "@/lib/api/admin";

type ServiceRow = {
  _id: string;
  serviceId: number;
  title: string;
  category: string;
  price: number;
  min: number;
  max: number;
  active: boolean;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getAdminServices()
      .then((r) => setServices(r.services as ServiceRow[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (id: string, active: boolean) => {
    await updateAdminService(id, { active: !active });
    load();
  };

  const addService = async () => {
    await createAdminService({
      title: "New Service",
      category: "General",
      price: 10,
      min: 100,
      max: 10000,
    });
    load();
  };

  if (loading) return <div className="p-8">Loading services...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Service Management</h1>
          <p className="mt-2 text-zinc-400">{services.length} services</p>
        </div>
        <button
          onClick={addService}
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-5 py-2 text-sm font-medium"
        >
          Add Service
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {services.map((service) => (
          <div
            key={service._id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-3xl"
          >
            <div>
              <p className="font-semibold">
                #{service.serviceId} · {service.title}
              </p>
              <p className="text-sm text-zinc-500">
                {service.category} · ${service.price}/1k · {service.min}-
                {service.max}
              </p>
            </div>
            <button
              onClick={() => toggleActive(service._id, service.active)}
              className={`rounded-xl px-4 py-2 text-sm ${
                service.active
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {service.active ? "Active" : "Inactive"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
