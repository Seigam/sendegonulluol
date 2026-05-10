/**
 * Merkezi API istemcisi
 * Tüm HTTP istekleri buradan geçer.
 * Token otomatik olarak header'a eklenir.
 */

const BASE_URL = '/api';

// localStorage'daki token'ı al
function getToken(): string | null {
  return localStorage.getItem('token');
}

// Token kaydet
export function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

// Token sil (çıkış)
export function clearToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Kullanıcıyı kaydet
export function saveUser(user: object): void {
  localStorage.setItem('user', JSON.stringify(user));
}

// Kullanıcıyı al
export function getStoredUser(): any | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// Temel istek fonksiyonu
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Bir hata oluştu.');
  }

  return data;
}

// HTTP yardımcıları
export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: object) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body: object) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body: object) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
