import { api } from './api';

export interface Application {
  _id: string;
  event: {
    _id: string;
    title: string;
    category: string;
    date: { start: string; end: string };
    location: { city: string; address: string };
    status: string;
    coverImage: string;
  };
  user: {
    _id: string;
    name: string;
    surname: string;
    email: string;
    phone?: string;
    city?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  note?: string;
  createdAt: string;
}

interface ApplicationsResponse {
  success: boolean;
  data: { applications: Application[] };
}

interface SingleApplicationResponse {
  success: boolean;
  message: string;
  data: { application: Application };
}

// Etkinliğe başvur
export async function applyForEvent(eventId: string, note?: string): Promise<void> {
  await api.post(`/applications/${eventId}`, { note: note || '' });
}

// Kendi başvurularımı getir
export async function getMyApplications(): Promise<Application[]> {
  const res = await api.get<ApplicationsResponse>('/applications/my');
  return res.data.applications;
}

// Bir etkinliğin başvurularını getir (org/admin)
export async function getEventApplications(eventId: string): Promise<Application[]> {
  const res = await api.get<ApplicationsResponse>(`/applications/event/${eventId}`);
  return res.data.applications;
}

// CSV dışa aktarma URL'ini döndür (fetch yerine direkt link)
export function getCSVExportUrl(eventId: string): string {
  return `/api/applications/event/${eventId}/csv`;
}

// Başvuruyu geri çek
export async function withdrawApplication(applicationId: string): Promise<void> {
  await api.delete(`/applications/${applicationId}`);
}
