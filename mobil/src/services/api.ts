import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Expo Go fiziksel cihazlarda localhost'a erişemez. Bu yüzden bilgisayarın yerel ağ IP'si kullanılır.
// Android Studio Emülatörü kullanıyorsanız ve 'Network Error' alırsanız, bu IP'yi '10.0.2.2' olarak değiştirin.
// EAS Build sırasında .env bazen algılanmayabiliyor, bu yüzden garantilemek için doğrudan canlı URL'yi kodluyoruz.
export const BASE_URL = 'https://sendegonulluol-production.up.railway.app';
// export const BASE_URL = 'http://192.168.1.62:5000'; // Lokal test için bunu açabilirsiniz.

const API_URL = `${BASE_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 saniye zaman aşımı (Sonsuza kadar beklemesini önler)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her istekte token'ı ekle
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Sık kullanılan yanıt hataları yakalanabilir
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired vb. durumlar yönetilebilir (ör. logout)
      await SecureStore.deleteItemAsync('token');
    }
    const message = error.response?.data?.message || `Bağlantı kurulamadı (${error.config?.baseURL}). İnternet bağlantınızı kontrol edin.`;
    return Promise.reject(new Error(message));
  }
);
