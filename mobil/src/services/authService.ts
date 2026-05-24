import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  role: 'volunteer' | 'organizer' | 'admin';
  bio?: string;
  avatar?: string;
  city?: string;
  completedEventsCount: number;
  badges: { name: string; icon: string; earnedAt: string }[];
  currentRank: string;
  organizationName?: string;
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

export async function login(email: string, password: string): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  await SecureStore.setItemAsync('token', res.data.data.token);
  await SecureStore.setItemAsync('user', JSON.stringify(res.data.data.user));
  return res.data.data.user;
}

export async function register(payload: any): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/register', payload);
  await SecureStore.setItemAsync('token', res.data.data.token);
  await SecureStore.setItemAsync('user', JSON.stringify(res.data.data.user));
  return res.data.data.user;
}

export async function getMe(): Promise<User> {
  const res = await api.get<MeResponse>('/auth/me');
  await SecureStore.setItemAsync('user', JSON.stringify(res.data.data.user));
  return res.data.data.user;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('user');
}
