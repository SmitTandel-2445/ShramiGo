import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAdminStats, getAdminBookings, type AdminStats } from '@/features/admin/services';

const ADMIN_COLOR = '#4F46E5';

export default function AdminReportsScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentBookings, setRecentBookings] = useState<{ date: string; count: number; revenue: number }[]>([]);

  const load = async () => {
    try {
      const [s, bookings] = await Promise.all([getAdminStats(), getAdminBookings(0, 100)]);
      setStats(s);
      // Group bookings by date
      const grouped: Record<string, { count: number; revenue: number }> = {};
      bookings.forEach(b => {
        const d = b.booking_date;
        if (!grouped[d]) grouped[d] = { count: 0, revenue: 0 };
        grouped[d].count++;
        grouped[d].revenue += b.total_amount;
      });
      const sorted = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10).map(([date, data]) => ({ date, ...data }));
      setRecentBookings(sorted);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ADMIN_COLOR} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>Platform analytics</Text>
        </View>

        {loading ? <ActivityIndicator color={ADMIN_COLOR} style={{ marginTop: 60 }} size="large" /> : (
          <>
            {/* KPIs */}
            <View style={styles.kpiGrid}>
              {[
                { label: 'Total Revenue', value: `₹${(stats?.total_revenue ?? 0).toLocaleString()}`, icon: 'trending-up', color: '#16A34A', bg: '#DCFCE7' },
                { label: 'Platform Revenue', value: `₹${(stats?.platform_revenue ?? 0).toLocaleString()}`, icon: 'diamond', color: ADMIN_COLOR, bg: '#EEF2FF' },
                { label: 'Worker Payouts', value: `₹${(stats?.worker_payouts ?? 0).toLocaleString()}`, icon: 'wallet', color: '#D97706', bg: '#FEF3C7' },
                { label: 'Total Bookings', value: String(stats?.total_bookings ?? 0), icon: 'calendar', color: '#0891B2', bg: '#ECFEFF' },
              ].map((kpi, i) => (
                <View key={i} style={[styles.kpiCard, { borderLeftColor: kpi.color }]}>
                  <View style={[styles.kpiIcon, { backgroundColor: kpi.bg }]}>
                    <Ionicons name={kpi.icon as any} size={20} color={kpi.color} />
                  </View>
                  <Text style={styles.kpiLabel}>{kpi.label}</Text>
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                </View>
              ))}
            </View>

            {/* Booking Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Status Breakdown</Text>
              <View style={styles.breakdownCard}>
                {[
                  { label: 'Completed', value: stats?.completed_bookings ?? 0, color: '#16A34A', total: stats?.total_bookings ?? 1 },
                  { label: 'Pending', value: stats?.pending_bookings ?? 0, color: '#D97706', total: stats?.total_bookings ?? 1 },
                  { label: 'Cancelled', value: (stats?.total_bookings ?? 0) - (stats?.completed_bookings ?? 0) - (stats?.pending_bookings ?? 0), color: '#DC2626', total: stats?.total_bookings ?? 1 },
                ].map((item, i) => {
                  const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
                  return (
                    <View key={i} style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>{item.label}</Text>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: item.color }]} />
                      </View>
                      <Text style={[styles.breakdownValue, { color: item.color }]}>{item.value} ({pct.toFixed(0)}%)</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* User Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Breakdown</Text>
              <View style={styles.userBreakdown}>
                {[
                  { label: 'Total Users', value: stats?.total_users ?? 0, icon: 'people', color: ADMIN_COLOR, bg: '#EEF2FF' },
                  { label: 'Customers', value: stats?.total_customers ?? 0, icon: 'person', color: '#FF5A00', bg: '#FFF1E8' },
                  { label: 'Workers', value: stats?.total_workers ?? 0, icon: 'hammer', color: '#087F7A', bg: '#E6F7F5' },
                ].map((u, i) => (
                  <View key={i} style={styles.userCard}>
                    <View style={[styles.userIcon, { backgroundColor: u.bg }]}>
                      <Ionicons name={u.icon as any} size={22} color={u.color} />
                    </View>
                    <Text style={styles.userValue}>{u.value.toLocaleString()}</Text>
                    <Text style={styles.userLabel}>{u.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent by date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Bookings by Date</Text>
              {recentBookings.length === 0 ? (
                <View style={styles.noData}>
                  <Text style={styles.noDataText}>No booking data available</Text>
                </View>
              ) : recentBookings.map((row, i) => (
                <View key={i} style={styles.dateRow}>
                  <Text style={styles.dateText}>{row.date}</Text>
                  <View style={styles.dateMeta}>
                    <Text style={styles.dateCount}>{row.count} bookings</Text>
                    <Text style={styles.dateRevenue}>₹{row.revenue.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  kpiCard: { width: '47%', flexGrow: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, gap: 8 },
  kpiIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  kpiLabel: { fontSize: 12, color: '#6B7280' },
  kpiValue: { fontSize: 20, fontWeight: '900' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 12 },
  breakdownCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  breakdownRow: { gap: 6 },
  breakdownLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  progressBar: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  breakdownValue: { fontSize: 12, fontWeight: '700' },
  userBreakdown: { flexDirection: 'row', gap: 10 },
  userCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  userIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  userValue: { fontSize: 22, fontWeight: '900', color: '#111827' },
  userLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  dateText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  dateMeta: { alignItems: 'flex-end' },
  dateCount: { fontSize: 12, color: '#6B7280' },
  dateRevenue: { fontSize: 13, fontWeight: '700', color: ADMIN_COLOR },
  noData: { padding: 20, alignItems: 'center' },
  noDataText: { color: '#9CA3AF', fontSize: 14 },
});
