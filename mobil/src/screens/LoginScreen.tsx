import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      setCurrentUser(user);
    } catch (err: any) {
      Alert.alert('Giriş Başarısız', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-teal-600 mb-2">Hoş Geldiniz 👋</Text>
          <Text className="text-gray-500 text-center">
            Hesabınıza giriş yaparak iyilik hareketine katılın.
          </Text>
        </View>

        <View className="space-y-4">
          <Input 
            label="E-posta Adresi"
            placeholder="ornek@posta.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input 
            label="Şifre"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
          />

          <Button 
            title="Giriş Yap" 
            onPress={handleLogin} 
            isLoading={loading}
            className="mt-4"
          />
        </View>

        <View className="mt-8 flex-row justify-center">
          <Text className="text-gray-600">Hesabınız yok mu? </Text>
          <Text 
            className="text-teal-600 font-bold"
            onPress={() => navigation.navigate('Register')}
          >
            Hemen Kayıt Olun
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
