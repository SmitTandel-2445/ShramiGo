import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getWorkerBookings, type Booking } from '@/features/bookings/services';

const TIME_FILTERS = ['This Week', 'This Month', 'All Time'];

export default function WorkerEarningsScreen() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('All Time');
  const [refreshing, setRefreshing] = useState(false);

  const bg = isDark ? '#0A0A0A' : COLORS.bg;
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadData = async () => {
    try {
      const data = await getWorkerBookings();
      setBookings(data.filter(b => b.status === 'completed'));
    } catch { setBookings([]); } finally { setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  const now = new Date();
  const filteredBookings = bookings.filter(b => {
    const d = new Date(b.created_at);
    if (filter === 'This Week') { const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w; }
    if (filter === 'This Month') { const m = new Date(now); m.setMonth(m.getMonth() - 1); return d >= m; }
    return true;
  });

  const totalEarnings = filteredBookings.reduce((s, b) => s + b.worker_payout, 0);
  const totalJobs = filteredBookings.length;
  const avgPerJob = totalJobs > 0 ? totalEarnings / totalJobs : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>{t('Earnings')}</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>{t('Payout History')}</Text>
        </View>

        {/* Filter */}
        <View style={styles.filterRow}>
          {TIME_FILTERS.map(f => (
            <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{t(f)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: t('Total Earnings'), value: `₹${totalEarnings.toLocaleString()}`, icon: 'wallet', color: COLORS.primary, bg: COLORS.primaryLight },
            { label: t('Completed Jobs'), value: String(totalJobs), icon: 'checkmark-circle', color: '#16A34A', bg: '#DCFCE7' },
            { label: t('Estimated earning'), value: `₹${Math.round(avgPerJob).toLocaleString()}`, icon: 'trending-up', color: '#7C3AED', bg: '#EDE9FE' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: cardBg }]}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: textColor }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Payout List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('Payout History')}</Text>
          {filteredBookings.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: cardBg }]}>
              <Ionicons name="wallet-outline" size={40} color="#D1D5DB" />
              <Text style={[styles.emptyText, { color: subTextColor }]}>No earnings in this period</Text>
            </View>
          ) : filteredBookings.map(b => (
            <View key={b.id} style={[styles.payoutRow, { backgroundColor: cardBg }]}>
              <View style={[styles.payoutIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.payoutInfo}>
                <Text style={[styles.payoutId, { color: textColor }]}>Booking #{b.id}</Text>
                <Text style={[styles.payoutDate, { color: subTextColor }]}>{b.booking_date} · {b.hours}hr</Text>
              </View>
              <Text style={[styles.payoutAmount, { color: COLORS.primary }]}>+₹{b.worker_payout.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  filterBtn: { flex: 1, paddingVertical: 9, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  filterBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: COLORS.primary },
  statsGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, lineHeight: 14 },
  section: { paddingHorizontal: 20, paddingBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  empty: { borderRadius: 16, padding: 32, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  payoutIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  payoutInfo: { flex: 1 },
  payoutId: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  payoutDate: { fontSize: 12 },
  payoutAmount: { fontSize: 16, fontWeight: '800' },
});
