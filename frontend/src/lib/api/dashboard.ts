import { ApiError, apiFetch, readStoredUser } from "@/lib/api/client";

export type DashboardData = {
  username: string;
  email: string;
  avatar: string | null;
  balance: number;
  spent: number;
  pending: number;
  bonus: number;
  health: number;
  notifications: number;
  verified: boolean;
  stats: {
    orders: number;
    growth: number;
    completed: number;
    active: number;
  };
  ticker: string[];
  platforms: string[];
  orderFeed: string[];
  depositFeed: string[];
  processingFeed: string[];
  alerts: { title: string; type: string }[];
  profile: { rank: string; joined: string; status: string };
};

type DashboardApiResponse = {
  success: boolean;
  dashboard: Partial<DashboardData>;
};

const DEFAULT_PLATFORMS = [
  "Telegram",
  "TikTok",
  "Instagram",
  "YouTube",
  "Facebook",
  "WhatsApp",
];

function emptyDashboard(): DashboardData {
  return {
    username: "User",
    email: "",
    avatar: null,
    balance: 0,
    spent: 0,
    pending: 0,
    bonus: 0,
    health: 99,
    notifications: 0,
    verified: false,
    stats: { orders: 0, growth: 0, completed: 0, active: 0 },
    ticker: ["System Stable", "API Healthy"],
    platforms: DEFAULT_PLATFORMS,
    orderFeed: [],
    depositFeed: [],
    processingFeed: ["Queued", "Running"],
    alerts: [],
    profile: { rank: "Standard", joined: "2025", status: "Active" },
  };
}

function mergeDashboard(partial: Partial<DashboardData>): DashboardData {
  const base = emptyDashboard();
  return {
    ...base,
    ...partial,
    stats: { ...base.stats, ...partial.stats },
    profile: { ...base.profile, ...partial.profile },
    orderFeed: partial.orderFeed ?? base.orderFeed,
    depositFeed: partial.depositFeed ?? base.depositFeed,
    processingFeed: partial.processingFeed ?? base.processingFeed,
    alerts: partial.alerts ?? base.alerts,
    ticker: partial.ticker ?? base.ticker,
    platforms: partial.platforms ?? base.platforms,
  };
}

function applyStoredUser(data: DashboardData): DashboardData {
  const user = readStoredUser<{
    username?: string;
    email?: string;
    balance?: number;
    verified?: boolean;
  }>();
  if (!user) return data;
  return {
    ...data,
    username: user.username || data.username,
    email: user.email || data.email,
    balance: user.balance ?? data.balance,
    verified: user.verified ?? data.verified,
  };
}

function isNetworkOrServerError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  return error.status >= 500 || error.status === 0;
}

/** Fetches live dashboard from backend; mock fallback only when server unreachable */
export async function getDashboard(): Promise<DashboardData> {
  const result = await apiFetch<DashboardApiResponse>("/api/v1/dashboard", {
    method: "GET",
    auth: true,
  });

  if (!result?.dashboard) {
    throw new Error("Invalid dashboard response");
  }

  return applyStoredUser(mergeDashboard(result.dashboard));
}

export async function getDashboardSafe(): Promise<{
  data: DashboardData;
  fromFallback: boolean;
}> {
  try {
    const data = await getDashboard();
    return { data, fromFallback: false };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      throw error;
    }
    if (!isNetworkOrServerError(error)) {
      throw error;
    }
    console.warn("Dashboard using offline fallback");
    return {
      data: applyStoredUser(mergeDashboard({})),
      fromFallback: true,
    };
  }
}
