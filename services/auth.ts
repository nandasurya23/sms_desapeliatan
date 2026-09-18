// services/auth.ts
import * as SecureStore from "expo-secure-store";
import apiClient from "./apiClient";

interface LoginResponse {
  success?: boolean;
  token?: string;
  user?: { id: string; username: string };
  error?: string;
}

interface ProfileResponse {
  success?: boolean;
  data?: {
    id?: string | number;
    username?: string;
    phone_number?: string | null;
    email?: string | null;
    banjar?: string | null;
    profile_picture?: string | null;
    biopori_count?: number;
  };
  error?: string;
}

interface RegisterData {
  username: string;
  phone_number: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  token?: string;
  error?: string;
}

// ===== LOGIN =====
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<{ data?: LoginResponse, token?: string }>("/login", { username, password });
    
    const payload = response.data.data || response.data;

    if (payload.token) {
      await SecureStore.setItemAsync("token", payload.token);
    }
    
    return payload;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Gagal terhubung ke server. Periksa koneksi Anda.";
    return { success: false, token: "", error: errorMessage };
  }
}

export async function register(user: RegisterData): Promise<{ success?: boolean; error?: string; message?: string }> {
  try {
    const response = await apiClient.post<{ success?: boolean; message?: string }>("/register", user);
    
    // Register success response usually just returns { success: true, message: "..." }
    return response.data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Gagal terhubung ke server. Periksa koneksi Anda.";
    return { success: false, error: errorMessage };
  }
}

// ===== GET PROFILE =====
export async function getUserData(): Promise<ProfileResponse> {
  try {
    const response = await apiClient.get<{ data?: ProfileResponse }>("/profile");
    return response.data.data || response.data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Gagal terhubung ke server. Periksa koneksi Anda.";
    return { error: errorMessage };
  }
}
