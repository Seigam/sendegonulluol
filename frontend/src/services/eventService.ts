import { api, BASE_URL } from './api';

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: { city: string; address: string };
  date: { start: string; end: string };
  quota: number;
  appliedCount: number;
  coverImage: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  adminMessage?: string;
  organizer: {
    _id: string;
    name: string;
    surname: string;
    organizationName?: string;
    avatar?: string;
  };
  createdAt: string;
}

interface EventsResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination: { currentPage: number; totalPages: number; totalEvents: number; limit: number };
  };
}

interface SingleEventResponse {
  success: boolean;
  data: { event: Event };
}

// Tüm onaylı etkinlikleri getir (opsiyonel filtreler)
export async function getEvents(params?: {
  search?: string;
  category?: string;
  city?: string;
  page?: number;
}): Promise<Event[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.city) query.set('city', params.city);
  if (params?.page) query.set('page', String(params.page));

  const endpoint = `/events${query.toString() ? '?' + query.toString() : ''}`;
  const res = await api.get<EventsResponse>(endpoint);
  return res.data.events;
}

// Yönetilen etkinlikler (organizer/admin)
export async function getManagedEvents(params?: { status?: string }): Promise<Event[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  const endpoint = `/events/manage${query.toString() ? '?' + query.toString() : ''}`;
  const res = await api.get<EventsResponse>(endpoint);
  return res.data.events;
}

// Etkinlik detayı
export async function getEventById(id: string): Promise<Event> {
  const res = await api.get<SingleEventResponse>(`/events/${id}`);
  return res.data.event;
}

// Etkinlik oluştur
export async function createEvent(payload: {
  title: string;
  description: string;
  category: string;
  location: { city: string; address: string };
  date: { start: string; end: string };
  quota: number;
  coverImage?: string;
}): Promise<Event> {
  const res = await api.post<SingleEventResponse>('/events', payload);
  return res.data.event;
}

// Etkinlik sil
export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}

// Etkinlik durumu güncelle (admin onay/ret)
export async function updateEventStatus(
  id: string,
  status: 'approved' | 'rejected' | 'cancelled' | 'completed',
  adminMessage?: string
): Promise<Event> {
  const res = await api.patch<SingleEventResponse>(`/events/${id}/status`, {
    status,
    adminMessage,
  });
  return res.data.event;
}

// Etkinliği sonuçlandır ve katılımcıları ödüllendir (admin/organizer)
export async function completeEvent(id: string): Promise<Event> {
  const res = await api.patch<SingleEventResponse>(`/events/${id}/complete`);
  return res.data.event;
}

// Görsel yükle (FormData göndermek için native fetch kullanılır, api helper JSON-only çalışır)
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Content-Type header'ını EKLEMİYORUZ — tarayıcı FormData boundary'sini otomatik ayarlar

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Görsel yüklenemedi.');
  }

  return data.url;
}
