import { apiFetch, getAuthToken } from "@/lib/api/client";

export type ProfileData = {
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  verified: boolean;
  walletFrozen?: boolean;
  stats: {
    orders: number;
    completed: number;
    pending: number;
    wallet: number;
    spent: number;
    bonus: number;
    coupons: number;
  };
  referral: { code: string; earnings: number };
  preferences: { language: string; theme: string };
  security: { password: boolean; twoFactor: boolean };
  joined?: string;
  recentOrders?: {
    serviceName: string;
    status: string;
    totalCharge: number;
    createdAt: string;
  }[];
};

export async function getProfile(): Promise<ProfileData> {
  if (!getAuthToken()) throw new Error("Not authenticated");
  const result = await apiFetch<{ profile: ProfileData }>("/api/v1/profile", {
    auth: true,
  });
  return result.profile;
}

export async function getProfileActivity() {
  return apiFetch<{
    timeline: { type: string; title: string; detail: string; at: string }[];
  }>("/api/v1/profile/activity", { auth: true });
}

export async function getSessions() {
  return apiFetch<{
    sessions: {
      _id: string;
      device: string;
      browser: string;
      ip: string;
      lastActivity: string;
      current: boolean;
    }[];
  }>("/api/v1/profile/security/sessions", { auth: true });
}

export async function getLoginHistory() {
  return apiFetch<{
    loginHistory: { ip: string; device: string; date: string }[];
  }>("/api/v1/profile/security/login-history", { auth: true });
}

export async function requestPasswordOtp(currentPassword: string) {
  return apiFetch("/api/v1/profile/security/password/request-otp", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ currentPassword }),
  });
}

export async function confirmPasswordChange(code: string, newPassword: string) {
  return apiFetch("/api/v1/profile/security/password/confirm", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ code, newPassword }),
  });
}

export async function requestEmailOtp(newEmail: string, currentPassword: string) {
  return apiFetch("/api/v1/profile/security/email/request-otp", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ newEmail, currentPassword }),
  });
}

export async function confirmEmailChange(code: string, newEmail: string) {
  return apiFetch("/api/v1/profile/security/email/confirm", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ code, newEmail }),
  });
}

export async function revokeOtherSessions() {
  return apiFetch("/api/v1/profile/security/sessions/others", {
    method: "DELETE",
    auth: true,
  });
}
