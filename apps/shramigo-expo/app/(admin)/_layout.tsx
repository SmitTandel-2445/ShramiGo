import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const ADMIN_COLOR = '#4F46E5';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ADMIN_COLOR,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tabs.Screen name="users" options={{ title: 'Users', tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="workers" options={{ title: 'Workers', tabBarIcon: ({ color, size }) => <Ionicons name="hammer" size={size} color={color} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} /> }} />
    </Tabs>
  );
}
