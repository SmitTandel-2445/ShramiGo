import { storage, KEYS } from './storage';

const rawConfiguredUrl = (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

const getApiBaseUrl = (): string => {
  if (rawConfiguredUrl) {
    return rawConfiguredUrl;
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

function formatApiError(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return typeof data === 'string' && data.trim() ? data : 'Something went wrong.';
  }
  const obj = data as Record<string, unknown>;
  const detail = obj.detail;
  if (detail === undefined || detail === null) return 'Something went wrong.';
  if (typeof detail === 'string') return detail.trim() || 'Something went wrong.';
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const v = item as Record<string, unknown>;
          const msg = typeof v.msg === 'string' ? v.msg : '';
          const loc = Array.isArray(v.loc)
            ? (v.loc as unknown[]).filter((l) => l !== 'body').join(' → ')
            : '';
          return loc ? `${loc}: ${msg}` : msg;
        }
        return String(item);
      })
      .filter(Boolean);
    return messages.length > 0 ? messages.join('; ') : 'Validation error.';
  }
  if (typeof detail === 'object') {
    const d = detail as Record<string, unknown>;
    if (typeof d.message === 'string') return d.message;
    try { return JSON.stringify(detail); } catch { return 'Something went wrong.'; }
  }
  return String(detail) || 'Something went wrong.';
}

export class ApiError extends Error {
  public status: number;
  public detail: unknown;
  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await storage.getItem(KEYS.TOKEN);
  const headers = new Headers(options.headers as HeadersInit);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection.', 0, null);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) throw new ApiError(`Request failed (${response.status})`, response.status, null);
    return undefined as T;
  }

  if (!response.ok) {
    const message = formatApiError(data);
    if (response.status === 401) {
      await storage.removeItem(KEYS.TOKEN);
      await storage.removeItem(KEYS.USER);
      await storage.removeItem(KEYS.REFRESH_TOKEN);
    }
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
