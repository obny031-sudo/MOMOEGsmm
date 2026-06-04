"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { formatEgp } from "@/lib/format-money";
import {
  createAdminProvider,
  deleteAdminProvider,
  getAdminProviders,
  ProviderRow,
  syncProviderBalance,
  syncProviderServices,
  testAdminProvider,
  updateAdminProvider,
} from "@/lib/api/admin";

const emptyForm = {
  name: "",
  apiUrl: "",
  apiKey: "",
  active: true,
  priority: 1,
};

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  const load = () => {
    getAdminProviders()
      .then((r) => setProviders(r.providers))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const notify = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const save = async () => {
    if (!form.name || !form.apiUrl) {
      notify("Name and API URL are required");
      return;
    }
    setBusy("save");
    try {
      if (editingId) {
        await updateAdminProvider(editingId, form);
        notify("Provider updated");
      } else {
        await createAdminProvider(form);
        notify("Provider created");
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy("");
    }
  };

  const runAction = async (id: string, action: "test" | "balance" | "sync") => {
    setBusy(`${action}-${id}`);
    try {
      if (action === "test") await testAdminProvider(id);
      if (action === "balance") await syncProviderBalance(id);
      if (action === "sync") await syncProviderServices(id);
      notify(`${action} completed`);
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy("");
    }
  };

  if (loading) {
    return <div className="p-8">Loading providers...</div>;
  }

  return (
    <div>
      <AdminTopbar title="Provider Management" />
      <div className="p-8">
        {msg && <p className="mb-4 text-sm text-emerald-300">{msg}</p>}

        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit Provider" : "Add Provider"}
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(["name", "apiUrl", "apiKey"] as const).map((key) => (
              <input
                key={key}
                placeholder={key === "apiKey" ? "API Key" : key === "apiUrl" ? "API URL" : "Name"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
              />
            ))}
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={save}
              disabled={busy === "save"}
              className="rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-5 py-2 text-sm font-medium"
            >
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-2xl border border-white/10 px-5 py-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {providers.map((p) => (
            <div
              key={p._id}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-3xl"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{p.name}</p>
                  <p className="text-sm text-zinc-500">{p.apiUrl || "No API URL"}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <span
                      className={
                        p.onlineStatus === "online"
                          ? "text-emerald-300"
                          : "text-amber-300"
                      }
                    >
                      {p.onlineStatus}
                    </span>
                    <span className="text-zinc-400">
                      Health {p.healthScore}/100
                    </span>
                    <span className="text-zinc-400">
                      {p.servicesCount} services
                    </span>
                    <span className="text-zinc-400">
                      Balance {formatEgp(p.balance ?? 0)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runAction(p._id, "test")}
                    className="rounded-xl border border-white/10 px-3 py-1.5 text-xs"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => runAction(p._id, "balance")}
                    className="rounded-xl border border-white/10 px-3 py-1.5 text-xs"
                  >
                    Sync Balance
                  </button>
                  <button
                    onClick={() => runAction(p._id, "sync")}
                    className="rounded-xl border border-white/10 px-3 py-1.5 text-xs"
                  >
                    Sync Services
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(p._id);
                      setForm({
                        name: p.name,
                        apiUrl: p.apiUrl,
                        apiKey: "",
                        active: p.active,
                        priority: 1,
                      });
                    }}
                    className="rounded-xl border border-indigo-500/30 px-3 py-1.5 text-xs text-indigo-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Disable this provider?")) return;
                      await deleteAdminProvider(p._id);
                      load();
                    }}
                    className="rounded-xl border border-red-500/30 px-3 py-1.5 text-xs text-red-300"
                  >
                    Disable
                  </button>
                </div>
              </div>
            </div>
          ))}
          {providers.length === 0 && (
            <p className="text-zinc-500">No providers configured yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
