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

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadData = async () => {
    try {
      const data = await getWorkerBookings();
      setBookings(data.filter(b => b.status.toLowerCase() === 'completed'));
    } catch {
      setBookings([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const now = new Date();
  const filteredBookings = bookings.filter(b => {
    const d = new Date(b.created_at || b.booking_date);
    if (filter === 'This Week') {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      return d >= w;
    }
    if (filter === 'This Month') {
      const m = new Date(now);
      m.setMonth(m.getMonth() - 1);
      return d >= m;
    }
    return true;
  });

  const totalEarnings = filteredBookings.reduce((s, b) => s + (b.worker_payout || 0), 0);
  const totalJobs = filteredBookings.length;
  const totalHours = filteredBookings.reduce((s, b) => s + (b.hours || 0), 0);
  const avgPerJob = totalJobs > 0 ? totalEarnings / totalJobs : 0;
  const highestPayout = filteredBookings.reduce((max, b) => Math.max(max, b.worker_payout || 0), 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header Title */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: textColor }]}>{t('Earnings')}</Text>
            <Text style={[styles.subtitle, { color: subTextColor }]}>{t('Payout History')}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.verifiedText}>Direct UPI Payout</Text>
          </View>
        </View>

        {/* Hero Balance Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <Text style={styles.heroLabel}>{t('Total Earnings')} ({t(filter)})</Text>
          <Text style={styles.heroAmount}>₹{totalEarnings.toLocaleString()}</Text>
          <View style={styles.heroFooter}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{totalJobs}</Text>
              <Text style={styles.heroStatLbl}>{t('Completed Jobs')}</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{totalHours} hrs</Text>
              <Text style={styles.heroStatLbl}>Time Worked</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>₹{Math.round(avgPerJob)}</Text>
              <Text style={styles.heroStatLbl}>Avg / Job</Text>
            </View>
          </View>
        </View>

        {/* Time Filter Pills */}
        <View style={styles.filterRow}>
          {TIME_FILTERS.map(f => {
            const isActive = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: isActive ? COLORS.primary : cardBg,
                    borderColor: isActive ? COLORS.primary : cardBorder,
                  },
                ]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? COLORS.white : subTextColor },
                  ]}
                >
                  {t(f)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detailed Metrics */}
        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="trending-up" size={20} color={COLORS.primary} />
            </View>
            <Text style={[styles.metricValue, { color: textColor }]}>₹{highestPayout.toLocaleString()}</Text>
            <Text style={[styles.metricLabel, { color: subTextColor }]}>Top Single Payout</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="speedometer-outline" size={20} color="#16A34A" />
            </View>
            <Text style={[styles.metricValue, { color: textColor }]}>
              ₹{totalHours > 0 ? Math.round(totalEarnings / totalHours) : 0}/hr
            </Text>
            <Text style={[styles.metricLabel, { color: subTextColor }]}>Effective Rate</Text>
          </View>
        </View>

        {/* Payout History List */}
        <View style={[styles.section, { paddingBottom: 30 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{t('Payout History')}</Text>
            <Text style={[styles.sectionCount, { color: subTextColor }]}>
              {filteredBookings.length} {filteredBookings.length === 1 ? 'record' : 'records'}
            </Text>
          </View>

          {filteredBookings.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="wallet-outline" size={36} color={subTextColor} />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>No earnings in this period</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>
                Complete scheduled jobs to see your earnings and payouts update here.
              </Text>
            </View>
          ) : (
            filteredBookings.map(b => (
              <View
                key={b.id}
                style={[styles.payoutCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              >
                <View style={[styles.payoutIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                </View>

                <View style={styles.payoutInfo}>
                  <View style={styles.payoutTitleRow}>
                    <Text style={[styles.payoutId, { color: textColor }]}>Booking #{b.id}</Text>
                    <View style={styles.settledBadge}>
                      <Text style={styles.settledBadgeText}>
                        {b.payment_method === 'cash' ? 'CASH RECEIVED' : 'PAID'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.payoutDate, { color: subTextColor }]}>
                    {b.booking_date} · {b.hours} hrs @ ₹{b.hourly_rate}/hr
                  </Text>
                  {b.service_address && (
                    <Text style={[styles.payoutAddress, { color: subTextColor }]} numberOfLines={1}>
                      {b.service_address}
                    </Text>
                  )}
                </View>

                <View style={styles.payoutAmountCol}>
                  <Text style={styles.payoutAmount}>+₹{b.worker_payout.toLocaleString()}</Text>
                  <Text style={[styles.payoutSub, { color: subTextColor }]}>Credited</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 13, marginTop: 2 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    padding: 22,
    marginTop: 6,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  heroCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 18,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: 14,
  },
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  heroStatLbl: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(156, 163, 175, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  payoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  payoutInfo: {
    flex: 1,
    gap: 3,
  },
  payoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payoutId: {
    fontSize: 14,
    fontWeight: '700',
  },
  settledBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  settledBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
  },
  payoutDate: {
    fontSize: 12,
  },
  payoutAddress: {
    fontSize: 11,
  },
  payoutAmountCol: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#16A34A',
  },
  payoutSub: {
    fontSize: 10,
    fontWeight: '600',
  },
});
