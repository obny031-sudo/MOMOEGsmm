"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

/**
 * Redirects to login only after auth hydration completes and session is invalid.
 * Never redirects while status is "loading".
 */
export function useRequireAuth(redirectTo = "/login") {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.replace(redirectTo);
    }
  }, [auth.status, router, redirectTo]);

  return auth;
}
