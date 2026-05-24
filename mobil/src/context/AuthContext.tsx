import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, getMe, logout as authLogout } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          const userStr = await SecureStore.getItemAsync('user');
          if (userStr) {
            setCurrentUser(JSON.parse(userStr));
          }
          // Arka planda güncel bilgiyi çek (isteğe bağlı)
          getMe()
            .then(setCurrentUser)
            .catch(() => {
              SecureStore.deleteItemAsync('token');
              SecureStore.deleteItemAsync('user');
              setCurrentUser(null);
            });
        }
      } catch (err) {
        console.error('Kullanıcı yüklenemedi', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    await authLogout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
