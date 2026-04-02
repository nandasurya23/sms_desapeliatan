import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/config";

export interface TransactionItem {
  id?: string | number;
  transaction_id: string;
  transaction_value: string | number;
  transaction_date?: string | null;
}

const readJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export async function createTransaction(payload: {
  transaction_id: string;
  transaction_value: string;
  transaction_date?: string;
}) {
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  const response = await fetch(`${API_URL}/transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await readJson(response);

  if (!response.ok) {
    const error = new Error(data?.error || "Gagal menyimpan transaksi");
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return data;
}

export async function getTransactionHistory(routeParam = "me"): Promise<TransactionItem[] | string> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    return "Token tidak ditemukan";
  }

  const response = await fetch(`${API_URL}/transaction/${routeParam}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJson(response);

  if (!response.ok) {
    return data?.error || "Gagal mengambil history transaksi";
  }

  const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return items;
}
