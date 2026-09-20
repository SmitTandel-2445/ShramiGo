import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getMyBookings, type Booking } from '@/features/bookings/services';

const STATUS_FILTERS = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status.toLowerCase()) {
    case 'pending': return { bg: '#FEF3C7', text: '#D97706' };
    case 'confirmed': return { bg: '#DBEAFE', text: '#2563EB' };
    case 'in_progress': case 'in progress': return { bg: '#EDE9FE', text: '#7C3AED' };
    case 'completed': return { bg: '#DCFCE7', text: '#16A34A' };
    case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626' };
    default: return { bg: '#F3F4F6', text: '#6B7280' };
  }
}

export default function BookingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const bg = isDark ? '#0A0A0A' : COLORS.bg;
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch { setBookings([]); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadBookings(); }, []);

  const filtered = bookings.filter(b => statusFilter === 'All' || b.status.toLowerCase().includes(statusFilter.toLowerCase()));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{t('My Bookings')}</Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>{t('Booking History')}</Text>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {STATUS_FILTERS.map(s => {
          const sc = getStatusColor(s);
          const isActive = statusFilter === s;
          return (
            <TouchableOpacity key={s} style={[styles.filterChip, isActive && { backgroundColor: sc.bg, borderColor: sc.text }]} onPress={() => setStatusFilter(s)}>
              <Text style={[styles.filterText, isActive && { color: sc.text }]}>{t(s)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} size="large" />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} tintColor={COLORS.primary} />}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={56} color="#D1D5DB" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No bookings found</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>Your booking history will appear here</Text>
              <TouchableOpacity style={styles.findBtn} onPress={() => router.push('/(customer)/search')}>
                <Text style={styles.findBtnText}>Find a Worker</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.map(booking => {
            const sc = getStatusColor(booking.status);
            return (
              <TouchableOpacity key={booking.id} style={[styles.bookingCard, { backgroundColor: cardBg }]} onPress={() => router.push(`/(customer)/bookings/${booking.id}` as any)} activeOpacity={0.85}>
                <View style={styles.bookingTop}>
                  <View style={styles.bookingIdRow}>
                    <Text style={[styles.bookingId, { color: subTextColor }]}>Booking #{booking.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>{booking.status.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={14} color={subTextColor} />
                      <Text style={[styles.detailText, { color: subTextColor }]}>{booking.booking_date} at {booking.booking_time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={14} color={subTextColor} />
                      <Text style={[styles.detailText, { color: subTextColor }]} numberOfLines={1}>{booking.service_address}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={14} color={subTextColor} />
                      <Text style={[styles.detailText, { color: subTextColor }]}>{booking.hours} hours · ₹{booking.hourly_rate}/hr</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.bookingBottom}>
                  <View>
                    <Text style={[styles.totalLabel, { color: subTextColor }]}>{t('Total Amount')}</Text>
                    <Text style={[styles.totalAmount, { color: textColor }]}>₹{booking.total_amount.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.payBadge, { backgroundColor: booking.payment_status === 'paid' ? '#DCFCE7' : '#FEF3C7' }]}>
                    <Text style={[styles.payText, { color: booking.payment_status === 'paid' ? '#16A34A' : '#D97706' }]}>
                      {booking.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 8, paddingTop: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20, gap: 12 },
  bookingCard: { borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  bookingTop: { padding: 16, gap: 10 },
  bookingIdRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookingId: { fontSize: 13, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  bookingDetails: { gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, flex: 1 },
  bookingBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalLabel: { fontSize: 12, marginBottom: 2 },
  totalAmount: { fontSize: 18, fontWeight: '800' },
  payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  payText: { fontSize: 11, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
  findBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.accent, borderRadius: 14 },
  findBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
