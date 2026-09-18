import apiClient from "./apiClient";

export interface Biopori {
  id: string;
  name: string;
  date: string;
  time: string;
  end_date?: string;
  end_time?: string;
  image_url?: string;
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
  isFull: Boolean(item.isfull),
  isHarvested: Boolean(item.ispanen),
});

export async function getBiopori(): Promise<Biopori[] | string> {
  try {
    const res = await apiClient.get("/biopori");
    const data = res.data;
    
    const items = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    return items.map(mapBioporiItem);
  } catch (err: any) {
    return err.message || "Gagal mengambil data biopori. Silakan coba lagi.";
  }
}

export async function markFull(id: string): Promise<string | true> {
  try {
    await apiClient.put(`/biopori/${id}/full`);
    return true;
  } catch (err: any) {
    return err.message || "Gagal menandai biopori penuh. Silakan coba lagi.";
  }
}

export async function markHarvested(id: string): Promise<string | true> {
  try {
    await apiClient.put(`/biopori/${id}/harvested`);
    return true;
  } catch (err: any) {
    return err.message || "Gagal memanen biopori. Silakan coba lagi.";
  }
}
