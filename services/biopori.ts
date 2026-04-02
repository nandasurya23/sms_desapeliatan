import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/config";

export interface Biopori {
  id: string;
  name: string;
  date: string;
  time: string;
  end_date?: string;
  end_time?: string;
  image_url?: string;
  isfull: boolean;
  ispanen: boolean;
  isFull: boolean;
  isHarvested: boolean;
}

const mapBioporiItem = (item: any): Biopori => ({
  id: String(item.id),
  name: item.name || "",
  date: item.date || "",
  time: item.time || "",
  end_date: item.end_date || item.endDate || "",
  end_time: item.end_time || item.endTime || "",
  image_url: item.image_url || "",
  isfull: Boolean(item.isfull),
  ispanen: Boolean(item.ispanen),
  isFull: Boolean(item.isfull),
  isHarvested: Boolean(item.ispanen),
});

export async function getBiopori(): Promise<Biopori[] | string> {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return "Token tidak ditemukan";

    const res = await fetch(`${API_URL}/biopori`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) return data.error || "Gagal mengambil data biopori";

    const items = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    return items.map(mapBioporiItem);
  } catch (err) {
    console.error(err);
    return "Terjadi kesalahan jaringan";
  }
}

export async function markFull(id: string): Promise<string | true> {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return "Token tidak ditemukan";

    const res = await fetch(`${API_URL}/biopori/${id}/full`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) return data.error || "Gagal menandai biopori penuh";

    return true;
  } catch (err) {
    console.error(err);
    return "Terjadi kesalahan jaringan";
  }
}

export async function markHarvested(id: string): Promise<string | true> {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return "Token tidak ditemukan";

    const res = await fetch(`${API_URL}/biopori/${id}/harvested`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) return data.error || "Gagal memanen biopori";

    return true;
  } catch (err) {
    console.error(err);
    return "Terjadi kesalahan jaringan";
  }
}
