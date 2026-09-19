import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/components/BrandLogo';
import { COLORS } from '@/lib/appConstants';

type Role = 'customer' | 'worker';

const CUSTOMER_BENEFITS = [
  { icon: 'search-outline', text: 'Find skilled professionals nearby' },
  { icon: 'calendar-outline', text: 'Book services at any time' },
  { icon: 'shield-checkmark-outline', text: 'Verified and trusted workers' },
  { icon: 'card-outline', text: 'Easy and secure payments' },
];

const WORKER_BENEFITS = [
  { icon: 'briefcase-outline', text: 'Get steady job opportunities' },
  { icon: 'wallet-outline', text: 'Track earnings and payouts' },
  { icon: 'time-outline', text: 'Manage your own schedule' },
  { icon: 'star-outline', text: 'Build your reputation' },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>('customer');

  const handleContinue = () => {
    if (selectedRole === 'customer') router.push('/(auth)/customer/login');
    else router.push('/(auth)/worker/login');
  };

  const benefits = selectedRole === 'customer' ? CUSTOMER_BENEFITS : WORKER_BENEFITS;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerBrand}>
            <BrandLogo size="sm" />
            <View>
              <Text style={styles.headerBrandSub}>Welcome to</Text>
              <Text style={styles.headerBrandName}>ShramiGo</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>How would you like{'\n'}to use ShramiGo?</Text>
          <Text style={styles.subtitle}>Select your role to get started with the right experience.</Text>

          {/* Role Cards */}
          <View style={styles.rolesContainer}>
            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'customer' && styles.roleCardSelected, { borderColor: selectedRole === 'customer' ? COLORS.accent : '#E5E7EB' }]}
              onPress={() => setSelectedRole('customer')}
              activeOpacity={0.8}
            >
              <View style={styles.roleCardTop}>
                <View style={[styles.roleIconBg, { backgroundColor: selectedRole === 'customer' ? '#FFF1E8' : '#F9FAFB' }]}>
                  <Ionicons name="search" size={26} color={selectedRole === 'customer' ? COLORS.accent : '#9CA3AF'} />
                </View>
                {selectedRole === 'customer' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
                  </View>
                )}
              </View>
              <Text style={[styles.roleTitle, { color: selectedRole === 'customer' ? '#111827' : '#374151' }]}>I'm a Customer</Text>
              <Text style={styles.roleDesc}>I need to find and book home services</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'worker' && styles.roleCardSelected, { borderColor: selectedRole === 'worker' ? COLORS.primary : '#E5E7EB' }]}
              onPress={() => setSelectedRole('worker')}
              activeOpacity={0.8}
            >
              <View style={styles.roleCardTop}>
                <View style={[styles.roleIconBg, { backgroundColor: selectedRole === 'worker' ? COLORS.primaryLight : '#F9FAFB' }]}>
                  <Ionicons name="hammer" size={26} color={selectedRole === 'worker' ? COLORS.primary : '#9CA3AF'} />
                </View>
                {selectedRole === 'worker' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                  </View>
                )}
              </View>
              <Text style={[styles.roleTitle, { color: selectedRole === 'worker' ? '#111827' : '#374151' }]}>I'm a Worker</Text>
              <Text style={styles.roleDesc}>I offer my skills and want to find work</Text>
            </TouchableOpacity>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>
              {selectedRole === 'customer' ? 'As a Customer, you can:' : 'As a Worker, you can:'}
            </Text>
            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Ionicons name={b.icon as any} size={18} color={selectedRole === 'customer' ? COLORS.accent : COLORS.primary} />
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cta}>
          <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: selectedRole === 'customer' ? COLORS.accent : COLORS.primary }]} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Continue as {selectedRole === 'customer' ? 'Customer' : 'Worker'}</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/admin/login')} style={styles.adminLink}>
            <Text style={styles.adminLinkText}>Admin Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flexGrow: 1, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBrandSub: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  headerBrandName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', lineHeight: 34, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 24 },
  rolesContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleCard: { flex: 1, borderRadius: 20, borderWidth: 2, padding: 16, backgroundColor: COLORS.white },
  roleCardSelected: { backgroundColor: '#FAFAFA' },
  roleCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  roleIconBg: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  selectedBadge: {},
  roleTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  roleDesc: { fontSize: 12, color: '#9CA3AF', lineHeight: 17 },
  benefitsCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, gap: 10 },
  benefitsTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 4 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitText: { fontSize: 13, color: '#4B5563', flex: 1 },
  cta: { paddingHorizontal: 20, paddingTop: 24 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 18, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  ctaText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  adminLink: { alignItems: 'center', paddingTop: 16 },
  adminLinkText: { fontSize: 13, color: '#9CA3AF' },
});
