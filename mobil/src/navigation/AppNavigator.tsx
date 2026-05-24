import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ApplicationsScreen } from '../screens/ApplicationsScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { AdminPanelScreen } from '../screens/AdminPanelScreen';
import { OrganizerPanelScreen } from '../screens/OrganizerPanelScreen';
import { CreateEventScreen } from '../screens/CreateEventScreen';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60, paddingTop: 5 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

          if (route.name === 'Keşfet') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Başvurularım') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profilim') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Keşfet" component={HomeScreen} />
      <Tab.Screen name="Başvurularım" component={ApplicationsScreen} />
      <Tab.Screen name="Profilim" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="EventDetail" 
              component={EventDetailScreen} 
              options={{ headerShown: false, presentation: 'modal' }} 
            />
            <Stack.Screen 
              name="AdminPanel" 
              component={AdminPanelScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="OrganizerPanel" 
              component={OrganizerPanelScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="CreateEvent" 
              component={CreateEventScreen} 
              options={{ headerShown: false, presentation: 'modal' }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
