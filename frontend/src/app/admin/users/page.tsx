"use client";

import { useEffect, useState } from "react";
import { getAdminUsers, updateAdminUser } from "@/lib/api/admin";

type UserRow = {
  _id: string;
  username: string;
  email: string;
  role: string;
  balance: number;
  status: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    getAdminUsers({ search })
      .then((r) => setUsers(r.users as UserRow[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRole = async (id: string, role: string) => {
    await updateAdminUser(id, { role });
    load();
  };

  const handleStatus = async (id: string, status: string) => {
    await updateAdminUser(id, { status });
    load();
  };

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div>
      <div className="border-b border-white/10 px-8 py-6">
        <h1 className="text-3xl font-black">User Management</h1>
        <div className="mt-4 flex gap-2">
          <input
            placeholder="Search username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="flex-1 max-w-md rounded-xl border border-white/10 bg-black/30 px-4 py-2"
          />
          <button onClick={load} className="rounded-xl border border-white/10 px-4 py-2 text-sm">
            Search
          </button>
        </div>
      </div>
      <div className="p-8">
      <p className="mb-4 text-zinc-400">{users.length} users</p>

      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-3xl"
          >
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-zinc-500">{user.email}</p>
              <p className="text-sm text-emerald-300">${user.balance}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={user.role}
                onChange={(e) => handleRole(user._id, e.target.value)}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              >
                <option value="user">user</option>
                <option value="vip">vip</option>
                <option value="moderator">moderator</option>
                <option value="staff">staff</option>
                <option value="reseller">reseller</option>
                <option value="admin">admin</option>
              </select>
              <select
                value={user.status}
                onChange={(e) => handleStatus(user._id, e.target.value)}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              >
                <option value="active">active</option>
                <option value="suspended">suspended</option>
                <option value="banned">banned</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
