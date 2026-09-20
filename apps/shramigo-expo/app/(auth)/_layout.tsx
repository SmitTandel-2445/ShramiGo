import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="admin/login" />
      <Stack.Screen name="customer/login" />
      <Stack.Screen name="customer/register" />
      <Stack.Screen name="worker/login" />
      <Stack.Screen name="worker/register" />
    </Stack>
  );
}
