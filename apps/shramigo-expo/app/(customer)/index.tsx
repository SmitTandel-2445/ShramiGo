import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Image, Modal, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getStoredUser, type AuthUser } from '@/features/auth/services';
import { getWorkers, type Worker } from '@/features/workers/services';
import { getCustomerProfile, type CustomerProfile } from '@/features/auth/profileServices';
import { createBooking } from '@/features/bookings/services';

const SERVICE_CATEGORIES = [
  { name: 'Electrician', icon: 'flash', color: '#FF5A00', bg: '#FFF1E8' },
  { name: 'Plumber', icon: 'water', color: '#087F7A', bg: '#E6F7F5' },
  { name: 'Carpenter', icon: 'hammer', color: '#FF5A00', bg: '#FFF1E8' },
  { name: 'Cleaner', icon: 'sparkles', color: '#087F7A', bg: '#E6F7F5' },
  { name: 'Painter', icon: 'color-palette', color: '#FF5A00', bg: '#FFF1E8' },
  { name: 'Driver', icon: 'car', color: '#087F7A', bg: '#E6F7F5' },
  { name: 'AC Repair', icon: 'snow', color: '#3B82F6', bg: '#EFF6FF' },
  { name: 'Mason', icon: 'construct', color: '#92400E', bg: '#FEF3C7' },
  { name: 'Appliance Repair', icon: 'tv', color: '#7C3AED', bg: '#EDE9FE' },
  { name: 'Gardener', icon: 'leaf', color: '#16A34A', bg: '#DCFCE7' },
];

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
const DURATION_OPTIONS = [1, 2, 3, 4, 8];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning,';
  if (h < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Set your location');
  const [selectedService, setSelectedService] = useState('All');

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

  const loadData = async () => {
    try {
      const [u, workersData, prof] = await Promise.all([
        getStoredUser(),
        getWorkers().catch(() => []),
        getCustomerProfile().catch(() => null),
      ]);
      setUser(u);
      setWorkers(workersData);
      setProfile(prof);
      if (prof?.city) {
        setLocationLabel(prof.address ? `${prof.city} (${prof.address.slice(0, 18)}...)` : prof.city);
        if (prof.address && !serviceAddress) setServiceAddress(prof.address);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = () => { setRefreshing(true); loadData(); };

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

  const filteredWorkers = selectedService === 'All'
    ? workers
    : workers.filter(w => w.service.toLowerCase().includes(selectedService.toLowerCase()));

  const parseHourlyRate = (rateStr: string) => {
    const num = parseFloat(rateStr.replace(/[^0-9.]/g, ''));
    return isNaN(num) || num <= 0 ? 300 : num;
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.primary }} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Teal Hero Header */}
        <View style={styles.heroContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={() => router.push('/(customer)/profile')}
                activeOpacity={0.8}
              >
                <Ionicons name="location" size={14} color="#FFF" />
                <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
                <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
              <Text style={styles.greeting}>
                {t(getGreeting())}, <Text style={{ fontWeight: '900', color: '#FFF' }}>{user?.full_name?.split(' ')[0] ?? 'there'} 👋</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push('/(customer)/notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFF" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Search Bar inside Hero Header */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/(customer)/search')}
            activeOpacity={0.9}
          >
            <Ionicons name="search" size={18} color={COLORS.primary} />
            <Text style={styles.searchPlaceholder}>
              {t('Search for Electrician, Plumber...')}
            </Text>
            <View style={styles.searchFilterIcon}>
              <Ionicons name="options-outline" size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* AI Smart Match Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => router.push('/(customer)/matching')}
          activeOpacity={0.9}
        >
          <View style={styles.aiBannerCircle1} />
          <View style={styles.aiBannerCircle2} />
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiIconBg}>
              <Ionicons name="sparkles" size={20} color={COLORS.white} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI POWERED MATCH</Text>
              </View>
              <Text style={styles.aiBannerTitle}>{t('Find your best match')}</Text>
              <Text style={styles.aiBannerDesc}>{t('Get smart worker recommendations near you.')}</Text>
            </View>
          </View>
          <View style={styles.aiArrowCircle}>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {/* Popular Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{t('Popular Services')}</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/search')}>
              <Text style={styles.seeAll}>{t('See all')} →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesRow}>
            {SERVICE_CATEGORIES.map(svc => {
              const isSelected = selectedService === svc.name;
              return (
                <TouchableOpacity
                  key={svc.name}
                  style={[
                    styles.serviceChip,
                    {
                      backgroundColor: isSelected ? COLORS.primary : cardBg,
                      borderColor: isSelected ? COLORS.primary : cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedService(isSelected ? 'All' : svc.name)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.serviceIconWrap, { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : svc.bg }]}>
                    <Ionicons
                      name={svc.icon as any}
                      size={22}
                      color={isSelected ? COLORS.white : svc.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.serviceChipLabel,
                      { color: isSelected ? COLORS.white : textColor },
                    ]}
                    numberOfLines={1}
                  >
                    {t(svc.name)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Top Rated Workers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: textColor }]}>{t('Top Rated Workers')}</Text>
              <Text style={[styles.sectionSubtitle, { color: subTextColor }]}>
                {t('Verified workers from your local cooperative.')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(customer)/search')}>
              <Text style={styles.seeAll}>{t('View all')}</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} size="large" />
          ) : filteredWorkers.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Ionicons name="search-outline" size={40} color={subTextColor} />
              <Text style={[styles.emptyText, { color: subTextColor }]}>
                No workers found{selectedService !== 'All' ? ` for ${selectedService}` : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.workersList}>
              {filteredWorkers.slice(0, 8).map((worker, index) => (
                <WorkerCard
                  key={`${worker.id}-${worker.service}-${index}`}
                  worker={worker}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                  textColor={textColor}
                  subTextColor={subTextColor}
                  onBook={() => handleOpenBooking(worker)}
                  t={t}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Interactive Worker Detail & Instant Booking Sheet */}
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
                {/* Worker Mini Card */}
                <View style={[styles.bookingWorkerInfo, { backgroundColor: COLORS.primaryLight }]}>
                  <View style={styles.bookingAvatarWrap}>
                    {bookingWorker.image ? (
                      <Image source={{ uri: bookingWorker.image }} style={styles.bookingAvatarImg} />
                    ) : (
                      <View style={styles.bookingAvatarFallback}>
                        <Text style={styles.bookingAvatarInitial}>{bookingWorker.name.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
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

                {/* Preferred Time Slot */}
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

                {/* Service Address */}
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

                {/* Additional Notes */}
                <Text style={[styles.formLabel, { color: textColor }]}>Task Details / Instructions</Text>
                <View style={[styles.inputBox, styles.textAreaBox, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                  <TextInput
                    style={[styles.textInput, { color: textColor, textAlignVertical: 'top' }]}
                    placeholder="Describe specific work needed (e.g. 2 switchboards replacement)..."
                    placeholderTextColor={subTextColor}
                    value={bookingDesc}
                    onChangeText={setBookingDesc}
                    multiline
                    numberOfLines={2}
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

                {/* Price Breakdown */}
                {(() => {
                  const rate = parseHourlyRate(bookingWorker.price);
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

                {/* Submit Booking Button */}
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
    </View>
  );
}

function WorkerCard({
  worker, cardBg, cardBorder, textColor, subTextColor, onBook, t,
}: {
  worker: Worker; cardBg: string; cardBorder: string; textColor: string;
  subTextColor: string; onBook: () => void; t: (k: string) => string;
}) {
  return (
    <View style={[styles.workerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={styles.workerCardTop}>
        <View style={styles.workerAvatar}>
          {worker.image ? (
            <Image source={{ uri: worker.image }} style={styles.workerAvatarImg} />
          ) : (
            <View style={[styles.workerAvatarFallback, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={styles.workerAvatarInitial}>{worker.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={[styles.availBadge, { backgroundColor: worker.available ? '#10B981' : '#9CA3AF' }]} />
        </View>

        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text style={[styles.workerName, { color: textColor }]} numberOfLines={1}>{worker.name}</Text>
            {worker.verified && <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} />}
          </View>
          <Text style={[styles.workerService, { color: COLORS.primary }]}>{t(worker.service)}</Text>
          <View style={styles.workerMeta}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.workerRating, { color: subTextColor }]}>
              {worker.rating.toFixed(1)} ({worker.reviews})
            </Text>
            {worker.distance && (
              <>
                <Text style={{ color: '#D1D5DB' }}> · </Text>
                <Ionicons name="location-outline" size={12} color={subTextColor} />
                <Text style={[styles.workerRating, { color: subTextColor }]}>{worker.distance}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.workerPriceCol}>
          <Text style={[styles.workerPrice, { color: textColor }]}>{worker.price}</Text>
          <Text style={[styles.workerPriceUnit, { color: subTextColor }]}>{t('/hr')}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
        <Text style={styles.bookBtnText}>{t('Book Now')}</Text>
        <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { paddingBottom: 30 },
  heroContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: { flex: 1, gap: 4 },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
  },
  locationText: { fontSize: 12, fontWeight: '700', color: '#FFF', maxWidth: 180 },
  greeting: { fontSize: 20, fontWeight: '700', marginTop: 2, color: 'rgba(255,255,255,0.92)' },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchPlaceholder: { flex: 1, fontSize: 14 },
  searchFilterIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 22,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  aiBannerCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  aiBannerCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  aiBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  aiIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  aiBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  aiBannerTitle: { fontSize: 15, fontWeight: '800', color: COLORS.white },
  aiBannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  aiArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  seeAll: { fontSize: 13, color: COLORS.accent, fontWeight: '700' },
  sectionSubtitle: { fontSize: 12, marginTop: 2 },
  servicesRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  serviceChip: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    minWidth: 80,
    borderWidth: 1,
  },
  serviceIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceChipLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  workersList: { paddingHorizontal: 20, gap: 12 },
  workerCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  workerCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  workerAvatar: { position: 'relative' },
  workerAvatarImg: { width: 52, height: 52, borderRadius: 16 },
  workerAvatarFallback: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  workerAvatarInitial: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  availBadge: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: COLORS.white },
  workerInfo: { flex: 1, gap: 3 },
  workerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workerName: { fontSize: 15, fontWeight: '700', flex: 1 },
  workerService: { fontSize: 12, fontWeight: '600' },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  workerRating: { fontSize: 11 },
  workerPriceCol: { alignItems: 'flex-end' },
  workerPrice: { fontSize: 16, fontWeight: '900' },
  workerPriceUnit: { fontSize: 11 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    height: 42,
    borderRadius: 14,
  },
  bookBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.white },
  emptyCard: { borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, marginHorizontal: 20 },
  emptyText: { fontSize: 14, marginTop: 8 },
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
  bookingAvatarWrap: {},
  bookingAvatarImg: { width: 48, height: 48, borderRadius: 14 },
  bookingAvatarFallback: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  bookingAvatarInitial: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
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
  textAreaBox: {
    paddingVertical: 8,
    minHeight: 64,
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
