import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile, changePassword } from '../services/userService';

export function ProfileScreen({ navigation }: any) {
  const { currentUser, logout, setCurrentUser } = useAuth();
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    surname: '',
    city: '',
    phone: '',
    bio: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  if (!currentUser) return null;

  const openEditModal = () => {
    setEditForm({
      name: currentUser.name || '',
      surname: currentUser.surname || '',
      city: currentUser.city || '',
      phone: currentUser.phone || '',
      bio: currentUser.bio || '',
    });
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updatedUser = await updateProfile(editForm);
      setCurrentUser(updatedUser);
      Alert.alert('Başarılı', 'Profiliniz güncellendi.');
      setEditModalVisible(false);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Profil güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    try {
      setLoading(true);
      await changePassword(passwordForm);
      Alert.alert('Başarılı', 'Şifreniz değiştirildi.');
      setPasswordModalVisible(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Şifre değiştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-teal-700 pt-16 pb-20 px-4 items-center">
        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-md">
          <Text className="text-4xl">
            {currentUser.name.charAt(0)}{currentUser.surname.charAt(0)}
          </Text>
        </View>
        <Text className="text-2xl font-bold text-white">
          {currentUser.name} {currentUser.surname}
        </Text>
        <View className="bg-teal-600/50 mt-2 px-3 py-1 rounded-full">
          <Text className="text-teal-50 text-sm font-medium">
            {currentUser.role === 'volunteer' ? '🙋 Gönüllü' : currentUser.role === 'admin' ? '🛡️ Yönetici' : '🏢 Organizatör'}
          </Text>
        </View>
      </View>

      {/* Info Cards */}
      <View className="px-4 -mt-10 mb-6">
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">Rütbe & Görevler</Text>
          <Text className="text-lg font-bold text-teal-600 mb-2">
            {currentUser.currentRank || 'Çaylak Gönüllü'}
          </Text>
          <Text className="text-gray-700 font-medium mb-4">
            Tamamlanan Etkinlik: <Text className="font-bold text-gray-900">{currentUser.completedEventsCount || 0}</Text>
          </Text>

          {currentUser.badges && currentUser.badges.length > 0 && (
            <View>
              <Text className="text-gray-500 text-xs uppercase tracking-wider mb-2">Rozetler</Text>
              <View className="flex-row flex-wrap">
                {currentUser.badges.map((badge, index) => (
                  <View key={index} className="bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full flex-row items-center mr-2 mb-2">
                    <Text className="text-sm mr-1">{badge.icon}</Text>
                    <Text className="text-yellow-700 text-xs font-bold">{badge.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-500 text-xs uppercase tracking-wider">İletişim Bilgileri</Text>
            <TouchableOpacity onPress={openEditModal}>
              <Text className="text-teal-600 text-sm font-bold">Düzenle</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-base text-gray-900 mb-2">{currentUser.email}</Text>
          <Text className="text-base text-gray-900 mb-2">{currentUser.city || 'Şehir belirtilmemiş'}</Text>
          {currentUser.phone && <Text className="text-base text-gray-900 mb-2">{currentUser.phone}</Text>}
          {currentUser.bio && <Text className="text-sm text-gray-600 italic mt-2">"{currentUser.bio}"</Text>}
          
          <TouchableOpacity className="mt-4" onPress={() => setPasswordModalVisible(true)}>
            <Text className="text-teal-600 text-sm font-bold underline">Şifremi Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* Organizatör Paneli Butonu */}
        {(currentUser.role === 'organizer' || currentUser.role === 'admin') && (
          <TouchableOpacity 
            className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-4 flex-row items-center justify-between shadow-sm"
            onPress={() => navigation.navigate('OrganizerPanel')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="business" size={20} color="#ea580c" />
              </View>
              <View>
                <Text className="text-base font-bold text-orange-900">Organizatör Paneli</Text>
                <Text className="text-xs text-orange-700">Etkinliklerini yönet ve yenisini aç</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ea580c" />
          </TouchableOpacity>
        )}

        {/* Admin Paneli Butonu (Sadece Adminlere Gösterilir) */}
        {currentUser.role === 'admin' && (
          <TouchableOpacity 
            className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mt-4 flex-row items-center justify-between shadow-sm"
            onPress={() => navigation.navigate('AdminPanel')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={20} color="#4f46e5" />
              </View>
              <View>
                <Text className="text-base font-bold text-indigo-900">Yönetici Paneli</Text>
                <Text className="text-xs text-indigo-700">Bekleyen etkinlikleri kontrol et</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4f46e5" />
          </TouchableOpacity>
        )}
      </View>

      <View className="px-4 pb-8">
        <Button 
          title="Çıkış Yap" 
          variant="danger" 
          onPress={logout} 
        />
      </View>

      {/* Profil Düzenleme Modalı */}
      <Modal visible={isEditModalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white p-5">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Profili Düzenle</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="space-y-4 mb-8">
              <Input label="Ad" value={editForm.name} onChangeText={(t) => setEditForm({...editForm, name: t})} />
              <Input label="Soyad" value={editForm.surname} onChangeText={(t) => setEditForm({...editForm, surname: t})} />
              <Input label="Şehir" value={editForm.city} onChangeText={(t) => setEditForm({...editForm, city: t})} />
              <Input label="Telefon" value={editForm.phone} onChangeText={(t) => setEditForm({...editForm, phone: t})} keyboardType="phone-pad" />
              <Input label="Hakkımda" value={editForm.bio} onChangeText={(t) => setEditForm({...editForm, bio: t})} />
            </View>
            <Button title="Kaydet" onPress={handleUpdateProfile} isLoading={loading} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Şifre Değiştirme Modalı */}
      <Modal visible={isPasswordModalVisible} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center bg-black/50 p-5">
          <View className="bg-white rounded-3xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Şifre Değiştir</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View className="space-y-4 mb-6">
              <Input 
                label="Mevcut Şifre" 
                value={passwordForm.currentPassword} 
                onChangeText={(t) => setPasswordForm({...passwordForm, currentPassword: t})} 
                isPassword 
              />
              <Input 
                label="Yeni Şifre" 
                value={passwordForm.newPassword} 
                onChangeText={(t) => setPasswordForm({...passwordForm, newPassword: t})} 
                isPassword 
              />
            </View>
            <Button title="Şifreyi Güncelle" onPress={handleChangePassword} isLoading={loading} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
