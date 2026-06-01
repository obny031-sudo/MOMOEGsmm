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

  alerts: {
    title: string;
    type: string;
  }[];

  profile: {
    rank: string;
    joined: string;
    status: string;
  };
};

export function getMockDashboard(): DashboardData {
  return {
    username: "Elite User",
    email: "elite@momoeg.com",
    avatar: null,

    balance: 4320,
    spent: 1772,
    pending: 230,
    bonus: 80,
    health: 99,
    notifications: 3,
    verified: true,

    stats: {
      orders: 4992724,
      growth: 12,
      completed: 95,
      active: 18,
    },

    ticker: [
      "System Stable",
      "API Healthy",
      "Payments Running",
      "Platform Online",
      "Security Verified",
      "New Services Added",
    ],

    platforms: [
      "Telegram",
      "TikTok",
      "Instagram",
      "YouTube",
      "Facebook",
      "WhatsApp",
    ],

    orderFeed: [
      "Instagram Followers • Completed",
      "TikTok Likes • Running",
      "Telegram Members • Delivered",
      "YouTube Views • Processing",
      "Facebook Followers • Completed",
      "Instagram Likes • Running",
      "TikTok Views • Queued",
      "Telegram Votes • Delivered",
    ],

    depositFeed: [
      "+$50 Deposit",
      "+$120 Added",
      "+$30 Wallet Topup",
      "+$75 Deposit",
      "+$200 Added",
    ],

    processingFeed: [
      "Queued",
      "Running",
      "Delivered",
      "Validating",
      "Processing",
      "Syncing",
      "Protected",
      "Verified",
    ],

    alerts: [
      {
        title: "Security Verified",
        type: "success",
      },
      {
        title: "New Services Added",
        type: "info",
      },
      {
        title: "Wallet Bonus Added",
        type: "reward",
      },
    ],

    profile: {
      rank: "Elite",
      joined: "2025",
      status: "Premium",
    },
  };
}

export async function getDashboard(): Promise<DashboardData> {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const mockData = getMockDashboard();

    if (!mockData) {
      throw new Error("Failed to load mock data");
    }

    return mockData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch dashboard";

    console.error("Dashboard API Error:", errorMessage);
    throw new Error(errorMessage);
  }
}