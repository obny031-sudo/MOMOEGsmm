import {
  LayoutDashboard,
  ShoppingCart,
  Heart,
  Bell,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-72 p-4">
      <div className="glass glow rounded-3xl h-full p-5 text-white">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-wide">
            MOMOEG
          </h2>

          <p className="text-zinc-400 text-sm">
            Cyber Luxury Panel
          </p>
        </div>

        <nav className="space-y-2">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            title="Dashboard"
            active
          />
          <SidebarItem
            icon={<ShoppingCart size={18} />}
            title="Orders"
          />
          <SidebarItem
            icon={<Heart size={18} />}
            title="Favorites"
          />
          <SidebarItem
            icon={<Bell size={18} />}
            title="Notifications"
          />
          <SidebarItem
            icon={<Settings size={18} />}
            title="Settings"
          />
        </nav>
      </div>
    </aside>
  );
}

function SidebarItem({
  icon,
  title,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      className={`
        flex items-center gap-3 w-full rounded-2xl px-4 py-3 transition-all
        ${
          active
            ? "bg-indigo-500/20 text-white glow"
            : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      {icon}
      <span>{title}</span>
    </button>
  );
}