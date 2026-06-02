const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

/** Single source of truth for auth storage keys */
export const AUTH_STORAGE = {
  TOKEN: "token",
  USER: "user",
} as const;

export function getApiBaseUrl(): string {
  return API_BASE;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(AUTH_STORAGE.TOKEN) ||
    sessionStorage.getItem(AUTH_STORAGE.TOKEN) ||
    null
  );
}

export function readStoredUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE.USER);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string, remember = true): void {
  if (typeof window === "undefined") return;
  if (remember) {
    localStorage.setItem(AUTH_STORAGE.TOKEN, token);
    sessionStorage.removeItem(AUTH_STORAGE.TOKEN);
  } else {
    sessionStorage.setItem(AUTH_STORAGE.TOKEN, token);
    localStorage.removeItem(AUTH_STORAGE.TOKEN);
    localStorage.removeItem(AUTH_STORAGE.USER);
  }
}

export function setAuthUser(user: unknown, remember = true): void {
  if (typeof window === "undefined" || !remember) return;
  localStorage.setItem(AUTH_STORAGE.USER, JSON.stringify(user));
}

/** Clears tokens only — does not notify backend */
export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE.TOKEN);
  localStorage.removeItem(AUTH_STORAGE.USER);
  sessionStorage.removeItem(AUTH_STORAGE.TOKEN);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  const token = getAuthToken();
  if (token) {
    void fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }
  clearAuthStorage();
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { auth = false, headers, ...rest } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type") && rest.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

  let data: unknown = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}
