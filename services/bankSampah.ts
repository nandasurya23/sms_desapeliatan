import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import apiClient from "./apiClient";

type BankSampahItem = {
  weight?: string | number;
};

type JwtPayload = {
  id?: string | number;
  userId?: string | number;
  sub?: string | number;
  username?: string;
  email?: string;
};

const TOTAL_WEIGHT_KEY_PREFIX = "bank_sampah_total_weight";

const normalizeWeight = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(num) ? num : 0;
};

const extractItems = (data: any): BankSampahItem[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const getBankSampahAccountKey = async () => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) return "default";

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const identifier =
      decoded.id ??
      decoded.userId ??
      decoded.sub ??
      decoded.username ??
      decoded.email ??
      "default";

    const safeKey = String(identifier)
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    return safeKey || "default";
  } catch (error: unknown) {
    console.warn("Failed to decode token for Bank Sampah key:", error instanceof Error ? error.message : String(error));
    return "default";
  }
};

const getTotalKey = async () => `${TOTAL_WEIGHT_KEY_PREFIX}_${await getBankSampahAccountKey()}`;

export async function getStoredBankSampahTotalWeight(): Promise<number> {
  const key = await getTotalKey();
  const stored = await AsyncStorage.getItem(key);
  const parsed = stored ? Number(stored) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function setStoredBankSampahTotalWeight(weight: number): Promise<void> {
  const key = await getTotalKey();
  await AsyncStorage.setItem(key, String(weight));
}

export async function addStoredBankSampahTotalWeight(weight: number): Promise<number> {
  const current = await getStoredBankSampahTotalWeight();
  const next = current + weight;
  await setStoredBankSampahTotalWeight(next);
  return next;
}

export async function getBankSampahTotalWeight(): Promise<number> {
  try {
    const response = await apiClient.get("/bank-sampah");
    const data = response.data;
    const items = extractItems(data);

    if (items.length > 0) {
      const total = items.reduce((sum, item) => sum + normalizeWeight(item.weight), 0);
      await setStoredBankSampahTotalWeight(total);
      return total;
    }
  } catch (error: unknown) {
    console.warn("Failed to fetch Bank Sampah from API, using fallback:", error instanceof Error ? error.message : String(error));
    // Fallback to stored value on error
  }

  return await getStoredBankSampahTotalWeight();
}
