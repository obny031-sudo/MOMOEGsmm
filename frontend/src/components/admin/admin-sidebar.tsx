"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Layers,
  Bell,
  Wallet,
  ArrowLeft,
  Crown,
  Shield,
  Settings,
  ScrollText,
  Activity,
  Ticket,
  Megaphone,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: Shield, adminOnly: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/wallet", label: "Wallet", icon: Wallet },
  { href: "/admin/health", label: "System Health", icon: Activity },
  { href: "/admin/audit", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const isAdmin = auth.user?.role === "admin";

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-white/[0.03] p-5 backdrop-blur-3xl">
      <div className="mb-8 flex items-center gap-2 text-indigo-300">
        <Crown size={18} />
        <span className="font-semibold tracking-wide">MOMOEG Admin</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-indigo-500/20 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-400 transition hover:border-emerald-500/20 hover:text-emerald-300"
      >
        <ArrowLeft size={16} />
        Back to site
      </Link>
    </aside>
  );
}
