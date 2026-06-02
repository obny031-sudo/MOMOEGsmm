import { apiFetch, getAuthToken, readStoredUser } from "@/lib/api/client";

export type ProfileData = {
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  role: string;
  verified: boolean;
  stats: {
    orders: number;
    wallet: number;
    activity: number;
    trust: number;
  };
  security: {
    password: boolean;
    twoFactor: boolean;
    deviceVerified: boolean;
  };
  joined?: string;
};

function profileFromStorage(): ProfileData | null {
  const user = readStoredUser<{
    username?: string;
    email?: string;
    role?: string;
    balance?: number;
    verified?: boolean;
  }>();
  if (!user) return null;
  return {
    name: user.username || "User",
    username: `@${user.username || "user"}`,
    email: user.email || "",
    phone: "",
    bio: "Elite platform member.",
    role: user.role || "Premium Client",
    verified: Boolean(user.verified),
    stats: {
      orders: 0,
      wallet: user.balance ?? 0,
      activity: 92,
      trust: user.verified ? 98 : 80,
    },
    security: {
      password: true,
      twoFactor: false,
      deviceVerified: true,
    },
  };
}

export async function getProfile(): Promise<ProfileData> {
  if (!getAuthToken()) {
    return (
      profileFromStorage() || {
        name: "MOMOEG User",
        username: "@momoeg",
        email: "user@momoeg.com",
        phone: "",
        bio: "Elite platform member.",
        role: "Premium Client",
        verified: false,
        stats: { orders: 0, wallet: 0, activity: 0, trust: 80 },
        security: {
          password: true,
          twoFactor: false,
          deviceVerified: false,
        },
      }
    );
  }

  try {
    const result = await apiFetch<{ profile: ProfileData }>("/api/v1/profile", {
      auth: true,
    });
    return result.profile;
  } catch {
    return (
      profileFromStorage() || {
        name: "MOMOEG User",
        username: "@momoeg",
        email: "user@momoeg.com",
        phone: "",
        bio: "Elite platform member.",
        role: "Premium Client",
        verified: false,
        stats: { orders: 0, wallet: 0, activity: 0, trust: 80 },
        security: {
          password: true,
          twoFactor: false,
          deviceVerified: false,
        },
      }
    );
  }
}
