import { apiFetch, getAuthToken } from "@/lib/api/client";

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  text: string;
  time: string;
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: "wallet",
    title: "Deposit Approved",
    text: "$25 added",
    time: "2m",
  },
  {
    id: 2,
    type: "order",
    title: "Order Started",
    text: "Instagram followers",
    time: "8m",
  },
];

export async function getNotifications(): Promise<NotificationItem[]> {
  if (!getAuthToken()) return MOCK_NOTIFICATIONS;

  try {
    const result = await apiFetch<{ notifications: NotificationItem[] }>(
      "/api/v1/notifications",
      { auth: true }
    );
    return result.notifications?.length
      ? result.notifications
      : MOCK_NOTIFICATIONS;
  } catch {
    return MOCK_NOTIFICATIONS;
  }
}
