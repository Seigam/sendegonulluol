import { api } from './api';
import { User } from './authService';

interface ProfileUpdateData {
  name?: string;
  surname?: string;
  phone?: string;
  bio?: string;
  city?: string;
  interests?: string[];
  organizationName?: string;
  organizationDescription?: string;
  avatar?: string;
}

interface ChangePasswordData {
  currentPassword?: string;
  newPassword?: string;
}

export async function getProfile(): Promise<User> {
  const res = await api.get<{ success: boolean; data: { user: User } }>('/users/profile');
  return res.data.data.user;
}

export async function updateProfile(data: ProfileUpdateData): Promise<User> {
  const res = await api.put<{ success: boolean; data: { user: User } }>('/users/profile', data);
  return res.data.data.user;
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  await api.put('/users/change-password', data);
}

export async function getAllUsers(): Promise<User[]> {
  const res = await api.get<{ success: boolean; data: { users: User[] } }>('/users');
  return res.data.data.users;
}

export async function toggleUserStatus(userId: string): Promise<User> {
  const res = await api.put<{ success: boolean; data: { user: User } }>(`/users/${userId}/toggle-status`);
  return res.data.data.user;
}
