import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventCard } from '../components/EventCard';
import { getEvents, Event } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Tümü', 'Çevre', 'Eğitim', 'Sağlık', 'Hayvan Hakları', 'Afet Yardımı', 'Kültür & Sanat'];

export function HomeScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const { currentUser } = useAuth();

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEvents(search, selectedCategory);
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
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
      <View className="px-4 pt-12 pb-4 bg-teal-600 shadow-sm rounded-b-3xl z-10">
        <Text className="text-3xl font-extrabold text-white mb-4 tracking-tight">Keşfet</Text>
        
        {/* Search Bar */}
        <View className="bg-white/20 flex-row items-center rounded-2xl px-4 py-2 mb-4">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            className="flex-1 ml-2 text-white font-medium"
            placeholder="Etkinlik veya kelime ara..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadEvents}
            returnKeyType="search"
          />
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="-mx-4 px-4"
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`mr-3 px-5 py-2 rounded-full border ${
                selectedCategory === category 
                  ? 'bg-white border-white' 
                  : 'bg-transparent border-white/40'
              }`}
            >
              <Text className={`font-bold ${
                selectedCategory === category ? 'text-teal-700' : 'text-white'
              }`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
        }
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={() => navigation.navigate('EventDetail', { eventId: item._id })} 
          />
        )}
        ListEmptyComponent={
          <View className="py-20 items-center">
            <Ionicons name="search-outline" size={60} color="#cbd5e1" />
            <Text className="text-gray-500 font-medium text-base mt-4">
              Aramanıza uygun etkinlik bulunamadı.
            </Text>
          </View>
        }
      />
    </View>
  );
}
