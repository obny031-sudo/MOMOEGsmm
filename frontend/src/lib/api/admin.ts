import { apiFetch } from "@/lib/api/client";

export type AdminOverview = {
  overview: {
    totalUsers: number;
    activeUsers: number;
    admins: number;
    vipUsers: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    activeServices: number;
    totalWalletBalance: number;
    systemStatus: string;
  };
  recentUsers: Record<string, unknown>[];
  recentOrders: Record<string, unknown>[];
};

export function getAdminOverview() {
  return apiFetch<AdminOverview>("/api/v1/admin/overview", { auth: true });
}

export function getAdminUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.role) q.set("role", params.role);
  if (params?.status) q.set("status", params.status);
  if (params?.page) q.set("page", String(params.page));
  return apiFetch<{ users: Record<string, unknown>[]; total: number }>(
    `/api/v1/admin/users?${q}`,
    { auth: true }
  );
}

export function updateAdminUser(
  id: string,
  body: { role?: string; status?: string; balance?: number }
) {
  return apiFetch(`/api/v1/admin/users/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function getAdminOrders() {
  return apiFetch<{ orders: Record<string, unknown>[] }>(
    "/api/v1/admin/orders",
    { auth: true }
  );
}

export function updateAdminOrder(
  id: string,
  body: { status?: string; progress?: number }
) {
  return apiFetch(`/api/v1/admin/orders/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function getAdminServices() {
  return apiFetch<{ services: Record<string, unknown>[] }>(
    "/api/v1/admin/services",
    { auth: true }
  );
}

export function createAdminService(body: Record<string, unknown>) {
  return apiFetch("/api/v1/admin/services", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function updateAdminService(id: string, body: Record<string, unknown>) {
  return apiFetch(`/api/v1/admin/services/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function getAdminSettings() {
  return apiFetch<{ settings: Record<string, unknown> }>(
    "/api/v1/admin/settings",
    { auth: true }
  );
}

export function updateAdminSettings(body: Record<string, unknown>) {
  return apiFetch("/api/v1/admin/settings", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function getAdminAuditLogs() {
  return apiFetch<{ logs: Record<string, unknown>[] }>("/api/v1/admin/audit", {
    auth: true,
  });
}

export function getAdminHealth() {
  return apiFetch<{ health: Record<string, unknown> }>("/api/v1/admin/health", {
    auth: true,
  });
}

export function getAdminWallet() {
  return apiFetch<{
    totals: { totalBalance: number; totalSpent: number };
    users: Record<string, unknown>[];
  }>("/api/v1/admin/wallet", { auth: true });
}

export function getAdminNotifications() {
  return apiFetch<{ notifications: Record<string, unknown>[] }>(
    "/api/v1/admin/notifications",
    { auth: true }
  );
}

export function broadcastNotification(body: {
  title: string;
  text: string;
  type?: string;
}) {
  return apiFetch("/api/v1/admin/notifications/broadcast", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function getAdminTickets() {
  return apiFetch<{ tickets: Record<string, unknown>[] }>(
    "/api/v1/admin/tickets",
    { auth: true }
  );
}

export function replyAdminTicket(
  id: string,
  body: { message: string; status?: string }
) {
  return apiFetch(`/api/v1/admin/tickets/${id}/reply`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function getAdminAnnouncements() {
  return apiFetch<{ announcements: Record<string, unknown>[] }>(
    "/api/v1/admin/announcements",
    { auth: true }
  );
}

export function createAnnouncement(body: Record<string, unknown>) {
  return apiFetch("/api/v1/admin/announcements", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function exportAdminUsers() {
  return apiFetch<{ export: unknown[] }>("/api/v1/admin/export/users", {
    auth: true,
  });
}

export function exportAdminOrders() {
  return apiFetch<{ export: unknown[] }>("/api/v1/admin/export/orders", {
    auth: true,
  });
}
