import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Image, RefreshControl, Modal, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getWorkers, type Worker } from '@/features/workers/services';
import { getCustomerProfile, type CustomerProfile } from '@/features/auth/profileServices';
import { createBooking } from '@/features/bookings/services';

const SERVICE_FILTERS = [
  'All', 'Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Painter',
  'Driver', 'AC Repair', 'Mason', 'Appliance Repair', 'Gardener',
];

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
const DURATION_OPTIONS = [1, 2, 3, 4, 8];

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  // Booking Sheet Modal State
  const [bookingWorker, setBookingWorker] = useState<Worker | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingHours, setBookingHours] = useState(2);
  const [serviceAddress, setServiceAddress] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay'>('cash');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#242424' : '#F3F4F6';

  const loadWorkers = async (service?: string) => {
    try {
      const [data, prof] = await Promise.all([
        getWorkers(service !== 'All' ? service : undefined),
        getCustomerProfile().catch(() => null),
      ]);
      setWorkers(data || []);
      setProfile(prof);
      if (prof?.address && !serviceAddress) setServiceAddress(prof.address);
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadWorkers(selectedService); }, [selectedService]);

  const handleOpenBooking = (worker: Worker) => {
    setBookingWorker(worker);
    if (profile?.address && !serviceAddress) {
      setServiceAddress(profile.address);
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingWorker) return;
    if (!serviceAddress.trim()) {
      Alert.alert(t('Address Required'), 'Please enter your service delivery address.');
      return;
    }
    try {
      setSubmittingBooking(true);
      await createBooking({
        worker_id: bookingWorker.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        hours: bookingHours,
        service_address: serviceAddress.trim(),
        description: bookingDesc.trim() || `${bookingWorker.service} service request`,
        payment_method: paymentMethod,
      });

      Alert.alert(
        t('Booking Confirmed!'),
        `Your booking request has been sent to ${bookingWorker.name}. You can track it in My Bookings.`,
        [
          {
            text: t('View Bookings'),
            onPress: () => {
              setBookingWorker(null);
              router.push('/(customer)/bookings');
            },
          },
          {
            text: 'OK',
            onPress: () => setBookingWorker(null),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(t('Error'), err.message || 'Failed to place booking.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const parseRate = (priceStr: string) => {
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    return isNaN(num) || num <= 0 ? 300 : num;
  };

  const filteredWorkers = workers.filter(w => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.service.toLowerCase().includes(q) ||
      (w.city && w.city.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    return parseRate(a.price) - parseRate(b.price);
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>{t('Search')}</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>{t('All Workers')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.aiShortcut, { backgroundColor: COLORS.primaryLight }]}
          onPress={() => router.push('/(customer)/matching')}
        >
          <Ionicons name="sparkles" size={16} color={COLORS.primary} />
          <Text style={styles.aiShortcutText}>AI Match</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={[styles.searchWrapper, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Ionicons name="search-outline" size={18} color={COLORS.primary} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={t('Search for Electrician, Plumber...')}
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

      {/* Service Filter Chips */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {SERVICE_FILTERS.map(svc => {
            const isSelected = selectedService === svc;
            return (
              <TouchableOpacity
                key={svc}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? COLORS.primary : cardBg,
                    borderColor: isSelected ? COLORS.primary : cardBorder,
                  },
                ]}
                onPress={() => { setSelectedService(svc); setLoading(true); }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? COLORS.white : subTextColor },
                  ]}
                >
                  {t(svc)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sort Row */}
      <View style={styles.sortRow}>
        <Text style={[styles.resultCount, { color: subTextColor }]}>
          {filteredWorkers.length} {filteredWorkers.length === 1 ? 'worker' : 'workers'} found
        </Text>
        <View style={styles.sortBtns}>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              { backgroundColor: sortBy === 'rating' ? COLORS.accent : cardBg, borderColor: sortBy === 'rating' ? COLORS.accent : cardBorder },
            ]}
            onPress={() => setSortBy('rating')}
          >
            <Text
              style={[
                styles.sortBtnText,
                { color: sortBy === 'rating' ? COLORS.white : subTextColor },
              ]}
            >
              ★ {t('Rating')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortBtn,
              { backgroundColor: sortBy === 'price' ? COLORS.accent : cardBg, borderColor: sortBy === 'price' ? COLORS.accent : cardBorder },
            ]}
            onPress={() => setSortBy('price')}
          >
            <Text
              style={[
                styles.sortBtnText,
                { color: sortBy === 'price' ? COLORS.white : subTextColor },
              ]}
            >
              ₹ {t('Price')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results List */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={[styles.loadingText, { color: subTextColor }]}>Finding skilled workers...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadWorkers(selectedService); }}
              tintColor={COLORS.primary}
            />
          }
        >
          {filteredWorkers.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Ionicons name="search-outline" size={48} color={subTextColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No workers found</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>
                Try adjusting your search query or selecting a different service category.
              </Text>
            </View>
          ) : (
            filteredWorkers.map((worker, index) => (
              <View
                key={`${worker.id}-${worker.service}-${index}`}
                style={[styles.workerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              >
                <View style={styles.workerLeft}>
                  {worker.image ? (
                    <Image source={{ uri: worker.image }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatarFallback, { backgroundColor: COLORS.primaryLight }]}>
                      <Text style={styles.avatarInitial}>{worker.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={[styles.availDot, { backgroundColor: worker.available ? '#10B981' : '#9CA3AF' }]} />
                </View>

                <View style={styles.workerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.workerName, { color: textColor }]} numberOfLines={1}>
                      {worker.name}
                    </Text>
                    {worker.verified && (
                      <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.workerService}>{t(worker.service)}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={[styles.metaText, { color: textColor }]}>
                      {worker.rating.toFixed(1)}
                    </Text>
                    <Text style={{ color: '#D1D5DB' }}> · </Text>
                    <Text style={[styles.metaText, { color: subTextColor }]}>
                      {worker.experience}
                    </Text>
                    {worker.distance && (
                      <>
                        <Text style={{ color: '#D1D5DB' }}> · </Text>
                        <Ionicons name="location-outline" size={12} color={subTextColor} />
                        <Text style={[styles.metaText, { color: subTextColor }]}>{worker.distance}</Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.workerRight}>
                  <Text style={[styles.workerPrice, { color: textColor }]}>{worker.price}</Text>
                  <Text style={[styles.workerPriceUnit, { color: subTextColor }]}>{t('/hr')}</Text>
                  <TouchableOpacity
                    style={styles.bookMiniBtn}
                    onPress={() => handleOpenBooking(worker)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.bookMiniBtnText}>{t('Book')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Booking Sheet Modal */}
      <Modal
        visible={!!bookingWorker}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingWorker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  {t('Book Service')}
                </Text>
                <Text style={[styles.modalSub, { color: subTextColor }]}>
                  Direct Cooperative Booking
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setBookingWorker(null)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            {bookingWorker && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Worker Mini Summary */}
                <View style={[styles.bookingWorkerInfo, { backgroundColor: COLORS.primaryLight }]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.bookingWorkerName}>{bookingWorker.name}</Text>
                      {bookingWorker.verified && (
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                      )}
                    </View>
                    <Text style={styles.bookingWorkerService}>{t(bookingWorker.service)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.bookingWorkerRating}>{bookingWorker.rating.toFixed(1)} rating</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.bookingWorkerRate}>{bookingWorker.price}</Text>
                    <Text style={styles.bookingWorkerRateSub}>{t('/hr')}</Text>
                  </View>
                </View>

                {/* Duration Picker */}
                <Text style={[styles.formLabel, { color: textColor }]}>Service Duration</Text>
                <View style={styles.durationRow}>
                  {DURATION_OPTIONS.map(hrs => {
                    const isSelected = bookingHours === hrs;
                    return (
                      <TouchableOpacity
                        key={hrs}
                        style={[
                          styles.durationChip,
                          {
                            backgroundColor: isSelected ? COLORS.accent : inputBg,
                            borderColor: isSelected ? COLORS.accent : cardBorder,
                          },
                        ]}
                        onPress={() => setBookingHours(hrs)}
                      >
                        <Text
                          style={[
                            styles.durationChipText,
                            { color: isSelected ? COLORS.white : textColor },
                          ]}
                        >
                          {hrs} {hrs === 1 ? 'Hour' : 'Hours'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Time Slot */}
                <Text style={[styles.formLabel, { color: textColor }]}>Preferred Start Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeSlotsRow}>
                  {TIME_SLOTS.map(slot => {
                    const isSelected = bookingTime === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        style={[
                          styles.timeSlotChip,
                          {
                            backgroundColor: isSelected ? COLORS.primary : inputBg,
                            borderColor: isSelected ? COLORS.primary : cardBorder,
                          },
                        ]}
                        onPress={() => setBookingTime(slot)}
                      >
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={isSelected ? COLORS.white : subTextColor}
                        />
                        <Text
                          style={[
                            styles.timeSlotText,
                            { color: isSelected ? COLORS.white : textColor },
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Address */}
                <Text style={[styles.formLabel, { color: textColor }]}>Service Address</Text>
                <View style={[styles.inputBox, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                  <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                  <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="Enter your street, house number, area..."
                    placeholderTextColor={subTextColor}
                    value={serviceAddress}
                    onChangeText={setServiceAddress}
                  />
                </View>

                {/* Payment Option */}
                <Text style={[styles.formLabel, { color: textColor }]}>{t('Payment Methods')}</Text>
                <View style={styles.paymentMethodRow}>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      {
                        backgroundColor: paymentMethod === 'cash' ? COLORS.primaryLight : inputBg,
                        borderColor: paymentMethod === 'cash' ? COLORS.primary : cardBorder,
                      },
                    ]}
                    onPress={() => setPaymentMethod('cash')}
                  >
                    <Ionicons name="cash-outline" size={18} color={paymentMethod === 'cash' ? COLORS.primary : subTextColor} />
                    <Text style={[styles.paymentOptionText, { color: paymentMethod === 'cash' ? COLORS.primary : textColor }]}>
                      {t('Cash on Completion')}
                    </Text>
                    {paymentMethod === 'cash' && <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      {
                        backgroundColor: paymentMethod === 'razorpay' ? COLORS.primaryLight : inputBg,
                        borderColor: paymentMethod === 'razorpay' ? COLORS.primary : cardBorder,
                      },
                    ]}
                    onPress={() => setPaymentMethod('razorpay')}
                  >
                    <Ionicons name="card-outline" size={18} color={paymentMethod === 'razorpay' ? COLORS.primary : subTextColor} />
                    <Text style={[styles.paymentOptionText, { color: paymentMethod === 'razorpay' ? COLORS.primary : textColor }]}>
                      UPI / Online
                    </Text>
                    {paymentMethod === 'razorpay' && <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />}
                  </TouchableOpacity>
                </View>

                {/* Summary */}
                {(() => {
                  const rate = parseRate(bookingWorker.price);
                  const total = rate * bookingHours;
                  return (
                    <View style={[styles.priceSummaryBox, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                      <View style={styles.priceSummaryRow}>
                        <Text style={[styles.priceSummaryLabel, { color: subTextColor }]}>
                          Estimated ({bookingHours} hrs x ₹{rate})
                        </Text>
                        <Text style={[styles.priceSummaryValue, { color: textColor }]}>₹{total}</Text>
                      </View>
                      <View style={[styles.priceSummaryRow, { marginTop: 4, borderTopWidth: 1, borderTopColor: cardBorder, paddingTop: 6 }]}>
                        <Text style={[styles.priceSummaryTotalLabel, { color: textColor }]}>{t('Total Amount')}</Text>
                        <Text style={styles.priceSummaryTotalValue}>₹{total}</Text>
                      </View>
                    </View>
                  );
                })()}

                {/* Submit */}
                <TouchableOpacity
                  style={styles.confirmBookingBtn}
                  onPress={handleConfirmBooking}
                  disabled={submittingBooking}
                  activeOpacity={0.85}
                >
                  {submittingBooking ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.confirmBookingText}>{t('Confirm Booking')}</Text>
                      <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    </>
                  )}
                </TouchableOpacity>
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
  aiShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  aiShortcutText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterWrapper: { paddingBottom: 6 },
  filterRow: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: '700' },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultCount: { fontSize: 12, fontWeight: '600' },
  sortBtns: { flexDirection: 'row', gap: 8 },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  sortBtnText: { fontSize: 11, fontWeight: '700' },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  workerLeft: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 16 },
  avatarFallback: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  availDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  workerInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workerName: { fontSize: 14, fontWeight: '700', flex: 1 },
  workerService: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  metaText: { fontSize: 11, fontWeight: '600' },
  workerRight: { alignItems: 'flex-end', gap: 2 },
  workerPrice: { fontSize: 15, fontWeight: '900' },
  workerPriceUnit: { fontSize: 10, marginTop: -2 },
  bookMiniBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 4,
  },
  bookMiniBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
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
  bookingWorkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    marginBottom: 16,
  },
  bookingWorkerName: { fontSize: 15, fontWeight: '800' },
  bookingWorkerService: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  bookingWorkerRating: { fontSize: 11, color: '#4B5563' },
  bookingWorkerRate: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  bookingWorkerRateSub: { fontSize: 10, color: '#4B5563' },
  formLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 10,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeSlotsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  timeSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  paymentOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceSummaryBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 16,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSummaryLabel: { fontSize: 12, fontWeight: '600' },
  priceSummaryValue: { fontSize: 13, fontWeight: '700' },
  priceSummaryTotalLabel: { fontSize: 14, fontWeight: '800' },
  priceSummaryTotalValue: { fontSize: 18, fontWeight: '900', color: COLORS.accent },
  confirmBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    height: 52,
    borderRadius: 16,
  },
  confirmBookingText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
