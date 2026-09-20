import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput, Modal, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/lib/appConstants';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdminBookings, type AdminBooking } from '@/features/admin/services';

const ADMIN_PRIMARY = '#4F46E5';
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  confirmed: { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' },
  in_progress: { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE' },
  completed: { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
};

const STATUS_FILTERS = ['All', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export default function AdminBookingsScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  const bg = isDark ? '#0D0D0D' : '#F8FAFF';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadBookings = async () => {
    try {
      const data = await getAdminBookings(
        0,
        100,
        statusFilter !== 'All' ? statusFilter : undefined
      );
      setBookings(data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadBookings();
  }, [statusFilter]);

  const filtered = bookings.filter(b => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (b.customer_name && b.customer_name.toLowerCase().includes(q)) ||
      (b.worker_name && b.worker_name.toLowerCase().includes(q)) ||
      (b.service_address && b.service_address.toLowerCase().includes(q)) ||
      String(b.id).includes(q)
    );
  });

  const getFilterCount = (filterName: string) => {
    if (filterName === 'All') return bookings.length;
    return bookings.filter(b => b.status.toLowerCase() === filterName.toLowerCase()).length;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>System Bookings</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            {bookings.length} total bookings recorded
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Ionicons name="search-outline" size={18} color={subTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search by customer, worker, ID or address..."
            placeholderTextColor={subTextColor}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={subTextColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterWrapper}>
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={s => s}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: s }) => {
            const isSelected = statusFilter === s;
            const sc = STATUS_COLORS[s] ?? { bg: '#EEF2FF', text: ADMIN_PRIMARY, border: '#C7D2FE' };
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? ADMIN_PRIMARY : cardBg,
                    borderColor: isSelected ? ADMIN_PRIMARY : cardBorder,
                  },
                ]}
                onPress={() => setStatusFilter(s)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isSelected ? '#FFFFFF' : subTextColor },
                  ]}
                >
                  {s.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={ADMIN_PRIMARY} size="large" />
          <Text style={[styles.loadingText, { color: subTextColor }]}>Loading booking ledger...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={b => String(b.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadBookings(); }}
              tintColor={ADMIN_PRIMARY}
            />
          }
          ListEmptyComponent={() => (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Ionicons name="calendar-outline" size={44} color={subTextColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No bookings found</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>Try selecting a different status filter.</Text>
            </View>
          )}
          renderItem={({ item: b }) => {
            const sc = STATUS_COLORS[b.status] ?? { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
            return (
              <TouchableOpacity
                style={[styles.bookingCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => setSelectedBooking(b)}
                activeOpacity={0.8}
              >
                {/* Header */}
                <View style={styles.cardTop}>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>#{b.id}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>
                      {b.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Mapping */}
                <View style={styles.cardRows}>
                  <View style={styles.cardRow}>
                    <Ionicons name="person-outline" size={14} color={ADMIN_PRIMARY} />
                    <Text style={[styles.cardRowText, { color: textColor }]}>
                      <Text style={{ fontWeight: '700' }}>Customer:</Text> {b.customer_name || `User #${b.customer_id}`}
                    </Text>
                  </View>

                  <View style={styles.cardRow}>
                    <Ionicons name="hammer-outline" size={14} color="#0891B2" />
                    <Text style={[styles.cardRowText, { color: textColor }]}>
                      <Text style={{ fontWeight: '700' }}>Worker:</Text> {b.worker_name || `Worker #${b.worker_id}`}
                    </Text>
                  </View>

                  <View style={styles.cardRow}>
                    <Ionicons name="calendar-outline" size={14} color={subTextColor} />
                    <Text style={[styles.cardRowText, { color: subTextColor }]}>
                      {b.booking_date} at {b.booking_time} ({b.hours} hrs @ ₹{b.hourly_rate}/hr)
                    </Text>
                  </View>

                  <View style={styles.cardRow}>
                    <Ionicons name="location-outline" size={14} color={subTextColor} />
                    <Text style={[styles.cardRowText, { color: subTextColor }]} numberOfLines={1}>
                      {b.service_address || 'No address logged'}
                    </Text>
                  </View>
                </View>

                {/* Footer */}
                <View style={[styles.cardBottom, { borderTopColor: cardBorder }]}>
                  <View>
                    <Text style={[styles.amountLabel, { color: subTextColor }]}>TOTAL VALUE</Text>
                    <Text style={styles.amount}>₹{b.total_amount.toLocaleString()}</Text>
                  </View>

                  <View style={[styles.payBadge, { backgroundColor: b.payment_status === 'paid' ? '#DCFCE7' : '#FEF3C7' }]}>
                    <Text style={[styles.payText, { color: b.payment_status === 'paid' ? '#16A34A' : '#D97706' }]}>
                      {b.payment_status?.toUpperCase() || 'UNPAID'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Admin Booking Details Modal */}
      <Modal
        visible={!!selectedBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  Booking #{selectedBooking?.id}
                </Text>
                <Text style={[styles.modalSub, { color: subTextColor }]}>
                  {selectedBooking?.booking_date} · {selectedBooking?.booking_time}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedBooking(null)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <View style={{ gap: 14, paddingBottom: 24 }}>
                {/* Financial Summary */}
                <View style={[styles.summaryBox, { backgroundColor: COLORS.primaryLight }]}>
                  <View>
                    <Text style={styles.summaryLabel}>Total Amount</Text>
                    <Text style={styles.summaryAmount}>₹{selectedBooking.total_amount.toLocaleString()}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.summarySubLabel}>Service Fee</Text>
                    <Text style={styles.summarySubAmount}>₹{selectedBooking.service_charge || 0}</Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailsGroup}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person" size={16} color={ADMIN_PRIMARY} />
                    <Text style={[styles.infoRowText, { color: textColor }]}>
                      Customer: {selectedBooking.customer_name} (ID #{selectedBooking.customer_id})
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="hammer" size={16} color={ADMIN_PRIMARY} />
                    <Text style={[styles.infoRowText, { color: textColor }]}>
                      Worker: {selectedBooking.worker_name} (ID #{selectedBooking.worker_id})
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={ADMIN_PRIMARY} />
                    <Text style={[styles.infoRowText, { color: textColor }]}>
                      {selectedBooking.service_address}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.mapBtn, { borderColor: cardBorder }]}
                  onPress={() => {
                    const addr = encodeURIComponent(selectedBooking.service_address);
                    Linking.openURL(`https://maps.google.com/?q=${addr}`);
                  }}
                >
                  <Ionicons name="navigate-outline" size={18} color={ADMIN_PRIMARY} />
                  <Text style={styles.mapBtnText}>Open Location in Maps</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 13, marginTop: 2 },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13 },
  filterWrapper: { paddingBottom: 6 },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterText: { fontSize: 11, fontWeight: '800' },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  bookingCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  idBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadgeText: { fontSize: 11, fontWeight: '800', color: '#374151' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '800' },
  cardRows: { paddingHorizontal: 14, gap: 6, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardRowText: { fontSize: 13, flex: 1 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  amountLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  amount: { fontSize: 16, fontWeight: '900', color: ADMIN_PRIMARY },
  payBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  payText: { fontSize: 10, fontWeight: '800' },
  emptyCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyDesc: { fontSize: 13, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalSub: { fontSize: 12, marginTop: 2 },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  summaryLabel: { fontSize: 12, fontWeight: '700', color: ADMIN_PRIMARY },
  summaryAmount: { fontSize: 22, fontWeight: '900', color: ADMIN_PRIMARY },
  summarySubLabel: { fontSize: 11, color: '#4B5563' },
  summarySubAmount: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  detailsGroup: { gap: 12, marginVertical: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoRowText: { fontSize: 13, fontWeight: '600', flex: 1 },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 6,
  },
  mapBtnText: { color: ADMIN_PRIMARY, fontSize: 14, fontWeight: '700' },
});
