import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../services/eventService';
import { BASE_URL } from '../services/api';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  // Varsayılan görsel kullanımı
  const defaultImage = 'https://images.unsplash.com/photo-1555421689-491a97ff2040?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';
  
  let imageUrl = defaultImage;
  if (event.coverImage) {
    // Eğer backend'den `/uploads/...` gibi relative bir path geliyorsa başına BASE_URL ekle
    imageUrl = event.coverImage.startsWith('/') 
      ? `${BASE_URL}${event.coverImage}` 
      : event.coverImage;
  }

  // Tarih formatlama
  const dateStr = new Date(event.date.start).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <TouchableOpacity 
      className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 mb-5 overflow-hidden"
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Resim Alanı */}
      <View className="relative">
        <Image 
          source={{ uri: imageUrl }} 
          className="w-full h-48 bg-gray-200"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/10" />
        
        {/* Etiket */}
        <View className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
          <Text className="text-teal-700 font-bold text-xs tracking-wide">{event.category}</Text>
        </View>
      </View>

      {/* İçerik */}
      <View className="p-5">
        <View className="flex-row items-center mb-3">
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider ml-1">
            {dateStr}
          </Text>
          <Text className="text-slate-300 mx-2">•</Text>
          <Ionicons name="location-outline" size={14} color="#64748b" />
          <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider ml-1">
            {event.location.city}
          </Text>
        </View>
        
        <Text className="text-xl font-extrabold text-slate-800 mb-2 leading-tight line-clamp-2">
          {event.title}
        </Text>
        
        <Text className="text-slate-500 text-sm mb-5 leading-relaxed" numberOfLines={2}>
          {event.description}
        </Text>

        <View className="flex-row items-center justify-between border-t border-slate-100 pt-4">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-teal-50 items-center justify-center mr-2">
              <Ionicons name="people" size={14} color="#0d9488" />
            </View>
            <Text className="text-xs text-slate-500">
              <Text className="font-bold text-slate-800">{event.appliedCount}</Text> / {event.quota}
            </Text>
          </View>
          
          <View className="flex-row items-center bg-teal-50 px-4 py-2 rounded-full">
            <Text className="text-teal-700 font-bold text-sm mr-1">İncele</Text>
            <Ionicons name="arrow-forward" size={14} color="#0f766e" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
