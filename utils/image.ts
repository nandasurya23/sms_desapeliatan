import { BACKEND_BASE_URL } from "@/config";

export const resolveBackendAssetUrl = (path?: string | null) => {
  if (!path) return null;
  if (
    path.startsWith("data:") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("file://") ||
    path.startsWith("content://")
  ) {
    return path;
  }
  return `${BACKEND_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
