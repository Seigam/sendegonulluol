import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getManagedEvents, updateEventStatus, completeEvent, Event } from '../services/eventService';
import { getAllUsers, toggleUserStatus } from '../services/userService';
import { User } from '../services/authService';

export function AdminPanelScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'events') {
        const data = await getManagedEvents(); // Fetch all events
        setEvents(data);
      } else {
        const data = await getAllUsers();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleEventStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateEventStatus(id, status);
      Alert.alert('Başarılı', `Etkinlik ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
      loadData();
    } catch (error) {
      Alert.alert('Hata', 'Etkinlik güncellenirken bir sorun oluştu.');
    }
  };

  const handleComplete = (id: string) => {
    Alert.alert('Etkinliği Sonuçlandır', 'Etkinliği sonuçlandırdığınızda katılan gönüllülerin puanları otomatik verilecektir. Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Sonuçlandır', 
        style: 'default',
        onPress: async () => {
          try {
            await completeEvent(id);
            Alert.alert('Başarılı', 'Etkinlik sonuçlandırıldı ve gönüllülere ödülleri dağıtıldı!');
            loadData();
          } catch (error) {
            Alert.alert('Hata', 'Etkinlik sonuçlandırılırken bir sorun oluştu.');
          }
        }
      }
    ]);
  };

  const handleUserToggle = async (id: string, currentStatus: boolean) => {
    Alert.alert(
      'Kullanıcı Durumu',
      `Kullanıcıyı ${currentStatus ? 'pasif' : 'aktif'} yapmak istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Onayla', 
          onPress: async () => {
            try {
              await toggleUserStatus(id);
              loadData();
            } catch (error) {
              Alert.alert('Hata', 'Kullanıcı durumu güncellenemedi.');
            }
          }
        }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-12 bg-teal-800 shadow-sm">
        <View className="flex-row items-center pb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-white">Yönetici Paneli</Text>
            <Text className="text-teal-200 mt-1">Sistem Yönetimi</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row mt-2">
          <TouchableOpacity 
            className={`flex-1 py-3 items-center border-b-4 ${activeTab === 'events' ? 'border-white' : 'border-transparent'}`}
            onPress={() => setActiveTab('events')}
          >
            <Text className={`font-bold ${activeTab === 'events' ? 'text-white' : 'text-teal-300'}`}>Etkinlikler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 items-center border-b-4 ${activeTab === 'users' ? 'border-white' : 'border-transparent'}`}
            onPress={() => setActiveTab('users')}
          >
            <Text className={`font-bold ${activeTab === 'users' ? 'text-white' : 'text-teal-300'}`}>Kullanıcılar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'events' ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 overflow-hidden p-4">
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-lg font-bold text-gray-900 flex-1">{item.title}</Text>
                <View className={`px-2 py-1 rounded-full ${
                  item.status === 'pending' ? 'bg-yellow-100' :
                  item.status === 'approved' ? 'bg-teal-100' :
                  item.status === 'completed' ? 'bg-gray-200' : 'bg-red-100'
                }`}>
                  <Text className={`text-[10px] font-bold ${
                    item.status === 'pending' ? 'text-yellow-700' :
                    item.status === 'approved' ? 'text-teal-700' :
                    item.status === 'completed' ? 'text-gray-700' : 'text-red-700'
                  }`}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600 mb-2">Organizatör: {item.organizer?.name} {item.organizer?.surname}</Text>
              <Text className="text-xs text-gray-500 mb-4" numberOfLines={2}>{item.description}</Text>
              
              <View className="flex-row justify-between space-x-2">
                {item.status === 'pending' && (
                  <>
                    <TouchableOpacity 
                      className="flex-1 bg-red-100 py-2 rounded-xl items-center flex-row justify-center"
                      onPress={() => handleEventStatusUpdate(item._id, 'rejected')}
                    >
                      <Ionicons name="close" size={16} color="#b91c1c" />
                      <Text className="text-red-700 font-bold ml-1">Reddet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="flex-1 bg-teal-600 py-2 rounded-xl items-center flex-row justify-center"
                      onPress={() => handleEventStatusUpdate(item._id, 'approved')}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                      <Text className="text-white font-bold ml-1">Onayla</Text>
                    </TouchableOpacity>
                  </>
                )}

                {item.status === 'approved' && (
                  <TouchableOpacity 
                    className="flex-1 bg-indigo-50 py-2 rounded-xl items-center flex-row justify-center border border-indigo-100"
                    onPress={() => handleComplete(item._id)}
                  >
                    <Ionicons name="checkmark-done" size={16} color="#4338ca" />
                    <Text className="text-indigo-700 font-bold ml-1">Etkinliği Sonuçlandır</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="py-10 items-center">
              <Text className="text-gray-500">Etkinlik bulunmuyor.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 overflow-hidden p-4 flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-bold text-gray-900 mr-2">{item.name} {item.surname}</Text>
                  <View className="bg-indigo-100 px-2 py-0.5 rounded-full">
                    <Text className="text-indigo-700 text-[10px] font-bold uppercase">{item.role}</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-500">{item.email}</Text>
              </View>
              
              <TouchableOpacity 
                className={`px-3 py-1.5 rounded-lg border ${item.isActive ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
                onPress={() => handleUserToggle(item.id, item.isActive)}
              >
                <Text className={`text-xs font-bold ${item.isActive ? 'text-red-700' : 'text-green-700'}`}>
                  {item.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View className="py-10 items-center">
              <Text className="text-gray-500">Kullanıcı bulunamadı.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
