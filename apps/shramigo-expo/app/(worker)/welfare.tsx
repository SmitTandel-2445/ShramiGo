import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WorkerWelfareScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons name="heart-outline" size={56} color="#D1D5DB" />
        <Text style={styles.title}>Welfare Programs</Text>
        <Text style={styles.desc}>Access insurance, healthcare, and cooperative benefits.</Text>
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
