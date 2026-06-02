"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";

type ProtectedShellProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

/**
 * Strict route guard — only for routes that require authentication (e.g. admin).
 * Waits for auth hydration before any redirect.
 */
export default function ProtectedShell({
  children,
  redirectTo = "/login",
}: ProtectedShellProps) {
  const auth = useRequireAuth(redirectTo);

  if (auth.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060814] text-white">
        <div className="rounded-[36px] border border-white/10 bg-white/[0.04] px-8 py-5 backdrop-blur-3xl">
          Checking authentication...
        </div>
      </main>
    );
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
