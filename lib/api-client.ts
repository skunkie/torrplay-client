import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

import { API_BASE_URL } from '@/lib/constants';

// -- API Client --

export function getApiBaseUrl(): string | null {
  if (typeof window !== 'undefined') {
    const fromStorage = localStorage.getItem('NEXT_PUBLIC_API_URL');
    if (fromStorage) return fromStorage;
  }
  return API_BASE_URL || null;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    throw new Error('API URL is not configured. Please set it in the application settings.');
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const camelError = camelcaseKeys(errorData, { deep: true });
      throw new Error(camelError.message || camelError.detail || `Request failed with status ${response.status}`);
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('API URL')) {
        throw e;
      }
      throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    }
  }
  return response;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return undefined as T;
  }
  const data = await response.json();
  return camelcaseKeys(data, { deep: true }) as T;
}

const buildRequestOptions = (method: string, data?: unknown): RequestInit => {
  const options: RequestInit = { method };
  if (!data) return options;

  if (data instanceof FormData) {
    options.body = data;
  } else {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(snakecaseKeys(data as Record<string, unknown>, { deep: true }));
  }
  return options;
};

export const api = {
  get: async <T>(path: string): Promise<T> => {
    const response = await apiFetch(path, { method: 'GET' });
    return handleResponse<T>(response);
  },
  post: async <T>(path: string, data: unknown): Promise<T> => {
    const options = buildRequestOptions('POST', data);
    const response = await apiFetch(path, options);
    return handleResponse<T>(response);
  },
  patch: async <T>(path: string, data: unknown): Promise<T> => {
    const options = buildRequestOptions('PATCH', data);
    const response = await apiFetch(path, options);
    return handleResponse<T>(response);
  },
  delete: async <T>(path: string): Promise<T> => {
    const response = await apiFetch(path, { method: 'DELETE' });
    return handleResponse<T>(response);
  },
};
