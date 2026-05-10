import { api, saveToken, saveUser, clearToken, getStoredUser } from './api';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  role: 'volunteer' | 'organizer' | 'admin';
  bio?: string;
  avatar?: string;
  interests?: string[];
  city?: string;
  completedEventsCount: number;
  badges: { name: string; icon: string; earnedAt: string }[];
  currentRank: string;
  organizationName?: string;
  organizationDescription?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: { token: string; user: User };
}

interface MeResponse {
  success: boolean;
  data: { user: User };
}

// Giriş yap
export async function login(email: string, password: string): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  saveToken(res.data.token);
  saveUser(res.data.user);
  return res.data.user;
}

// Kayıt ol
export async function register(payload: {
  name: string;
  surname: string;
  email: string;
  password: string;
  role?: string;
  city?: string;
  organizationName?: string;
}): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/register', payload);
  saveToken(res.data.token);
  saveUser(res.data.user);
  return res.data.user;
}

// Token ile mevcut kullanıcı bilgisini al
export async function getMe(): Promise<User> {
  const res = await api.get<MeResponse>('/auth/me');
  saveUser(res.data.user);
  return res.data.user;
}

// Çıkış yap
export function logout(): void {
  clearToken();
}

// localStorage'daki kullanıcıyı döndür (senkron)
export { getStoredUser };
