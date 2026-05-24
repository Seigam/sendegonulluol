import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMyApplications, withdrawApplication, Application } from '../services/applicationService';

export function ApplicationsScreen({ navigation }: any) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const onRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const handleWithdraw = (id: string) => {
    Alert.alert(
      'Başvuruyu İptal Et',
      'Bu başvurunuzu tamamen iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'İptal Et', 
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawApplication(id);
              Alert.alert('Başarılı', 'Başvurunuz başarıyla iptal edildi.');
              loadApplications();
            } catch (error) {
              Alert.alert('Hata', 'İptal işlemi sırasında bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <View className="bg-yellow-100 px-2 py-1 rounded-full"><Text className="text-yellow-700 text-xs font-bold">Bekliyor</Text></View>;
      case 'accepted':
        return <View className="bg-green-100 px-2 py-1 rounded-full"><Text className="text-green-700 text-xs font-bold">Kabul Edildi</Text></View>;
      case 'rejected':
        return <View className="bg-red-100 px-2 py-1 rounded-full"><Text className="text-red-700 text-xs font-bold">Reddedildi</Text></View>;
      case 'completed':
        return <View className="bg-teal-100 px-2 py-1 rounded-full"><Text className="text-teal-700 text-xs font-bold">Tamamlandı</Text></View>;
      default:
        return <View className="bg-gray-100 px-2 py-1 rounded-full"><Text className="text-gray-700 text-xs font-bold">Bilinmiyor</Text></View>;
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
      <View className="px-4 pt-12 pb-4 bg-teal-600 shadow-sm">
        <Text className="text-2xl font-bold text-white">Başvurularım</Text>
        <Text className="text-teal-100 mt-1">
          Katıldığınız ve bekleyen etkinlik başvurularınız
        </Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
        }
        renderItem={({ item }) => {
          const imageUrl = item.event?.coverImage
            ? `http://192.168.1.68:5000${item.event.coverImage}`
            : 'https://via.placeholder.com/150?text=Görsel+Yok';

          return (
            <TouchableOpacity 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden flex-row"
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: imageUrl }} 
                className="w-24 h-full bg-gray-200"
                resizeMode="cover"
              />
              <View className="flex-1 p-3">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-xs text-gray-500 font-medium">{item.event?.category}</Text>
                  {getStatusBadge(item.status)}
                </View>
                <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
                  {item.event?.title}
                </Text>
                <Text className="text-xs text-gray-600 mb-3">
                  {item.event?.location?.city}
                </Text>

                {/* Geri Çek Butonu sadece bekleyen veya onaylananlar için */}
                {(item.status === 'pending' || item.status === 'accepted') && (
                  <TouchableOpacity 
                    className="flex-row items-center justify-center bg-red-50 border border-red-100 py-2 rounded-xl mt-auto"
                    onPress={() => handleWithdraw(item._id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#b91c1c" />
                    <Text className="text-red-700 text-xs font-bold ml-1">İptal Et</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-gray-500">Henüz hiçbir etkinliğe başvurmadınız.</Text>
          </View>
        }
      />
    </View>
  );
}
