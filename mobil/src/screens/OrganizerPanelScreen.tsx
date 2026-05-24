import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getManagedEvents, deleteEvent, completeEvent, Event } from '../services/eventService';

export function OrganizerPanelScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getManagedEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Etkinliği Sil', 'Bu etkinliği silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Sil', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(id);
            Alert.alert('Başarılı', 'Etkinlik silindi.');
            loadEvents();
          } catch (error) {
            Alert.alert('Hata', 'Etkinlik silinirken bir sorun oluştu.');
          }
        }
      }
    ]);
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
            loadEvents();
          } catch (error) {
            Alert.alert('Hata', 'Etkinlik sonuçlandırılırken bir sorun oluştu.');
          }
        }
      }
    ]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <View className="bg-yellow-100 px-2 py-1 rounded-full"><Text className="text-yellow-700 text-xs font-bold">Onay Bekliyor</Text></View>;
      case 'approved': return <View className="bg-teal-100 px-2 py-1 rounded-full"><Text className="text-teal-700 text-xs font-bold">Onaylandı</Text></View>;
      case 'rejected': return <View className="bg-red-100 px-2 py-1 rounded-full"><Text className="text-red-700 text-xs font-bold">Reddedildi</Text></View>;
      case 'completed': return <View className="bg-gray-200 px-2 py-1 rounded-full"><Text className="text-gray-700 text-xs font-bold">Tamamlandı</Text></View>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-12 pb-4 bg-teal-800 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-white">Organizatör Paneli</Text>
            <Text className="text-teal-200 mt-1">Yönettiğiniz etkinlikler</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('CreateEvent')}>
          <View className="bg-white/20 p-2 rounded-full">
            <Ionicons name="add" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 overflow-hidden p-4"
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">{item.title}</Text>
              {getStatusBadge(item.status)}
            </View>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text className="text-slate-500 text-xs font-semibold ml-1 mr-3">
                {new Date(item.date.start).toLocaleDateString('tr-TR')}
              </Text>
              <Ionicons name="people-outline" size={14} color="#64748b" />
              <Text className="text-slate-500 text-xs font-semibold ml-1">
                {item.appliedCount} / {item.quota} Başvuru
              </Text>
            </View>
            
            <View className="flex-row justify-end space-x-2 border-t border-gray-100 pt-3">
              {item.status === 'approved' && (
                <TouchableOpacity 
                  className="bg-indigo-50 px-3 py-1.5 rounded-lg flex-row items-center mr-2"
                  onPress={() => handleComplete(item._id)}
                >
                  <Ionicons name="checkmark-done" size={16} color="#4338ca" />
                  <Text className="text-indigo-700 text-xs font-bold ml-1">Sonuçlandır</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                className="bg-red-50 px-3 py-1.5 rounded-lg flex-row items-center"
                onPress={() => handleDelete(item._id)}
              >
                <Ionicons name="trash-outline" size={16} color="#b91c1c" />
                <Text className="text-red-700 text-xs font-bold ml-1">Sil</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-gray-500 mb-4">Henüz oluşturduğunuz bir etkinlik yok.</Text>
            <TouchableOpacity 
              className="bg-teal-600 px-4 py-2 rounded-xl flex-row items-center"
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-bold ml-1">Etkinlik Oluştur</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
