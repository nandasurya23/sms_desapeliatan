import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/config';
import { router } from 'expo-router';

// Membuat instance axios dengan konfigurasi dasar
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 detik timeout
});

// Request Interceptor: Menyisipkan token secara otomatis di setiap request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token for request interceptor', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Menangani error secara global, khususnya 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    // Parsing custom success API format
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.error || response.data.message || 'Terjadi kesalahan pada server'));
    }
    return response;
  },
  async (error: AxiosError) => {
    // Jangan redirect jika error 401 terjadi pada endpoint login/register
    const isAuthEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Jika token tidak valid / expired
      try {
        await SecureStore.deleteItemAsync('token');
        
        // Redirect ke halaman login secara paksa
        router.replace('/(auth)/login');
      } catch (e) {
        console.error('Error clearing token on 401', e);
      }
    }
    
    // Format error message to be consistent
    const errorMessage = (error.response?.data as any)?.error || error.message || 'Terjadi masalah pada jaringan. Silakan periksa koneksi Anda.';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
