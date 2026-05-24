/**
 * Merkezi API istemcisi
 * Tüm HTTP istekleri buradan geçer.
 * Token otomatik olarak header'a eklenir.
 */

// Vercel gibi ortamlarda çevre değişkeninden (environment variable) URL okunur. 
// Lokal ortamda proxy devreye gireceği için '/api' kullanılır.
export const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Görsel URL'lerini backend adresine göre çözümlemek için yardımcı fonksiyon
export function getImageUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Zaten tam URL ise dokunma
  
  const serverUrl = BASE_URL.endsWith('/api') 
    ? BASE_URL.slice(0, -4) 
    : BASE_URL;
    
  return `${serverUrl === '' ? '' : serverUrl}${path}`;
}

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
    // Backend doğrulama hatalarını detaylı göster
    let errorMsg = data.message || 'Bir hata oluştu.';
    if (data.errors && Array.isArray(data.errors)) {
      const fieldErrors = data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
      errorMsg += ' (' + fieldErrors + ')';
    }
    console.error('API Hatası:', errorMsg, data);
    throw new Error(errorMsg);
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
