"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";

/** @deprecated Use useRequireAuth from @/hooks/use-require-auth */
export function useAuthGuard(redirectTo = "/login") {
  return useRequireAuth(redirectTo);
}
