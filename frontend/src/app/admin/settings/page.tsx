"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { getAdminSettings, updateAdminSettings } from "@/lib/api/admin";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getAdminSettings().then((r) => setSettings(r.settings));
  }, []);

  const save = async () => {
    await updateAdminSettings(settings);
    setMsg("Settings saved");
    setTimeout(() => setMsg(""), 2000);
  };

  const fields = [
    { key: "defaultNewUserBalance", label: "Default new user balance ($)" },
    { key: "dailyLoginReward", label: "Daily check-in reward ($)" },
    { key: "dailyLoginEnabled", label: "Daily check-in enabled", type: "checkbox" },
    { key: "maintenanceMode", label: "Maintenance mode", type: "checkbox" },
    { key: "featureCoupons", label: "Coupons enabled", type: "checkbox" },
    { key: "featureReferrals", label: "Referrals enabled", type: "checkbox" },
    { key: "featureDailyReward", label: "Daily reward feature", type: "checkbox" },
  ];

  return (
    <div>
      <AdminTopbar title="Platform Settings" />
      <div className="space-y-6 p-8">
        {msg && <p className="text-emerald-300">{msg}</p>}
        {fields.map((f) => (
          <label
            key={f.key}
            className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <span className="text-sm text-zinc-400">{f.label}</span>
            {f.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={Boolean(settings[f.key])}
                onChange={(e) =>
                  setSettings({ ...settings, [f.key]: e.target.checked })
                }
              />
            ) : (
              <input
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-2"
                value={String(settings[f.key] ?? "")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    [f.key]:
                      f.key.includes("Enabled") || f.key.includes("Mode")
                        ? e.target.value === "true"
                        : Number(e.target.value),
                  })
                }
              />
            )}
          </label>
        ))}
        <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <span className="text-sm text-zinc-400">Maintenance message</span>
          <textarea
            className="min-h-[80px] rounded-xl border border-white/10 bg-black/30 px-4 py-2"
            value={String(settings.maintenanceMessage ?? "")}
            onChange={(e) =>
              setSettings({ ...settings, maintenanceMessage: e.target.value })
            }
          />
        </label>
        <button
          onClick={save}
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-6 py-3 font-medium"
        >
          Save settings
        </button>
      </div>
    </div>
  );
}
