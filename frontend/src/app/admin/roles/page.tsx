"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/admin-topbar";
import { getAdminUsers, updateAdminUser } from "@/lib/api/admin";

type UserRow = {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: string;
};

const ROLES = ["user", "vip", "moderator", "staff", "reseller", "admin"];

export default function AdminRolesPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");

  const load = () => {
    getAdminUsers({ search }).then((r) => setUsers(r.users as UserRow[]));
  };

  useEffect(() => {
    load();
  }, []);

  const promote = async (id: string, role: string) => {
    await updateAdminUser(id, { role });
    load();
  };

  return (
    <div>
      <AdminTopbar title="Role Manager" />
      <div className="p-8">
        <p className="mb-4 text-zinc-400">
          Promote or revoke roles from the panel — no MongoDB required.
        </p>
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="mb-6 w-full max-w-md rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
        />
        <button
          onClick={load}
          className="mb-6 ml-3 rounded-2xl border border-white/10 px-4 py-3 text-sm"
        >
          Search
        </button>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div>
                <p className="font-semibold">{user.username}</p>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
              <select
                value={user.role}
                onChange={(e) => promote(user._id, e.target.value)}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
