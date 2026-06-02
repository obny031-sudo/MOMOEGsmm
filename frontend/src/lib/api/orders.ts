import { apiFetch, getAuthToken } from "@/lib/api/client";

export type OrderItem = {
  id: string;
  service: string;
  status: string;
  amount: string;
  progress: number;
  priority: string;
  totalCharge?: number;
  quantity?: number;
  link?: string;
};

export type CreateOrderPayload = {
  serviceId: number;
  link: string;
  quantity: number;
};

export type CreateOrderResponse = {
  success: boolean;
  message: string;
  order: OrderItem;
  balance: number;
};

export async function getOrders(): Promise<OrderItem[]> {
  if (!getAuthToken()) return [];

  const result = await apiFetch<{ orders: OrderItem[] }>("/api/v1/orders", {
    auth: true,
  });
  return result.orders ?? [];
}

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>("/api/v1/orders", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function reorder(orderId: string): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>(
    `/api/v1/orders/${orderId}/reorder`,
    {
      method: "POST",
      auth: true,
    }
  );
}
