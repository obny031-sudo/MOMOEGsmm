import { apiFetch, getAuthToken } from "@/lib/api/client";

export type WalletData = {
  balance: number;
  bonus: number;
  spent: number;
  coupons: number;
  transactions: { id: number; type: string; amount: string }[];
};

const MOCK_WALLET: WalletData = {
  balance: 0,
  bonus: 0,
  spent: 0,
  coupons: 0,
  transactions: [],
};

export async function getWallet(): Promise<WalletData> {
  if (!getAuthToken()) return MOCK_WALLET;

  try {
    const result = await apiFetch<{ wallet: WalletData }>("/api/v1/wallet", {
      auth: true,
    });
    return result.wallet;
  } catch {
    return MOCK_WALLET;
  }
}
