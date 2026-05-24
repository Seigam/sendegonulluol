import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  className?: string;
}

export function Button({ title, variant = 'primary', isLoading = false, className, ...props }: ButtonProps) {
  let bgClass = 'bg-teal-600';
  let textClass = 'text-white';

  switch (variant) {
    case 'secondary':
      bgClass = 'bg-teal-100';
      textClass = 'text-teal-700';
      break;
    case 'outline':
      bgClass = 'bg-transparent border-2 border-teal-600';
      textClass = 'text-teal-600';
      break;
    case 'danger':
      bgClass = 'bg-red-600';
      textClass = 'text-white';
      break;
  }

  return (
    <TouchableOpacity
      className={`py-3.5 px-4 rounded-xl flex-row justify-center items-center ${bgClass} ${
        props.disabled || isLoading ? 'opacity-60' : 'opacity-100'
      } ${className || ''}`}
      activeOpacity={0.8}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? '#0d9488' : '#ffffff'} />
      ) : (
        <Text className={`font-semibold text-center text-base ${textClass}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
