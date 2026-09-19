import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getWorkerBookings, updateBookingStatus, type Booking } from '@/features/bookings/services';

const TABS = ['All', 'Pending', 'Active', 'Completed'];

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status.toLowerCase()) {
    case 'pending': return { bg: '#FEF3C7', text: '#D97706' };
    case 'accepted': case 'confirmed': return { bg: '#DBEAFE', text: '#2563EB' };
    case 'in_progress': return { bg: '#EDE9FE', text: '#7C3AED' };
    case 'completed': return { bg: '#DCFCE7', text: '#16A34A' };
    case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626' };
    default: return { bg: '#F3F4F6', text: '#6B7280' };
  }
}

export default function WorkerJobsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [updating, setUpdating] = useState<number | null>(null);

  const bg = isDark ? '#0A0A0A' : COLORS.bg;
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadBookings = async () => {
    try { const data = await getWorkerBookings(); setBookings(data); } catch { setBookings([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadBookings(); }, []);

  const filtered = bookings.filter(b => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return ['accepted', 'confirmed', 'in_progress'].includes(b.status.toLowerCase());
    return b.status.toLowerCase().includes(activeTab.toLowerCase());
  });

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      setUpdating(bookingId);
      await updateBookingStatus(bookingId, newStatus);
      await loadBookings();
    } catch (e) { console.error(e); } finally { setUpdating(null); }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{t('Job Requests')}</Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>{t('Jobs assigned to you')}</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{t(tab)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} size="large" /> : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} tintColor={COLORS.primary} />}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={56} color="#D1D5DB" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>{t('No job requests yet.')}</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>{t('Make sure your availability is turned ON to receive bookings.')}</Text>
            </View>
          ) : filtered.map(b => {
            const sc = getStatusColor(b.status);
            const isPending = b.status === 'pending';
            const isActive = ['accepted', 'confirmed'].includes(b.status.toLowerCase());
            const isInProgress = b.status === 'in_progress';
            return (
              <View key={b.id} style={[styles.jobCard, { backgroundColor: cardBg }]}>
                <View style={styles.jobTop}>
                  <View>
                    <Text style={[styles.jobId, { color: subTextColor }]}>Booking #{b.id}</Text>
                    <View style={styles.jobTimeRow}>
                      <Ionicons name="calendar-outline" size={14} color={subTextColor} />
                      <Text style={[styles.jobMeta, { color: subTextColor }]}>{b.booking_date} · {b.booking_time}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{b.status.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.jobDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={14} color={subTextColor} />
                    <Text style={[styles.detailText, { color: subTextColor }]} numberOfLines={1}>{b.service_address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={14} color={subTextColor} />
                    <Text style={[styles.detailText, { color: subTextColor }]}>{b.hours} hours · ₹{b.hourly_rate}/hr</Text>
                  </View>
                </View>

                <View style={styles.jobBottom}>
                  <View>
                    <Text style={[styles.earnLabel, { color: subTextColor }]}>{t('Earned')}</Text>
                    <Text style={[styles.earnAmount, { color: COLORS.primary }]}>₹{b.worker_payout.toLocaleString()}</Text>
                  </View>
                  <View style={styles.actionBtns}>
                    {isPending && (
                      <>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]} onPress={() => handleStatusUpdate(b.id, 'cancelled')} disabled={updating === b.id}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>{t('Reject')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary }]} onPress={() => handleStatusUpdate(b.id, 'accepted')} disabled={updating === b.id}>
                          {updating === b.id ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>{t('Accept')}</Text>}
                        </TouchableOpacity>
                      </>
                    )}
                    {isActive && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EDE9FE', borderColor: '#7C3AED', flex: 1 }]} onPress={() => handleStatusUpdate(b.id, 'in_progress')} disabled={updating === b.id}>
                        {updating === b.id ? <ActivityIndicator size="small" color="#7C3AED" /> : <Text style={{ fontSize: 13, fontWeight: '700', color: '#7C3AED' }}>{t('Start Job')}</Text>}
                      </TouchableOpacity>
                    )}
                    {isInProgress && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DCFCE7', borderColor: '#16A34A', flex: 1 }]} onPress={() => handleStatusUpdate(b.id, 'completed')} disabled={updating === b.id}>
                        {updating === b.id ? <ActivityIndicator size="small" color="#16A34A" /> : <Text style={{ fontSize: 13, fontWeight: '700', color: '#16A34A' }}>{t('Complete Job')}</Text>}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  tabsRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 8, paddingTop: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  tabActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: COLORS.primary },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20, gap: 12 },
  jobCard: { borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  jobTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 14, paddingBottom: 8 },
  jobId: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  jobTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobMeta: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  jobDetails: { paddingHorizontal: 14, gap: 5, marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, flex: 1 },
  jobBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  earnLabel: { fontSize: 11, marginBottom: 2 },
  earnAmount: { fontSize: 18, fontWeight: '800' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 13, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
});
