import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/appConstants';

export default function CustomerNotificationsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons name="notifications-outline" size={56} color="#D1D5DB" />
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.desc}>Booking and service updates will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8F8' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  desc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
