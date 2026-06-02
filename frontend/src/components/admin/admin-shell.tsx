"use client";

import AdminSidebar from "@/components/admin/admin-sidebar";
import { useAdminGuard } from "@/hooks/use-admin-guard";
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = useAdminGuard();

  if (!admin.ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060814] text-white">
        <div className="rounded-[36px] border border-white/10 bg-white/[0.04] px-8 py-5 backdrop-blur-3xl">
          Verifying admin access...
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#060814] text-white">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}