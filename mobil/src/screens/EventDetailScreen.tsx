import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEventById, Event } from '../services/eventService';
import { applyForEvent, getMyApplications, withdrawApplication, Application } from '../services/applicationService';
import { BASE_URL } from '../services/api';

export function EventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [eventData, appsData] = await Promise.all([
        getEventById(eventId),
        getMyApplications()
      ]);
      setEvent(eventData);
      
      const existingApp = appsData.find(app => app.event._id === eventId);
      setMyApplication(existingApp || null);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Etkinlik detayları alınamadı.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [eventId, navigation]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleApply = async () => {
    if (myApplication) {
      // Zaten başvurduysa uyarı ver
      Alert.alert('Bilgi', 'Bu etkinliğe zaten başvurdunuz.');
      return;
    }

    try {
      setApplying(true);
      await applyForEvent(eventId);
      Alert.alert('Başarılı', 'Etkinliğe başarıyla başvurdunuz!', [
        { text: 'Tamam', onPress: () => fetchDetails() }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Başvuru sırasında bir hata oluştu.';
      Alert.alert('Hata', message);
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!myApplication) return;
    
    Alert.alert(
      'Başvuruyu İptal Et',
      'Bu etkinliğe yaptığınız başvuruyu geri çekmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'İptal Et', 
          style: 'destructive',
          onPress: async () => {
            try {
              setApplying(true);
              await withdrawApplication(myApplication._id);
              Alert.alert('Başarılı', 'Başvurunuz geri çekildi.');
              fetchDetails();
            } catch (error) {
              Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
            } finally {
              setApplying(false);
            }
          }
        }
      ]
    );
  };

  if (loading || !event) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // Import required for BASE_URL: we'll add the import at the top of the file as well
  const imageUrl = event.coverImage
    ? event.coverImage.startsWith('/') ? `${BASE_URL}${event.coverImage}` : event.coverImage
    : 'https://via.placeholder.com/600x400?text=Görsel+Yok';

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" bounces={false} showsVerticalScrollIndicator={false}>
        {/* Kapak Görseli ve Geri Butonu */}
        <View className="relative h-64">
          <Image 
            source={{ uri: imageUrl }} 
            className="w-full h-full bg-gray-200"
            resizeMode="cover"
          />
          <TouchableOpacity 
            className="absolute top-12 left-4 w-10 h-10 bg-black/30 rounded-full items-center justify-center backdrop-blur-md"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* İçerik */}
        <View className="px-5 pt-6 pb-24 bg-white -mt-6 rounded-t-3xl shadow-lg">
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-teal-100 px-3 py-1 rounded-full">
              <Text className="text-teal-700 font-bold text-xs">{event.category}</Text>
            </View>
            <Text className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Kapasite: {event.appliedCount} / {event.quota}
            </Text>
          </View>

          <Text className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
            {event.title}
          </Text>

          <Text className="text-base text-gray-600 mb-6 leading-relaxed">
            {event.description}
          </Text>

          <View className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100 space-y-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="calendar" size={20} color="#0d9488" />
              </View>
              <View>
                <Text className="text-xs text-gray-500 uppercase font-medium">Tarih</Text>
                <Text className="text-sm font-bold text-gray-900">
                  {new Date(event.date.start).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="location" size={20} color="#ea580c" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase font-medium">Konum</Text>
                <Text className="text-sm font-bold text-gray-900">{event.location.city}</Text>
                <Text className="text-xs text-gray-500">{event.location.address}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#4f46e5" />
              </View>
              <View>
                <Text className="text-xs text-gray-500 uppercase font-medium">Organizatör</Text>
                <Text className="text-sm font-bold text-gray-900">
                  {event.organizer.name} {event.organizer.surname}
                </Text>
                {event.organizer.organizationName && (
                  <Text className="text-xs text-indigo-600 font-medium">{event.organizer.organizationName}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sabit Başvur Butonu */}
      <View className="absolute bottom-0 w-full bg-white px-5 py-4 border-t border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
        {myApplication ? (
          <TouchableOpacity 
            className="py-4 rounded-2xl flex-row justify-center items-center bg-red-100 border border-red-200"
            disabled={applying}
            onPress={handleWithdraw}
            activeOpacity={0.8}
          >
            {applying ? (
              <ActivityIndicator color="#b91c1c" />
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color="#b91c1c" className="mr-2" />
                <Text className="text-red-700 font-bold text-lg ml-2">
                  Başvuruyu İptal Et
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className={`py-4 rounded-2xl flex-row justify-center items-center ${
              applying || event.appliedCount >= event.quota ? 'bg-gray-400' : 'bg-teal-600'
            }`}
            disabled={applying || event.appliedCount >= event.quota}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            {applying ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold text-lg mr-2">
                  {event.appliedCount >= event.quota ? 'Kontenjan Dolu' : 'Hemen Başvur'}
                </Text>
                {event.appliedCount < event.quota && <Ionicons name="arrow-forward" size={20} color="white" />}
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
