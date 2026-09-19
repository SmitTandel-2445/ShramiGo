import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

function RootLayoutInner() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(customer)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(worker)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(admin)" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <RootLayoutInner />
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
