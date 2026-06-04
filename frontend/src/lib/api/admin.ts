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
    failedOrders?: number;
    ordersToday?: number;
    newUsersToday?: number;
    totalRevenue: number;
    totalProfit?: number;
    revenueToday?: number;
    revenueMonth?: number;
    profitToday?: number;
    profitMonth?: number;
    providersOnline?: number;
    providersTotal?: number;
    serviceHealth?: number;
    systemHealth?: number;
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
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.role) q.set("role", params.role);
  if (params?.status) q.set("status", params.status);
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
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

export function getAdminOrders(params?: { status?: string; search?: string }) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.search) q.set("search", params.search);
  return apiFetch<{
    orders: Record<string, unknown>[];
    stats: { _id: string; count: number; revenue: number; profit: number }[];
  }>(`/api/v1/admin/orders?${q}`, { auth: true });
}

export function getAdminOrder(id: string) {
  return apiFetch<{ order: Record<string, unknown> }>(
    `/api/v1/admin/orders/${id}`,
    { auth: true }
  );
}

export function retryAdminOrder(id: string) {
  return apiFetch(`/api/v1/admin/orders/${id}/retry`, {
    method: "POST",
    auth: true,
  });
}

export function refundAdminOrder(id: string, reason?: string) {
  return apiFetch(`/api/v1/admin/orders/${id}/refund`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ reason }),
  });
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

export type ProviderRow = {
  _id: string;
  name: string;
  slug: string;
  apiUrl: string;
  active: boolean;
  balance: number;
  healthScore: number;
  onlineStatus: string;
  lastSyncAt?: string;
  servicesCount: number;
  successRate: number;
  failureCount: number;
};

export function getAdminProviders() {
  return apiFetch<{ providers: ProviderRow[] }>("/api/v1/admin/providers", {
    auth: true,
  });
}

export function getAdminProvider(id: string) {
  return apiFetch<{
    provider: ProviderRow;
    services: Record<string, unknown>[];
    logs?: Record<string, unknown>[];
  }>(`/api/v1/admin/providers/${id}`, { auth: true });
}

export function createAdminProvider(body: Record<string, unknown>) {
  return apiFetch("/api/v1/admin/providers", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function updateAdminProvider(id: string, body: Record<string, unknown>) {
  return apiFetch(`/api/v1/admin/providers/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function deleteAdminProvider(id: string) {
  return apiFetch(`/api/v1/admin/providers/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export function testAdminProvider(id: string) {
  return apiFetch(`/api/v1/admin/providers/${id}/test`, {
    method: "POST",
    auth: true,
  });
}

export function syncProviderBalance(id: string) {
  return apiFetch(`/api/v1/admin/providers/${id}/sync-balance`, {
    method: "POST",
    auth: true,
  });
}

export function syncProviderServices(id: string) {
  return apiFetch(`/api/v1/admin/providers/${id}/sync-services`, {
    method: "POST",
    auth: true,
  });
}

export function getProviderLogs(id: string) {
  return apiFetch<{ logs: Record<string, unknown>[] }>(
    `/api/v1/admin/providers/${id}/logs`,
    { auth: true }
  );
}

export function transferBalance(body: {
  fromUserId: string;
  toUserId: string;
  amount: number;
  note?: string;
}) {
  return apiFetch("/api/v1/admin/wallet/transfer", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function addAdminBalance(body: {
  userId: string;
  amount: number;
  reason?: string;
}) {
  return apiFetch("/api/v1/admin/wallet/add", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function deductAdminBalance(body: {
  userId: string;
  amount: number;
  reason?: string;
}) {
  return apiFetch("/api/v1/admin/wallet/deduct", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function getAdminTransfers() {
  return apiFetch<{ transfers: Record<string, unknown>[] }>(
    "/api/v1/admin/wallet/transfers",
    { auth: true }
  );
}

export function getAdminFinance() {
  return apiFetch<{ finance: Record<string, number> }>("/api/v1/admin/finance", {
    auth: true,
  });
}

export function getAdminCategories() {
  return apiFetch<{ categories: Record<string, unknown>[] }>(
    "/api/v1/admin/categories",
    { auth: true }
  );
}

export function createAdminCategory(body: Record<string, unknown>) {
  return apiFetch("/api/v1/admin/categories", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function bulkUpdateServices(body: {
  ids: string[];
  updates: Record<string, unknown>;
}) {
  return apiFetch("/api/v1/admin/services/bulk", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function getAdminAudit(params?: {
  action?: string;
  resource?: string;
  search?: string;
}) {
  const q = new URLSearchParams();
  if (params?.action) q.set("action", params.action);
  if (params?.resource) q.set("resource", params.resource);
  if (params?.search) q.set("search", params.search);
  return apiFetch<{ logs: Record<string, unknown>[] }>(
    `/api/v1/admin/audit?${q}`,
    { auth: true }
  );
}

export function getOwnerDashboard() {
  return apiFetch<{
    panicMode: boolean;
    admins: Record<string, unknown>[];
    recentAudit: Record<string, unknown>[];
  }>("/api/v1/owner/dashboard", { auth: true });
}

export function setPanicMode(enabled: boolean) {
  return apiFetch("/api/v1/owner/panic", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ enabled }),
  });
}

export function getAdminTransactions(params?: { type?: string; userId?: string }) {
  const q = new URLSearchParams();
  if (params?.type) q.set("type", params.type);
  if (params?.userId) q.set("userId", params.userId);
  return apiFetch<{ transactions: Record<string, unknown>[] }>(
    `/api/v1/admin/transactions?${q}`,
    { auth: true }
  );
}
