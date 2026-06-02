"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export function useAdminGuard() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      router.replace("/login");
      return;
    }
    const staffRoles = ["admin", "moderator", "staff"];
    if (!staffRoles.includes(auth.user?.role || "")) {
      router.replace("/dashboard");
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user?.role, router]);

  const staffRoles = ["admin", "moderator", "staff"];
  const isStaff = staffRoles.includes(auth.user?.role || "");

  return {
    ...auth,
    isAdmin: auth.user?.role === "admin",
    isStaff,
    ready: !auth.isLoading && auth.isAuthenticated && isStaff,
  };
}
