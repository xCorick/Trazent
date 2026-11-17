import { env } from '@/config/env';
import { ApiError } from './apiError';
import { tokenStorage } from './tokenStorage';

type Query = Record<string, string | number | boolean | undefined>;

const TIMEOUT_MS = 15_000;

function buildUrl(path: string, query?: Query): string {
  const url = `${env.apiUrl}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return params ? `${url}?${params}` : url;
}

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = tokenStorage.getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Error ${response.status}`;
      try {
        const data = (await response.json()) as { message?: string; title?: string };
        message = data.message ?? data.title ?? message;
      } catch {
        // Respuesta sin cuerpo JSON.
      }
      // TODO: con la API real, renovar el access token con el refresh token ante un 401.
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/** Cliente HTTP para la API ASP.NET Core. */
export const http = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
};

/** Parte de archivo para FormData en React Native ({ uri, name, type }). */
export function filePart(uri: string, name: string, type = 'image/jpeg') {
  return { uri, name, type } as unknown as Blob;
}
