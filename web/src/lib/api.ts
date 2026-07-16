import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse } from '@/types';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// ---- Automatic refresh with a single in-flight refresh shared by concurrent 401s
let refreshPromise: Promise<string | null> | null = null;

async function refreshSession(): Promise<string | null> {
  const { refreshToken, setSession, clearSession } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken });
    setSession(data);
    return data.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthRoute = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      refreshPromise ??= refreshSession().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

/** Extracts a user-friendly message from an API error. */
export function getApiErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; details?: Record<string, string[]> } | undefined;
    if (data?.details) {
      const first = Object.values(data.details).flat()[0];
      if (first) return first;
    }
    if (data?.message) return data.message;
    if (error.code === 'ERR_NETWORK') return 'Não foi possível conectar ao servidor.';
  }
  return fallback;
}
