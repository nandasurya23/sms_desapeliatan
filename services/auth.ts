// services/auth.ts
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config/index";

interface LoginResponse {
  token: string;
  user?: { id: string; username: string };
  error?: string;
}

interface ProfileResponse {
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
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) return { token: "", error: data.error || "Login failed" };

    if (data.token) await SecureStore.setItemAsync("token", data.token);

    return data;
  } catch (err) {
    return { token: "", error: "Network error" };
  }
}

// ===== REGISTER =====
export async function register(user: RegisterData): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const data = await response.json();

    if (!response.ok) return { error: data.error || "Registration failed" };

    if (data.token) await SecureStore.setItemAsync("token", data.token);

    return data;
  } catch (err) {
    return { error: "Network error" };
  }
}

// ===== GET PROFILE =====
export async function getUserData(): Promise<ProfileResponse> {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return { error: "No token found" };

    const response = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) return { error: data.error || "Failed to fetch profile" };

    return data;
  } catch (err) {
    return { error: "Network error" };
  }
}
