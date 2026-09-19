import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logout } from '@/features/auth/services';
import { getAdminStats, type AdminStats } from '@/features/admin/services';

const ADMIN_COLOR = '#4F46E5';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try { const data = await getAdminStats(); setStats(data); } catch { }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadStats(); }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Sign out of the admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/welcome'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStats(); }} tintColor={ADMIN_COLOR} />}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBg} />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerSub}>ADMIN PANEL</Text>
              <Text style={styles.headerTitle}>ShramiGo</Text>
              <Text style={styles.headerDesc}>Platform Overview</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={ADMIN_COLOR} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? <ActivityIndicator color={ADMIN_COLOR} style={{ marginTop: 40 }} size="large" /> : (
          <>
            {/* Stats */}
            <View style={styles.statsGrid}>
              {[
                { label: 'Total Users', value: stats?.total_users ?? 0, icon: 'people', color: ADMIN_COLOR, bg: '#EEF2FF' },
                { label: 'Total Workers', value: stats?.total_workers ?? 0, icon: 'hammer', color: '#0891B2', bg: '#ECFEFF' },
                { label: 'Total Bookings', value: stats?.total_bookings ?? 0, icon: 'calendar', color: '#D97706', bg: '#FEF3C7' },
                { label: 'Completed', value: stats?.completed_bookings ?? 0, icon: 'checkmark-circle', color: '#16A34A', bg: '#DCFCE7' },
                { label: 'Pending', value: stats?.pending_bookings ?? 0, icon: 'time', color: '#DC2626', bg: '#FEE2E2' },
                { label: 'Customers', value: stats?.total_customers ?? 0, icon: 'person', color: '#7C3AED', bg: '#EDE9FE' },
              ].map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon as any} size={22} color={s.color} />
                  </View>
                  <Text style={styles.statValue}>{s.value.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Revenue */}
            <View style={styles.revenueCard}>
              <Text style={styles.revenueTitle}>💰 Platform Revenue</Text>
              <View style={styles.revenueRow}>
                <View style={styles.revenueItem}>
                  <Text style={styles.revenueLabel}>Gross Booking Value</Text>
                  <Text style={styles.revenueValue}>₹{(stats?.gross_booking_value ?? 0).toLocaleString()}</Text>
                </View>
                <View style={styles.revenueDivider} />
                <View style={styles.revenueItem}>
                  <Text style={styles.revenueLabel}>Worker Payouts</Text>
                  <Text style={[styles.revenueValue, { color: '#D97706' }]}>₹{(stats?.worker_payouts ?? 0).toLocaleString()}</Text>
                </View>
                <View style={styles.revenueDivider} />
                <View style={styles.revenueItem}>
                  <Text style={styles.revenueLabel}>Platform Revenue</Text>
                  <Text style={[styles.revenueValue, { color: '#16A34A' }]}>₹{(stats?.platform_revenue ?? 0).toLocaleString()}</Text>
                </View>
              </View>
            </View>

            {/* Quick Nav */}
            <View style={styles.quickNav}>
              <Text style={styles.quickNavTitle}>Quick Actions</Text>
              <View style={styles.quickNavGrid}>
                {[
                  { icon: 'calendar', label: 'Bookings', route: '/(admin)/bookings', color: '#D97706', bg: '#FEF3C7' },
                  { icon: 'people', label: 'Users', route: '/(admin)/users', color: ADMIN_COLOR, bg: '#EEF2FF' },
                  { icon: 'hammer', label: 'Workers', route: '/(admin)/workers', color: '#0891B2', bg: '#ECFEFF' },
                  { icon: 'bar-chart', label: 'Reports', route: '/(admin)/reports', color: '#7C3AED', bg: '#EDE9FE' },
                ].map((nav, i) => (
                  <TouchableOpacity key={i} style={styles.quickNavItem} onPress={() => router.push(nav.route as any)} activeOpacity={0.8}>
                    <View style={[styles.quickNavIcon, { backgroundColor: nav.bg }]}>
                      <Ionicons name={nav.icon as any} size={24} color={nav.color} />
                    </View>
                    <Text style={styles.quickNavLabel}>{nav.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { backgroundColor: ADMIN_COLOR, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden', marginBottom: 20 },
  headerBg: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)' },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  headerSub: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2, marginBottom: 4 },
  headerTitle: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  headerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  logoutBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  statCard: { width: '30%', flexGrow: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6B7280', lineHeight: 15 },
  revenueCard: { marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  revenueTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },
  revenueRow: { flexDirection: 'row' },
  revenueItem: { flex: 1, alignItems: 'center' },
  revenueLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 4, textAlign: 'center' },
  revenueValue: { fontSize: 15, fontWeight: '800', color: '#111827', textAlign: 'center' },
  revenueDivider: { width: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  quickNav: { paddingHorizontal: 20, paddingBottom: 20 },
  quickNavTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 12 },
  quickNavGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickNavItem: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  quickNavIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickNavLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
});
