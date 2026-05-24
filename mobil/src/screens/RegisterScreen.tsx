import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/authService';

export function RegisterScreen({ navigation }: any) {
  const [role, setRole] = useState<'volunteer' | 'organizer'>('volunteer');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    city: '',
    organizationName: '',
  });
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password) {
      Alert.alert('Hata', 'Lütfen temel alanları doldurun.');
      return;
    }
    
    setLoading(true);
    const parts = form.fullName.trim().split(' ');
    const name = parts[0] || '';
    const surname = parts.slice(1).join(' ') || name;

    try {
      const user = await register({
        name,
        surname,
        email: form.email,
        password: form.password,
        role,
        city: form.city || undefined,
        organizationName: role === 'organizer' ? form.organizationName : undefined,
      });
      setCurrentUser(user);
    } catch (err: any) {
      Alert.alert('Kayıt Başarısız', err.message);
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
        <View className="items-center mb-6">
          <Text className="text-3xl font-bold text-teal-600 mb-2">Aramıza Katılın 🌟</Text>
        </View>

        {/* Role Selection */}
        <View className="flex-row justify-between mb-6 space-x-2">
          {(['volunteer', 'organizer'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              className={`flex-1 py-3 rounded-xl border-2 items-center justify-center ${
                role === r ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white'
              }`}
            >
              <Text className={`font-semibold ${role === r ? 'text-teal-700' : 'text-gray-500'}`}>
                {r === 'volunteer' ? '🙋 Gönüllü' : '🏢 Organizatör'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="space-y-2">
          <Input 
            label="Ad Soyad"
            placeholder="Adınız Soyadınız"
            value={form.fullName}
            onChangeText={(t) => setForm({...form, fullName: t})}
          />
          <Input 
            label="E-posta Adresi"
            placeholder="ornek@posta.com"
            value={form.email}
            onChangeText={(t) => setForm({...form, email: t})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input 
            label="Şehir"
            placeholder="İstanbul"
            value={form.city}
            onChangeText={(t) => setForm({...form, city: t})}
          />
          {role === 'organizer' && (
            <Input 
              label="Topluluk / Kurum Adı"
              placeholder="Yeşil Doğa Derneği"
              value={form.organizationName}
              onChangeText={(t) => setForm({...form, organizationName: t})}
            />
          )}
          <Input 
            label="Şifre"
            placeholder="En az 6 karakter"
            value={form.password}
            onChangeText={(t) => setForm({...form, password: t})}
            isPassword
          />

          <Button 
            title="Kayıt Ol" 
            onPress={handleRegister} 
            isLoading={loading}
            className="mt-2"
          />
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">Zaten hesabınız var mı? </Text>
          <Text 
            className="text-teal-600 font-bold"
            onPress={() => navigation.navigate('Login')}
          >
            Giriş Yapın
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
