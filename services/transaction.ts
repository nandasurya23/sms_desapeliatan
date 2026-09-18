import apiClient from "./apiClient";

export interface TransactionItem {
  id?: string | number;
  transaction_id: string;
  transaction_value: string | number;
  transaction_date?: string | null;
}

export async function createTransaction(payload: {
  transaction_id: string;
  transaction_value: string;
  transaction_date?: string;
}) {
  try {
    const response = await apiClient.post("/transaction", payload);
    return response.data;
  } catch (err: any) {
    const error = new Error(err.message || "Gagal menyimpan transaksi. Silakan coba lagi.");
    (error as Error & { status?: number }).status = err.response?.status;
    throw error;
  }
}

export async function getTransactionHistory(): Promise<TransactionItem[] | string> {
  try {
    const response = await apiClient.get("/transaction");
    const data = response.data;
    
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return items;
  } catch (err: any) {
    return err.message || "Gagal mengambil riwayat transaksi. Silakan coba lagi.";
  }
}
