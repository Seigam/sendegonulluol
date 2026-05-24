import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe, logout as authLogout, getStoredUser } from '../../services/authService';
import { getEvents, getManagedEvents, createEvent as apiCreateEvent, updateEventStatus as apiUpdateStatus, deleteEvent as apiDeleteEvent } from '../../services/eventService';
import { applyForEvent as apiApply, getMyApplications } from '../../services/applicationService';
import type { User } from '../../services/authService';
import type { Event } from '../../services/eventService';
import type { Application } from '../../services/applicationService';

interface AppContextType {
  // Auth
  currentUser: User | null;
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  // Events
  events: Event[];
  managedEvents: Event[];
  fetchEvents: (params?: { search?: string; category?: string }) => Promise<void>;
  fetchManagedEvents: () => Promise<void>;
  createEvent: (data: any) => Promise<void>;
  updateEventStatus: (id: string, status: string, adminMessage?: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  // Applications
  myApplications: Application[];
  fetchMyApplications: () => Promise<void>;
  applyForEvent: (eventId: string, note?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [managedEvents, setManagedEvents] = useState<Event[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);

  // Uygulama açılınca token varsa kullanıcıyı doğrula
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !currentUser) {
      getMe()
        .then(setCurrentUser)
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    }
  }, []);

  const logout = () => {
    authLogout();
    setCurrentUser(null);
    setEvents([]);
    setManagedEvents([]);
    setMyApplications([]);
  };

  const fetchEvents = async (params?: { search?: string; category?: string }) => {
    try {
      setIsLoading(true);
      const data = await getEvents(params);
      setEvents(data);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchManagedEvents = async () => {
    try {
      const data = await getManagedEvents();
      setManagedEvents(data);
    } catch (err) {
      console.error('Yönetilen etkinlikler alınamadı:', err);
    }
  };

  const createEvent = async (payload: any) => {
    await apiCreateEvent(payload);
    await fetchManagedEvents();
  };

  const updateEventStatus = async (id: string, status: string, adminMessage?: string) => {
    await apiUpdateStatus(id, status as any, adminMessage);
    // Hem genel hem yönetilen listeyi güncelle
    await fetchEvents();
    if (currentUser?.role === 'admin') {
      await fetchManagedEvents();
    }
  };

  const deleteEvent = async (id: string) => {
    await apiDeleteEvent(id);
    setManagedEvents((prev) => prev.filter((e) => e._id !== id));
  };

  const fetchMyApplications = async () => {
    try {
      const data = await getMyApplications();
      setMyApplications(data);
    } catch (err) {
      console.error('Başvurular alınamadı:', err);
    }
  };

  const applyForEvent = async (eventId: string, note?: string) => {
    await apiApply(eventId, note);
    // Başvuru sayısını güncelle
    setEvents((prev) =>
      prev.map((e) =>
        e._id === eventId ? { ...e, appliedCount: e.appliedCount + 1 } : e
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoading,
        setCurrentUser,
        logout,
        events,
        managedEvents,
        fetchEvents,
        fetchManagedEvents,
        createEvent,
        updateEventStatus,
        deleteEvent,
        myApplications,
        fetchMyApplications,
        applyForEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

// Eski tip uyumluluğu için alias exportlar
export type { User, Event, Application };
