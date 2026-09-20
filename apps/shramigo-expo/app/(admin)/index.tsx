import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logout } from '@/features/auth/services';
import { getAdminStats, type AdminStats } from '@/features/admin/services';

const ADMIN_PRIMARY = '#4F46E5';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bg = isDark ? '#0D0D0D' : '#F8FAFF';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const handleLogout = () => {
    Alert.alert('Admin Sign Out', 'Are you sure you want to sign out of the Admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/welcome');
        },
      },
    ]);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={{ backgroundColor: ADMIN_PRIMARY }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadStats(); }}
            tintColor={ADMIN_PRIMARY}
          />
        }
      >
        {/* Header Hero */}
        <View style={styles.header}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />

          <View style={styles.headerContent}>
            <View>
              <View style={styles.headerTag}>
                <Text style={styles.headerTagText}>PLATFORM CONTROL</Text>
              </View>
              <Text style={styles.headerTitle}>ShramiGo Admin</Text>
              <Text style={styles.headerDesc}>Cooperative Management Hub</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.themeToggleBtn}
                onPress={toggleTheme}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isDark ? 'sunny' : 'moon'}
                  size={18}
                  color={isDark ? '#F59E0B' : ADMIN_PRIMARY}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={ADMIN_PRIMARY} size="large" />
            <Text style={[styles.loadingText, { color: subTextColor }]}>Loading platform statistics...</Text>
          </View>
        ) : (
          <>
            {/* 6 Metric Stats Grid */}
            <View style={styles.statsGrid}>
              {[
                { label: 'Total Users', value: stats?.total_users ?? 0, icon: 'people', color: ADMIN_PRIMARY, bg: '#EEF2FF' },
                { label: 'Total Workers', value: stats?.total_workers ?? 0, icon: 'hammer', color: '#0891B2', bg: '#ECFEFF' },
                { label: 'Total Bookings', value: stats?.total_bookings ?? 0, icon: 'calendar', color: '#D97706', bg: '#FEF3C7' },
                { label: 'Completed', value: stats?.completed_bookings ?? 0, icon: 'checkmark-circle', color: '#16A34A', bg: '#DCFCE7' },
                { label: 'Pending Action', value: stats?.pending_bookings ?? 0, icon: 'time', color: '#DC2626', bg: '#FEE2E2' },
                { label: 'Active Customers', value: stats?.total_customers ?? 0, icon: 'person', color: '#7C3AED', bg: '#EDE9FE' },
              ].map((s, i) => (
                <View
                  key={i}
                  style={[styles.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                >
                  <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon as any} size={20} color={s.color} />
                  </View>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {s.value.toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Financial Overview Card */}
            <View style={[styles.revenueCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.revenueHeader}>
                <Ionicons name="wallet-outline" size={18} color={ADMIN_PRIMARY} />
                <Text style={[styles.revenueTitle, { color: textColor }]}>Platform Financials</Text>
              </View>

              <View style={styles.revenueRow}>
                <View style={styles.revenueItem}>
                  <Text style={[styles.revenueLabel, { color: subTextColor }]}>Gross Booking Value</Text>
                  <Text style={[styles.revenueValue, { color: textColor }]}>
                    ₹{(stats?.gross_booking_value ?? 0).toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.revenueDivider, { backgroundColor: cardBorder }]} />

                <View style={styles.revenueItem}>
                  <Text style={[styles.revenueLabel, { color: subTextColor }]}>Worker Payouts</Text>
                  <Text style={[styles.revenueValue, { color: '#D97706' }]}>
                    ₹{(stats?.worker_payouts ?? 0).toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.revenueDivider, { backgroundColor: cardBorder }]} />

                <View style={styles.revenueItem}>
                  <Text style={[styles.revenueLabel, { color: subTextColor }]}>Net Revenue</Text>
                  <Text style={[styles.revenueValue, { color: '#16A34A' }]}>
                    ₹{(stats?.platform_revenue ?? 0).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Navigation Actions */}
            <View style={styles.quickNavSection}>
              <Text style={[styles.quickNavTitle, { color: textColor }]}>Management Modules</Text>
              <View style={styles.quickNavGrid}>
                {[
                  { icon: 'calendar', label: 'All Bookings', desc: 'Inspect & manage jobs', route: '/(admin)/bookings', color: '#D97706', bg: '#FEF3C7' },
                  { icon: 'people', label: 'User Directory', desc: 'Suspend or activate accounts', route: '/(admin)/users', color: ADMIN_PRIMARY, bg: '#EEF2FF' },
                  { icon: 'hammer', label: 'Worker Verification', desc: 'KYC & trust badges', route: '/(admin)/workers', color: '#0891B2', bg: '#ECFEFF' },
                  { icon: 'bar-chart', label: 'Analytics Reports', desc: 'Financial & cohort data', route: '/(admin)/reports', color: '#7C3AED', bg: '#EDE9FE' },
                ].map((nav, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.quickNavItem, { backgroundColor: cardBg, borderColor: cardBorder }]}
                    onPress={() => router.push(nav.route as any)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickNavIcon, { backgroundColor: nav.bg }]}>
                      <Ionicons name={nav.icon as any} size={22} color={nav.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.quickNavLabel, { color: textColor }]}>{nav.label}</Text>
                      <Text style={[styles.quickNavDesc, { color: subTextColor }]}>{nav.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={subTextColor} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    backgroundColor: ADMIN_PRIMARY,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    marginBottom: 18,
  },
  headerCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  headerTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF' },
  headerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  themeToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderWrap: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600' },
  revenueCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  revenueTitle: { fontSize: 15, fontWeight: '800' },
  revenueRow: { flexDirection: 'row', alignItems: 'center' },
  revenueItem: { flex: 1, alignItems: 'center', gap: 3 },
  revenueLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  revenueValue: { fontSize: 14, fontWeight: '900', textAlign: 'center' },
  revenueDivider: { width: 1, height: 28 },
  quickNavSection: { paddingHorizontal: 20, paddingBottom: 30 },
  quickNavTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  quickNavGrid: { gap: 10 },
  quickNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  quickNavIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavLabel: { fontSize: 14, fontWeight: '800' },
  quickNavDesc: { fontSize: 11, marginTop: 2 },
});
