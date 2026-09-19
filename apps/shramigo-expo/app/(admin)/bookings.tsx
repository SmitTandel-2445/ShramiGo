import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAdminBookings, type AdminBooking } from '@/features/admin/services';

const ADMIN_COLOR = '#4F46E5';
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  confirmed: { bg: '#DBEAFE', text: '#2563EB' },
  in_progress: { bg: '#EDE9FE', text: '#7C3AED' },
  completed: { bg: '#DCFCE7', text: '#16A34A' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

const STATUS_FILTERS = ['All', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');

  const load = async () => {
    try { const data = await getAdminBookings(0, 100, statusFilter !== 'All' ? statusFilter : undefined); setBookings(data); } catch { setBookings([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { setLoading(true); load(); }, [statusFilter]);

  const filtered = bookings.filter(b =>
    !query || b.customer_name.toLowerCase().includes(query.toLowerCase()) || b.worker_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>{filtered.length} total</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" />
        <TextInput style={styles.searchInput} placeholder="Search by customer or worker..." placeholderTextColor="#9CA3AF" value={query} onChangeText={setQuery} />
      </View>

      <FlatList
        data={STATUS_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={s => s}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: s }) => {
          const sc = STATUS_COLORS[s] ?? { bg: '#F3F4F6', text: '#6B7280' };
          return (
            <TouchableOpacity style={[styles.filterChip, statusFilter === s && { backgroundColor: sc.bg, borderColor: sc.text }]} onPress={() => setStatusFilter(s)}>
              <Text style={[styles.filterText, statusFilter === s && { color: sc.text }]}>{s.replace('_', ' ').toUpperCase() || 'ALL'}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? <ActivityIndicator color={ADMIN_COLOR} style={{ marginTop: 40 }} size="large" /> : (
        <FlatList
          data={filtered}
          keyExtractor={b => String(b.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ADMIN_COLOR} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          )}
          renderItem={({ item: b }) => {
            const sc = STATUS_COLORS[b.status] ?? { bg: '#F3F4F6', text: '#6B7280' };
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.bookingId}>Booking #{b.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{b.status.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.cardRows}>
                  <View style={styles.cardRow}>
                    <Ionicons name="person-outline" size={13} color="#9CA3AF" />
                    <Text style={styles.cardRowText}>{b.customer_name} → {b.worker_name}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                    <Text style={styles.cardRowText}>{b.booking_date} at {b.booking_time} · {b.hours}hr</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                    <Text style={styles.cardRowText} numberOfLines={1}>{b.service_address}</Text>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.amount}>₹{b.total_amount.toLocaleString()}</Text>
                  <View style={[styles.payBadge, { backgroundColor: b.payment_status === 'paid' ? '#DCFCE7' : '#FEF3C7' }]}>
                    <Text style={[styles.payText, { color: b.payment_status === 'paid' ? '#16A34A' : '#D97706' }]}>
                      {b.payment_status?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 8, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, height: 44, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  filterText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 },
  bookingId: { fontSize: 13, fontWeight: '700', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  cardRows: { paddingHorizontal: 14, gap: 5, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardRowText: { fontSize: 12, color: '#4B5563', flex: 1 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  amount: { fontSize: 16, fontWeight: '800', color: ADMIN_COLOR },
  payBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  payText: { fontSize: 10, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
