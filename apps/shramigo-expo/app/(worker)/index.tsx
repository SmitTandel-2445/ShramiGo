import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getStoredUser, type AuthUser } from '@/features/auth/services';
import { getWorkerBookings, type Booking } from '@/features/bookings/services';
import { getWorkerAvailability } from '@/features/workers/services';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WorkerDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bg = isDark ? '#0A0A0A' : COLORS.bg;
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadData = async () => {
    const [u, bookingsData, availData] = await Promise.all([
      getStoredUser(),
      getWorkerBookings().catch(() => []),
      getWorkerAvailability().catch(() => []),
    ]);
    setUser(u);
    setBookings(bookingsData);
    if (availData.length > 0) setIsAvailable(availData.some(a => a.is_available));
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const todayBookings = bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]);
  const activeBookings = bookings.filter(b => ['accepted', 'confirmed', 'in_progress'].includes(b.status));
  const completedToday = todayBookings.filter(b => b.status === 'completed');
  const todayEarnings = completedToday.reduce((sum, b) => sum + b.worker_payout, 0);
  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.worker_payout, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>{t(getGreeting())},</Text>
              <Text style={styles.workerName}>{user?.full_name?.split(' ')[0] ?? 'Worker'} 👋</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(worker)/notifications')}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Availability Toggle */}
          <View style={styles.availCard}>
            <View>
              <Text style={styles.availTitle}>{t('Duty Status')}</Text>
              <Text style={styles.availStatus}>{isAvailable ? t("You're Available") : t("You're Offline")}</Text>
            </View>
            <Switch value={isAvailable} onValueChange={setIsAvailable} trackColor={{ false: '#E5E7EB', true: '#22C55E' }} thumbColor={COLORS.white} />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {[
            { label: t("Today's earnings"), value: `₹${todayEarnings.toLocaleString()}`, icon: 'today', color: COLORS.primary, bg: COLORS.primaryLight },
            { label: t('Active Jobs'), value: String(activeBookings.length), icon: 'briefcase', color: COLORS.accent, bg: '#FFF1E8' },
            { label: t('Completed jobs today'), value: String(completedToday.length), icon: 'checkmark-circle', color: '#16A34A', bg: '#DCFCE7' },
            { label: t('Total Earnings'), value: `₹${totalEarnings.toLocaleString()}`, icon: 'wallet', color: '#7C3AED', bg: '#EDE9FE' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: cardBg }]}>
              <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: textColor }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('Quick Actions')}</Text>
          <View style={styles.actionsRow}>
            {[
              { icon: 'list', label: t('Job Requests'), route: '/(worker)/jobs', color: COLORS.accent, bg: '#FFF1E8' },
              { icon: 'calendar', label: t('My Schedule'), route: '/(worker)/availability', color: COLORS.primary, bg: COLORS.primaryLight },
              { icon: 'construct', label: t('Skills'), route: '/(worker)/skills', color: '#7C3AED', bg: '#EDE9FE' },
              { icon: 'heart', label: 'Welfare', route: '/(worker)/welfare', color: '#DC2626', bg: '#FEE2E2' },
            ].map((action, i) => (
              <TouchableOpacity key={i} style={[styles.actionBtn, { backgroundColor: cardBg }]} onPress={() => router.push(action.route as any)} activeOpacity={0.8}>
                <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: textColor }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{t("Today's Jobs")}</Text>
            <TouchableOpacity onPress={() => router.push('/(worker)/jobs')}>
              <Text style={styles.seeAll}>{t('View all jobs')}</Text>
            </TouchableOpacity>
          </View>

          {loading ? <ActivityIndicator color={COLORS.primary} /> : todayBookings.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
              <Ionicons name="calendar-outline" size={36} color="#D1D5DB" />
              <Text style={[styles.emptyText, { color: subTextColor }]}>{t('No jobs scheduled for today')}</Text>
            </View>
          ) : todayBookings.slice(0, 3).map(b => (
            <TouchableOpacity key={b.id} style={[styles.jobCard, { backgroundColor: cardBg }]} onPress={() => router.push(`/(worker)/jobs/${b.id}` as any)} activeOpacity={0.85}>
              <View style={styles.jobInfo}>
                <Text style={[styles.jobId, { color: subTextColor }]}>Booking #{b.id}</Text>
                <Text style={[styles.jobTime, { color: textColor }]}>{b.booking_time} · {b.hours}hr</Text>
                <Text style={[styles.jobAddr, { color: subTextColor }]} numberOfLines={1}>{b.service_address}</Text>
              </View>
              <View style={styles.jobRight}>
                <Text style={[styles.jobEarning, { color: COLORS.primary }]}>₹{b.worker_payout}</Text>
                <View style={[styles.jobStatus, { backgroundColor: b.status === 'completed' ? '#DCFCE7' : '#FEF3C7' }]}>
                  <Text style={[styles.jobStatusText, { color: b.status === 'completed' ? '#16A34A' : '#D97706' }]}>{b.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, overflow: 'hidden' },
  headerCircle1: { position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.06)' },
  headerCircle2: { position: 'absolute', bottom: -20, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)' },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  greetingText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  workerName: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  notifBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  availCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 },
  availTitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 2 },
  availStatus: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 20, paddingBottom: 4 },
  statCard: { width: '47%', borderRadius: 16, padding: 14, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, lineHeight: 15 },
  section: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  emptyCard: { borderRadius: 16, padding: 28, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  jobCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  jobInfo: { flex: 1, gap: 3 },
  jobId: { fontSize: 12 },
  jobTime: { fontSize: 14, fontWeight: '700' },
  jobAddr: { fontSize: 12, flex: 1 },
  jobRight: { alignItems: 'flex-end', gap: 6 },
  jobEarning: { fontSize: 16, fontWeight: '800' },
  jobStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  jobStatusText: { fontSize: 10, fontWeight: '700' },
});
