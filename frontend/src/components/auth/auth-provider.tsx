"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ApiError,
  apiFetch,
  clearAuth,
  clearAuthStorage,
  getAuthToken,
  readStoredUser,
  setAuthToken,
  setAuthUser,
} from "@/lib/api/client";

export type AuthUser = {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
  balance?: number;
  verified?: boolean;
  preferences?: { language?: string; theme?: string };
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user?: AuthUser, remember?: boolean) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
  patchUser: (partial: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(raw: AuthUser | null): AuthUser | null {
  if (!raw) return null;
  return {
    ...raw,
    id: raw.id || raw._id,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const applyAuthenticated = useCallback(
    (nextToken: string, nextUser?: AuthUser | null) => {
      setToken(nextToken);
      setUser(normalizeUser(nextUser ?? readStoredUser<AuthUser>()));
      setStatus("authenticated");
    },
    []
  );

  const applyUnauthenticated = useCallback(() => {
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshSession = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      applyUnauthenticated();
      return;
    }

    try {
      const result = await apiFetch<{ success: boolean; user: AuthUser }>(
        "/api/v1/auth/me",
        { auth: true }
      );
      const nextUser = normalizeUser(result.user ?? null);
      if (nextUser) {
        setAuthUser(nextUser, true);
      }
      applyAuthenticated(storedToken, nextUser);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        clearAuthStorage();
        applyUnauthenticated();
        return;
      }
      // Backend unreachable — keep session from storage (no false logout)
      applyAuthenticated(storedToken, readStoredUser<AuthUser>());
    }
  }, [applyAuthenticated, applyUnauthenticated]);

  useEffect(() => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      applyUnauthenticated();
      return;
    }
    applyAuthenticated(storedToken, readStoredUser<AuthUser>());
    void refreshSession();
  }, [applyAuthenticated, applyUnauthenticated, refreshSession]);

  const login = useCallback(
    (nextToken: string, nextUser?: AuthUser, remember = true) => {
      setAuthToken(nextToken, remember);
      if (nextUser) {
        setAuthUser(nextUser, remember);
      }
      applyAuthenticated(nextToken, nextUser ?? null);
    },
    [applyAuthenticated]
  );

  const logout = useCallback(() => {
    clearAuth();
    applyUnauthenticated();
  }, [applyUnauthenticated]);

  const patchUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partial };
      setAuthUser(next, true);
      return normalizeUser(next);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      token,
      user,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      login,
      logout,
      refreshSession,
      patchUser,
    }),
    [status, token, user, login, logout, refreshSession, patchUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
