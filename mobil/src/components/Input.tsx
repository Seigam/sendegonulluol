import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from 'react-native';
// Expo vektör ikonlarını kullanacağız (Ionicons vb.) eklendiğini varsayıyoruz, projenin ilerleyen adımlarında kuracağız veya react-native-vector-icons
// import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword, className, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`mb-4 ${className || ''}`}>
      {label && <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>}
      
      <View 
        className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-3 ${
          error ? 'border-red-500' : isFocused ? 'border-teal-500' : 'border-gray-300'
        }`}
      >
        <TextInput
          className="flex-1 text-gray-900 text-base"
          placeholderTextColor="#9ca3af"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
            <Text className="text-teal-600 text-xs font-semibold">
              {showPassword ? 'Gizle' : 'Göster'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
