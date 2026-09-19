import { apiRequest } from '@/lib/api';
import { storage, KEYS } from '@/lib/storage';

export interface AuthUser {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  role: 'customer' | 'worker' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!data.access_token) throw new Error('Login succeeded but no access token was received.');
  await storage.setItem(KEYS.TOKEN, data.access_token);
  await storage.setItem(KEYS.USER, JSON.stringify(data.user));
  await storage.setItem(KEYS.REFRESH_TOKEN, data.refresh_token);
  return data;
}

export async function registerCustomer(data: {
  full_name: string; phone: string; email: string; password: string;
}): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: 'customer' }),
  });
  if (!response.access_token) throw new Error('Registration succeeded but no access token was received.');
  await storage.setItem(KEYS.TOKEN, response.access_token);
  await storage.setItem(KEYS.USER, JSON.stringify(response.user));
  await storage.setItem(KEYS.REFRESH_TOKEN, response.refresh_token);
  return response;
}

export async function registerWorker(data: {
  full_name: string; phone: string; email: string; password: string;
}): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: 'worker' }),
  });
  if (!response.access_token) throw new Error('Registration succeeded but no access token was received.');
  await storage.setItem(KEYS.TOKEN, response.access_token);
  await storage.setItem(KEYS.USER, JSON.stringify(response.user));
  await storage.setItem(KEYS.REFRESH_TOKEN, response.refresh_token);
  return response;
}

export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const raw = await storage.getItem(KEYS.USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const refreshToken = await storage.getItem(KEYS.REFRESH_TOKEN);
  if (refreshToken) {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch { /* ignore */ }
  }
  await storage.removeItem(KEYS.TOKEN);
  await storage.removeItem(KEYS.USER);
  await storage.removeItem(KEYS.REFRESH_TOKEN);
}
