import { api } from './api';

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
  organizer: {
    _id: string;
    name: string;
    surname: string;
    organizationName?: string;
  };
}

interface EventsResponse {
  success: boolean;
  data: {
    events: Event[];
  };
}

interface SingleEventResponse {
  success: boolean;
  data: { event: Event };
}

export async function getEvents(search?: string, category?: string): Promise<Event[]> {
  try {
    let url = '/events?limit=50';
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category && category !== 'Tümü') url += `&category=${encodeURIComponent(category)}`;
    
    const res = await api.get<EventsResponse>(url);
    return res.data.data.events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export async function getEventById(id: string): Promise<Event> {
  const res = await api.get<SingleEventResponse>(`/events/${id}`);
  return res.data.data.event;
}

export async function getManagedEvents(status?: string): Promise<Event[]> {
  let url = '/events/manage';
  if (status) {
    url += `?status=${status}`;
  }
  const res = await api.get<EventsResponse>(url);
  return res.data.data.events;
}

export async function createEvent(data: Partial<Event>): Promise<Event> {
  const res = await api.post<{ success: boolean; data: { event: Event } }>('/events', data);
  return res.data.data.event;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}

export async function updateEventStatus(id: string, status: 'approved' | 'rejected' | 'completed'): Promise<Event> {
  const res = await api.patch<SingleEventResponse>(`/events/${id}/status`, { status });
  return res.data.data.event;
}

export async function completeEvent(id: string): Promise<Event> {
  const res = await api.patch<SingleEventResponse>(`/events/${id}/complete`);
  return res.data.data.event;
}

export async function uploadImage(uri: string, filename: string, type: string): Promise<string> {
  const formData = new FormData();
  
  // React Native fetch/axios formData requires an object with uri, type, name for files
  formData.append('image', {
    uri: uri,
    type: type,
    name: filename,
  } as any);

  const res = await api.post<{ success: boolean; url: string; message: string }>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.url;
}
