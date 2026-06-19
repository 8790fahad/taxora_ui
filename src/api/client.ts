import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';

const TOKEN_KEY = 'taxora_token';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});



api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    if (status === 403 && code?.startsWith('TENANT_NOT_ACTIVE')) {
      if (!window.location.pathname.startsWith('/onboarding')) {
        window.location.href = '/onboarding';
      }
    }

    if (status === 403 && code?.startsWith('ONBOARDING')) {
      if (!window.location.pathname.startsWith('/onboarding')) {
        window.location.href = '/onboarding';
      }
    }

    return Promise.reject(error);
  }
);

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}



export default api;
