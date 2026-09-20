import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getMyBookings, cancelBooking, updateBookingPaymentMethod, type Booking,
} from '@/features/bookings/services';

const STATUS_FILTERS = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', label: 'PENDING' };
    case 'confirmed':
    case 'accepted':
      return { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE', label: 'CONFIRMED' };
    case 'in_progress':
    case 'in progress':
      return { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE', label: 'IN PROGRESS' };
    case 'completed':
      return { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0', label: 'COMPLETED' };
    case 'cancelled':
      return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA', label: 'CANCELLED' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', label: status.toUpperCase() };
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#242424' : '#F3F4F6';

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancel = async (bookingId: number) => {
    Alert.alert(
      t('Cancel Booking'),
      'Are you sure you want to cancel this booking request?',
      [
        { text: t('No'), style: 'cancel' },
        {
          text: t('Yes, Cancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await cancelBooking(bookingId);
              await loadBookings();
              if (selectedBooking && selectedBooking.id === bookingId) {
                setSelectedBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
              }
              Alert.alert(t('Cancelled'), 'Your booking has been cancelled.');
            } catch {
              Alert.alert(t('Error'), 'Failed to cancel booking.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const filtered = bookings.filter(b => {
    if (statusFilter === 'All') return true;
    const s = b.status.toLowerCase();
    const filterLower = statusFilter.toLowerCase();
    if (filterLower === 'in progress') return s === 'in_progress' || s === 'in progress';
    return s.includes(filterLower);
  });

  const getStatusCount = (filterName: string) => {
    if (filterName === 'All') return bookings.length;
    const f = filterName.toLowerCase();
    return bookings.filter(b => {
      const s = b.status.toLowerCase();
      if (f === 'in progress') return s === 'in_progress' || s === 'in progress';
      return s.includes(f);
    }).length;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>{t('My Bookings')}</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>{t('Booking History')}</Text>
        </View>
        <TouchableOpacity
          style={styles.findWorkerBtn}
          onPress={() => router.push('/(customer)/search')}
        >
          <Ionicons name="add" size={16} color={COLORS.white} />
          <Text style={styles.findWorkerBtnText}>New Booking</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {STATUS_FILTERS.map(s => {
            const count = getStatusCount(s);
            const isActive = statusFilter === s;
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? COLORS.primary : cardBg,
                    borderColor: isActive ? COLORS.primary : cardBorder,
                  },
                ]}
                onPress={() => setStatusFilter(s)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? COLORS.white : subTextColor },
                  ]}
                >
                  {t(s)}
                </Text>
                <View
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : isDark ? '#2D2D2D' : '#E5E7EB',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      { color: isActive ? COLORS.white : subTextColor },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Booking List */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={[styles.loadingText, { color: subTextColor }]}>Loading bookings...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadBookings(); }}
              tintColor={COLORS.primary}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={40} color={subTextColor} />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>No bookings found</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>
                {statusFilter === 'All'
                  ? 'Your service bookings and appointments will appear here.'
                  : `You currently have no ${statusFilter.toLowerCase()} bookings.`}
              </Text>
              <TouchableOpacity
                style={styles.findBtn}
                onPress={() => router.push('/(customer)/search')}
              >
                <Text style={styles.findBtnText}>Find a Worker</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map(booking => {
              const style = getStatusStyle(booking.status);
              const isPaid = booking.payment_status === 'paid';
              return (
                <TouchableOpacity
                  key={booking.id}
                  style={[styles.bookingCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                  onPress={() => setSelectedBooking(booking)}
                  activeOpacity={0.85}
                >
                  {/* Top Bar */}
                  <View style={styles.bookingTop}>
                    <View style={styles.bookingIdRow}>
                      <View style={styles.idBadge}>
                        <Text style={styles.idBadgeText}>#{booking.id}</Text>
                      </View>
                      <View style={styles.dateTimeRow}>
                        <Ionicons name="calendar-outline" size={13} color={subTextColor} />
                        <Text style={[styles.dateTimeText, { color: subTextColor }]}>
                          {booking.booking_date} · {booking.booking_time}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: style.bg, borderColor: style.border }]}>
                      <Text style={[styles.statusText, { color: style.text }]}>{style.label}</Text>
                    </View>
                  </View>

                  {/* Body Details */}
                  <View style={styles.bookingBody}>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
                      <Text style={[styles.addressText, { color: textColor }]} numberOfLines={2}>
                        {booking.service_address || 'Service address specified'}
                      </Text>
                    </View>

                    <View style={styles.specsRow}>
                      <View style={styles.specChip}>
                        <Ionicons name="time-outline" size={13} color={subTextColor} />
                        <Text style={[styles.specText, { color: subTextColor }]}>
                          {booking.hours} {booking.hours === 1 ? 'Hour' : 'Hours'}
                        </Text>
                      </View>

                      <View style={styles.specChip}>
                        <Ionicons name="pricetag-outline" size={13} color={subTextColor} />
                        <Text style={[styles.specText, { color: subTextColor }]}>
                          ₹{booking.hourly_rate}/hr
                        </Text>
                      </View>

                      <View style={styles.specChip}>
                        <Ionicons name="card-outline" size={13} color={subTextColor} />
                        <Text style={[styles.specText, { color: subTextColor }]}>
                          {booking.payment_method === 'cash' ? 'Cash' : 'Online'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Bottom Bar */}
                  <View style={[styles.bookingBottom, { borderTopColor: cardBorder }]}>
                    <View>
                      <Text style={[styles.totalLabel, { color: subTextColor }]}>{t('Total Amount')}</Text>
                      <Text style={[styles.totalAmount, { color: textColor }]}>
                        ₹{booking.total_amount.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.rightActions}>
                      <View style={[styles.payBadge, { backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7' }]}>
                        <Text style={[styles.payText, { color: isPaid ? '#16A34A' : '#D97706' }]}>
                          {isPaid ? 'PAID' : 'UNPAID'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={subTextColor} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Booking Details Modal */}
      <Modal
        visible={!!selectedBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalTopBar}>
              <View>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  Booking #{selectedBooking?.id}
                </Text>
                <Text style={[styles.modalSub, { color: subTextColor }]}>
                  {selectedBooking?.booking_date} at {selectedBooking?.booking_time}
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
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Total Invoice Banner */}
                <View style={styles.invoiceBanner}>
                  <View>
                    <Text style={styles.invoiceBannerLabel}>{t('Total Amount')}</Text>
                    <Text style={styles.invoiceBannerAmount}>₹{selectedBooking.total_amount.toLocaleString()}</Text>
                  </View>
                  <View style={[
                    styles.invoiceBadge,
                    {
                      backgroundColor: selectedBooking.payment_status === 'paid' ? '#DCFCE7' : '#FEF3C7',
                    },
                  ]}>
                    <Text style={{
                      fontWeight: '800',
                      fontSize: 12,
                      color: selectedBooking.payment_status === 'paid' ? '#16A34A' : '#D97706',
                    }}>
                      {selectedBooking.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                    </Text>
                  </View>
                </View>

                {/* Service Details */}
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, { color: textColor }]}>{t('Service Details')}</Text>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="location" size={18} color={COLORS.primary} />
                    <Text style={[styles.modalInfoText, { color: textColor }]}>
                      {selectedBooking.service_address}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="time" size={18} color={COLORS.primary} />
                    <Text style={[styles.modalInfoText, { color: textColor }]}>
                      Duration: {selectedBooking.hours} Hours (@ ₹{selectedBooking.hourly_rate}/hr)
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="card" size={18} color={COLORS.primary} />
                    <Text style={[styles.modalInfoText, { color: textColor }]}>
                      Payment Method: {selectedBooking.payment_method === 'cash' ? 'Cash on Completion' : 'UPI / Online'}
                    </Text>
                  </View>

                  {selectedBooking.description && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="document-text" size={18} color={COLORS.primary} />
                      <Text style={[styles.modalInfoText, { color: textColor }]}>
                        {selectedBooking.description}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Map Directions */}
                <TouchableOpacity
                  style={[styles.actionOutlineBtn, { borderColor: cardBorder }]}
                  onPress={() => {
                    const addr = encodeURIComponent(selectedBooking.service_address);
                    Linking.openURL(`https://maps.google.com/?q=${addr}`);
                  }}
                >
                  <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.actionOutlineBtnText}>Open Location in Maps</Text>
                </TouchableOpacity>

                {/* Cancel Booking Action if pending or confirmed */}
                {['pending', 'accepted', 'confirmed'].includes(selectedBooking.status.toLowerCase()) && (
                  <TouchableOpacity
                    style={styles.cancelBookingBtn}
                    onPress={() => handleCancel(selectedBooking.id)}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <ActivityIndicator color="#DC2626" />
                    ) : (
                      <Text style={styles.cancelBookingText}>{t('Cancel Booking')}</Text>
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 13, marginTop: 2 },
  findWorkerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  findWorkerBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  filterWrapper: { paddingBottom: 6 },
  filterRow: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: { fontSize: 12, fontWeight: '700' },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '800' },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 24, gap: 12 },
  emptyCard: {
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(156, 163, 175, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  findBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 8,
  },
  findBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  bookingCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  bookingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  bookingIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadgeText: { fontSize: 11, fontWeight: '800', color: '#374151' },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateTimeText: { fontSize: 12, fontWeight: '500' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '800' },
  bookingBody: { paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  addressText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 19 },
  specsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 2 },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specText: { fontSize: 11, fontWeight: '600' },
  bookingBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  totalLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  totalAmount: { fontSize: 18, fontWeight: '900', color: COLORS.accent },
  rightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  payBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  payText: { fontSize: 10, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalSub: { fontSize: 13, marginTop: 2 },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  invoiceBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  invoiceBannerLabel: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  invoiceBannerAmount: { fontSize: 24, fontWeight: '900', color: COLORS.primary },
  invoiceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modalSection: { gap: 12, marginBottom: 16 },
  modalSectionTitle: { fontSize: 15, fontWeight: '800' },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalInfoText: { fontSize: 14, flex: 1 },
  actionOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  actionOutlineBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  cancelBookingBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelBookingText: { color: '#DC2626', fontSize: 14, fontWeight: '800' },
});
