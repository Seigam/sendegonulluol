import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { createEvent, uploadImage } from '../services/eventService';

const CATEGORIES = ['Çevre', 'Eğitim', 'Sağlık', 'Hayvan Hakları', 'Afet Yardımı', 'Kültür & Sanat'];

export function CreateEventScreen({ navigation }: any) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Çevre',
    city: '',
    address: '',
    startDate: '',
    endDate: '',
    quota: '',
    coverImage: '', // Now this will hold the local URI of the image before upload
  });
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setForm({ ...form, coverImage: result.assets[0].uri });
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.city || !form.startDate || !form.quota) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = undefined;
      if (form.coverImage) {
        // Form.coverImage is currently the local URI from ImagePicker
        // We need to upload it first
        const filename = form.coverImage.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        imageUrl = await uploadImage(form.coverImage, filename, type);
      }

      await createEvent({
        title: form.title,
        description: form.description,
        category: form.category,
        location: { city: form.city, address: form.address || form.city },
        date: { start: form.startDate, end: form.endDate || form.startDate },
        quota: parseInt(form.quota, 10),
        coverImage: imageUrl,
      });
      Alert.alert('Başarılı', 'Etkinlik oluşturuldu. Yönetici onayından sonra listelenecektir.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Etkinlik oluşturulurken bir hata oluştu.';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-12 pb-4 bg-teal-800 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Yeni Etkinlik</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-gray-500 mb-4 text-sm">Etkinlik bilgilerinizi girin. Onaylandıktan sonra herkes görebilecektir.</Text>
        
        <View className="space-y-4">
          <Input 
            label="Etkinlik Başlığı *" 
            placeholder="Örn: Kıyı Temizliği Hareketi"
            value={form.title}
            onChangeText={(t) => setForm({...form, title: t})}
          />
          
          <View>
            <Text className="text-gray-700 font-semibold mb-2">Kategori *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat}
                  onPress={() => setForm({...form, category: cat})}
                  className={`mr-2 px-4 py-2 rounded-xl border ${form.category === cat ? 'bg-teal-100 border-teal-500' : 'bg-gray-50 border-gray-200'}`}
                >
                  <Text className={form.category === cat ? 'text-teal-700 font-bold' : 'text-gray-600'}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Input 
            label="Açıklama *" 
            placeholder="Etkinlik hakkında detaylı bilgi verin..."
            value={form.description}
            onChangeText={(t) => setForm({...form, description: t})}
          />

          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Input 
                label="Şehir *" 
                placeholder="Örn: İzmir"
                value={form.city}
                onChangeText={(t) => setForm({...form, city: t})}
              />
            </View>
            <View className="flex-1">
              <Input 
                label="Kontenjan *" 
                placeholder="Örn: 50"
                keyboardType="numeric"
                value={form.quota}
                onChangeText={(t) => setForm({...form, quota: t})}
              />
            </View>
          </View>

          <Input 
            label="Açık Adres" 
            placeholder="Etkinliğin tam konumu..."
            value={form.address}
            onChangeText={(t) => setForm({...form, address: t})}
          />

          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Input 
                label="Başlangıç Tarihi *" 
                placeholder="YYYY-AA-GG"
                value={form.startDate}
                onChangeText={(t) => setForm({...form, startDate: t})}
              />
            </View>
            <View className="flex-1">
              <Input 
                label="Bitiş Tarihi" 
                placeholder="YYYY-AA-GG (Opsiyonel)"
                value={form.endDate}
                onChangeText={(t) => setForm({...form, endDate: t})}
              />
            </View>
          </View>

          <View>
            <Text className="text-gray-700 font-semibold mb-2">Kapak Görseli</Text>
            {form.coverImage ? (
              <View className="relative">
                <Image 
                  source={{ uri: form.coverImage }} 
                  className="w-full h-40 rounded-xl bg-gray-100" 
                  resizeMode="cover" 
                />
                <TouchableOpacity 
                  onPress={() => setForm({ ...form, coverImage: '' })}
                  className="absolute top-2 right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center shadow-sm"
                >
                  <Ionicons name="trash" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={pickImage}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50 flex-col"
              >
                <Ionicons name="image-outline" size={32} color="#9ca3af" />
                <Text className="text-gray-500 mt-2 font-medium">Galeriden Görsel Seç</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button 
            title="Etkinliği Oluştur" 
            onPress={handleCreate} 
            isLoading={loading}
            className="mt-4 mb-10"
          />
        </View>
      </ScrollView>
    </View>
  );
}
