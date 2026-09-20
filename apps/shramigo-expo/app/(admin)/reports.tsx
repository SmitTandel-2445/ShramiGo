import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdminStats, getAdminBookings, type AdminStats } from '@/features/admin/services';

const ADMIN_PRIMARY = '#4F46E5';

export default function AdminReportsScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentBookings, setRecentBookings] = useState<{ date: string; count: number; revenue: number }[]>([]);

  const bg = isDark ? '#0D0D0D' : '#F8FAFF';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const barBg = isDark ? '#262626' : '#F3F4F6';

  const loadData = async () => {
    try {
      const [s, bookings] = await Promise.all([
        getAdminStats(),
        getAdminBookings(0, 100),
      ]);
      setStats(s);

      // Group bookings by date
      const grouped: Record<string, { count: number; revenue: number }> = {};
      bookings.forEach(b => {
        const d = b.booking_date;
        if (!grouped[d]) grouped[d] = { count: 0, revenue: 0 };
        grouped[d].count++;
        grouped[d].revenue += b.total_amount;
      });
      const sorted = Object.entries(grouped)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 10)
        .map(([date, data]) => ({ date, ...data }));
      setRecentBookings(sorted);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor={ADMIN_PRIMARY}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Analytics & Reports</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>Platform financials & growth</Text>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={ADMIN_PRIMARY} size="large" />
            <Text style={[styles.loadingText, { color: subTextColor }]}>Aggregating report data...</Text>
          </View>
        ) : (
          <>
            {/* Financial KPI Cards */}
            <View style={styles.kpiGrid}>
              {[
                { label: 'Gross Booking Value', value: `₹${(stats?.gross_booking_value ?? 0).toLocaleString()}`, icon: 'trending-up', color: '#16A34A', bg: '#DCFCE7' },
                { label: 'Platform Net Margin', value: `₹${(stats?.platform_revenue ?? 0).toLocaleString()}`, icon: 'diamond', color: ADMIN_PRIMARY, bg: '#EEF2FF' },
                { label: 'Worker Payouts', value: `₹${(stats?.worker_payouts ?? 0).toLocaleString()}`, icon: 'wallet', color: '#D97706', bg: '#FEF3C7' },
                { label: 'Total Volume', value: `${stats?.total_bookings ?? 0} Orders`, icon: 'calendar', color: '#0891B2', bg: '#ECFEFF' },
              ].map((kpi, i) => (
                <View
                  key={i}
                  style={[
                    styles.kpiCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderLeftColor: kpi.color,
                    },
                  ]}
                >
                  <View style={[styles.kpiIcon, { backgroundColor: kpi.bg }]}>
                    <Ionicons name={kpi.icon as any} size={20} color={kpi.color} />
                  </View>
                  <Text style={[styles.kpiLabel, { color: subTextColor }]}>{kpi.label}</Text>
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                </View>
              ))}
            </View>

            {/* Booking Status Distribution */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Booking Status Distribution</Text>
              <View style={[styles.breakdownCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                {[
                  { label: 'Completed Deliveries', value: stats?.completed_bookings ?? 0, color: '#16A34A', total: stats?.total_bookings ?? 1 },
                  { label: 'Pending Dispatch', value: stats?.pending_bookings ?? 0, color: '#D97706', total: stats?.total_bookings ?? 1 },
                  { label: 'Cancelled Orders', value: Math.max(0, (stats?.total_bookings ?? 0) - (stats?.completed_bookings ?? 0) - (stats?.pending_bookings ?? 0)), color: '#DC2626', total: stats?.total_bookings ?? 1 },
                ].map((item, i) => {
                  const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
                  return (
                    <View key={i} style={styles.breakdownRow}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={[styles.breakdownLabel, { color: textColor }]}>{item.label}</Text>
                        <Text style={[styles.breakdownValue, { color: item.color }]}>
                          {item.value} ({pct.toFixed(0)}%)
                        </Text>
                      </View>
                      <View style={[styles.progressBar, { backgroundColor: barBg }]}>
                        <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: item.color }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Platform Cohort Ratio */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Community Directory Ratio</Text>
              <View style={styles.userBreakdown}>
                {[
                  { label: 'Total Users', value: stats?.total_users ?? 0, icon: 'people', color: ADMIN_PRIMARY, bg: '#EEF2FF' },
                  { label: 'Customers', value: stats?.total_customers ?? 0, icon: 'person', color: '#FF5A00', bg: '#FFF1E8' },
                  { label: 'Workers', value: stats?.total_workers ?? 0, icon: 'hammer', color: '#087F7A', bg: '#E6F7F5' },
                ].map((u, i) => (
                  <View
                    key={i}
                    style={[styles.userCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                  >
                    <View style={[styles.userIcon, { backgroundColor: u.bg }]}>
                      <Ionicons name={u.icon as any} size={20} color={u.color} />
                    </View>
                    <Text style={[styles.userValue, { color: textColor }]}>
                      {u.value.toLocaleString()}
                    </Text>
                    <Text style={[styles.userLabel, { color: subTextColor }]}>{u.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Daily Ledger */}
            <View style={[styles.section, { paddingBottom: 30 }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Daily Booking Revenue Ledger</Text>
              {recentBookings.length === 0 ? (
                <View style={[styles.noData, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                  <Text style={[styles.noDataText, { color: subTextColor }]}>No recent ledger activity recorded</Text>
                </View>
              ) : (
                recentBookings.map((row, i) => (
                  <View
                    key={i}
                    style={[styles.dateRow, { backgroundColor: cardBg, borderColor: cardBorder }]}
                  >
                    <View style={{ gap: 2 }}>
                      <Text style={[styles.dateText, { color: textColor }]}>{row.date}</Text>
                      <Text style={[styles.dateCount, { color: subTextColor }]}>{row.count} completed bookings</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.dateRevenue}>+₹{row.revenue.toLocaleString()}</Text>
                      <Text style={[styles.dateStatus, { color: '#16A34A' }]}>Settled</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 13, marginTop: 2 },
  loaderWrap: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: '600' },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: { fontSize: 11, fontWeight: '600' },
  kpiValue: { fontSize: 18, fontWeight: '900' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  breakdownCard: {
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  breakdownRow: { gap: 4 },
  breakdownLabel: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  breakdownValue: { fontSize: 12, fontWeight: '800' },
  userBreakdown: { flexDirection: 'row', gap: 10 },
  userCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userValue: { fontSize: 18, fontWeight: '900' },
  userLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  dateText: { fontSize: 14, fontWeight: '700' },
  dateCount: { fontSize: 11 },
  dateRevenue: { fontSize: 15, fontWeight: '900', color: ADMIN_PRIMARY },
  dateStatus: { fontSize: 10, fontWeight: '800' },
  noData: { padding: 24, alignItems: 'center', borderRadius: 16, borderWidth: 1 },
  noDataText: { fontSize: 13 },
});
