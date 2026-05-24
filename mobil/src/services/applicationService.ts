import { api } from './api';

export interface Application {
  _id: string;
  event: {
    _id: string;
    title: string;
    category: string;
    date: { start: string; end: string };
    location: { city: string };
    coverImage: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';
  createdAt: string;
}

interface ApplicationsResponse {
  success: boolean;
  data: {
    applications: Application[];
  };
}

export async function getMyApplications(): Promise<Application[]> {
  const res = await api.get<ApplicationsResponse>('/applications/my');
  return res.data.data.applications;
}

export async function applyForEvent(eventId: string): Promise<Application> {
  const res = await api.post<{ success: boolean; data: { application: Application } }>(`/applications/${eventId}`);
  return res.data.data.application;
}

export async function withdrawApplication(applicationId: string): Promise<void> {
  await api.delete(`/applications/${applicationId}`);
}
