import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Image, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getAIRecommendations, type AIRecommendationWorker } from '@/features/matching/services';
import { createBooking } from '@/features/bookings/services';
import { getCustomerProfile } from '@/features/auth/profileServices';

const QUICK_PROMPTS = [
  'Fix leaking kitchen tap & pipe',
  'Ceiling fan wiring & installation',
  'Deep clean 2BHK flat',
  'Living room wall painting',
  'AC cooling gas refill & repair',
  'Main entrance door lock repair',
];

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
const DURATION_OPTIONS = [1, 2, 3, 4, 8];

export default function AIMatchingScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ explanation: string; workers: AIRecommendationWorker[] } | null>(null);
  const [error, setError] = useState('');

  // Booking Modal State
  const [bookingWorker, setBookingWorker] = useState<AIRecommendationWorker | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingHours, setBookingHours] = useState(2);
  const [serviceAddress, setServiceAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay'>('cash');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#242424' : '#F3F4F6';

  const handleSearch = async () => {
    if (!description.trim()) {
      setError('Please describe what service you need.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const data = await getAIRecommendations({ description: description.trim(), limit: 5 });
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to get AI recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = async (worker: AIRecommendationWorker) => {
    setBookingWorker(worker);
    try {
      const prof = await getCustomerProfile();
      if (prof?.address) setServiceAddress(prof.address);
    } catch {
      // Ignore
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
        description: description.trim() || `${bookingWorker.service} recommendation request`,
        payment_method: paymentMethod,
      });

      Alert.alert(
        t('Booking Confirmed!'),
        `Your request has been sent to ${bookingWorker.name}.`,
        [
          {
            text: t('View Bookings'),
            onPress: () => {
              setBookingWorker(null);
              router.push('/(customer)/bookings');
            },
          },
          { text: 'OK', onPress: () => setBookingWorker(null) },
        ]
      );
    } catch (err: any) {
      Alert.alert(t('Error'), err.message || 'Failed to place booking.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: cardBg, borderColor: cardBorder }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.topTitle, { color: textColor }]}>AI Matchmaking</Text>
          <Text style={[styles.topSub, { color: subTextColor }]}>Smart Worker Recommendations</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerCircle1} />
          <View style={styles.bannerCircle2} />
          <View style={styles.bannerIcon}>
            <Ionicons name="sparkles" size={28} color={COLORS.white} />
          </View>
          <Text style={styles.bannerTitle}>Smart AI Matching</Text>
          <Text style={styles.bannerDesc}>
            Type or tap a problem description in plain words and our algorithm will rank the best verified workers nearby.
          </Text>
        </View>

        {/* Quick Suggestion Chips */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: subTextColor }]}>POPULAR ISSUES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsRow}>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.promptChip, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => setDescription(prompt)}
              >
                <Ionicons name="sparkles-outline" size={13} color={COLORS.primary} />
                <Text style={[styles.promptChipText, { color: textColor }]}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Form */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: textColor }]}>Describe your problem or service requirement</Text>
          <View style={[styles.textAreaWrapper, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <TextInput
              style={[styles.textArea, { color: textColor }]}
              placeholder="e.g. My bathroom pipeline is leaking and need a plumber with replacement parts urgently..."
              placeholderTextColor={subTextColor}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearch}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color={COLORS.white} />
                <Text style={styles.searchBtnText}>Find Best Matches</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {result && (
          <View style={styles.results}>
            <View style={[styles.explanationCard, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary + '30' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Ionicons name="bulb" size={16} color={COLORS.primary} />
                <Text style={styles.explanationTitle}>AI Match Analysis</Text>
              </View>
              <Text style={styles.explanationText}>{result.explanation}</Text>
            </View>

            <Text style={[styles.resultsTitle, { color: textColor }]}>
              Top Recommendations ({result.workers.length})
            </Text>

            {result.workers.map((w, i) => (
              <View
                key={`${w.id}-${i}`}
                style={[styles.workerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.matchRank}>
                    <Text style={styles.matchRankText}>#{i + 1}</Text>
                  </View>
                  <View style={styles.matchScoreBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                    <Text style={styles.matchScoreText}>{Math.round(w.match_score * 100)}% Match</Text>
                  </View>
                </View>

                <View style={styles.workerMain}>
                  <View style={styles.workerInfo}>
                    <Text style={[styles.workerName, { color: textColor }]}>{w.name}</Text>
                    <Text style={styles.workerService}>{w.service}</Text>

                    <View style={styles.workerMeta}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={[styles.metaText, { color: textColor }]}>{w.rating.toFixed(1)}</Text>
                      {w.distance_km && (
                        <>
                          <Text style={{ color: '#D1D5DB' }}> · </Text>
                          <Ionicons name="location-outline" size={12} color={subTextColor} />
                          <Text style={[styles.metaText, { color: subTextColor }]}>
                            {w.distance_km.toFixed(1)} km
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  <View style={styles.workerRight}>
                    <Text style={[styles.workerPrice, { color: textColor }]}>₹{w.price}</Text>
                    <Text style={[styles.perHour, { color: subTextColor }]}>{t('/hr')}</Text>
                  </View>
                </View>

                {w.match_reasons.length > 0 && (
                  <View style={[styles.reasonBox, { backgroundColor: isDark ? '#262626' : '#F9FAFB' }]}>
                    <Text style={[styles.reasonTitle, { color: COLORS.primary }]}>Why this match:</Text>
                    <Text style={[styles.matchReason, { color: subTextColor }]}>
                      {w.match_reasons.join(' · ')}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.bookDirectBtn}
                  onPress={() => handleOpenBooking(w)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.bookDirectBtnText}>{t('Book Service')}</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
                  Instant Match Booking
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
                <View style={[styles.bookingWorkerInfo, { backgroundColor: COLORS.primaryLight }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingWorkerName}>{bookingWorker.name}</Text>
                    <Text style={styles.bookingWorkerService}>{bookingWorker.service}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={{ fontSize: 11, color: '#4B5563' }}>{bookingWorker.rating.toFixed(1)} rating</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: COLORS.primary }}>₹{bookingWorker.price}</Text>
                    <Text style={{ fontSize: 10, color: '#4B5563' }}>{t('/hr')}</Text>
                  </View>
                </View>

                {/* Duration */}
                <Text style={[styles.formLabel, { color: textColor }]}>Duration</Text>
                <View style={styles.durationRow}>
                  {DURATION_OPTIONS.map(hrs => (
                    <TouchableOpacity
                      key={hrs}
                      style={[
                        styles.durationChip,
                        {
                          backgroundColor: bookingHours === hrs ? COLORS.accent : inputBg,
                          borderColor: bookingHours === hrs ? COLORS.accent : cardBorder,
                        },
                      ]}
                      onPress={() => setBookingHours(hrs)}
                    >
                      <Text
                        style={[
                          styles.durationChipText,
                          { color: bookingHours === hrs ? COLORS.white : textColor },
                        ]}
                      >
                        {hrs} hr{hrs > 1 ? 's' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Time Slot */}
                <Text style={[styles.formLabel, { color: textColor }]}>Start Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeSlotsRow}>
                  {TIME_SLOTS.map(slot => (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.timeSlotChip,
                        {
                          backgroundColor: bookingTime === slot ? COLORS.primary : inputBg,
                          borderColor: bookingTime === slot ? COLORS.primary : cardBorder,
                        },
                      ]}
                      onPress={() => setBookingTime(slot)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          { color: bookingTime === slot ? COLORS.white : textColor },
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Address */}
                <Text style={[styles.formLabel, { color: textColor }]}>Service Address</Text>
                <View style={[styles.inputBox, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                  <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                  <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="Enter delivery address..."
                    placeholderTextColor={subTextColor}
                    value={serviceAddress}
                    onChangeText={setServiceAddress}
                  />
                </View>

                {/* Summary */}
                {(() => {
                  const rate = parseFloat(String(bookingWorker.price)) || 300;
                  const total = rate * bookingHours;
                  return (
                    <View style={[styles.priceSummaryBox, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, color: subTextColor }}>Estimated ({bookingHours} hrs x ₹{rate})</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>₹{total}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: cardBorder, paddingTop: 6, marginTop: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: textColor }}>{t('Total Amount')}</Text>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.accent }}>₹{total}</Text>
                      </View>
                    </View>
                  );
                })()}

                <TouchableOpacity
                  style={styles.confirmBookingBtn}
                  onPress={handleConfirmBooking}
                  disabled={submittingBooking}
                >
                  {submittingBooking ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.confirmBookingText}>{t('Confirm Booking')}</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  topTitle: { fontSize: 20, fontWeight: '900' },
  topSub: { fontSize: 12 },
  scroll: { paddingBottom: 40 },
  bannerCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  bannerCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.white },
  bannerDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 18,
  },
  section: { paddingHorizontal: 20, marginTop: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8 },
  promptsRow: { gap: 8, paddingBottom: 4 },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  promptChipText: { fontSize: 12, fontWeight: '600' },
  inputSection: { paddingHorizontal: 20, gap: 10, marginTop: 14 },
  inputLabel: { fontSize: 13, fontWeight: '700' },
  textAreaWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  textArea: { fontSize: 14, minHeight: 90 },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626' },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    height: 52,
    borderRadius: 16,
    marginTop: 4,
  },
  searchBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
  results: { paddingHorizontal: 20, marginTop: 20 },
  explanationCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  explanationTitle: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  explanationText: { fontSize: 13, color: '#374151', lineHeight: 18 },
  resultsTitle: { fontSize: 17, fontWeight: '900', marginBottom: 12 },
  workerCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchRank: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  matchRankText: { fontSize: 11, fontWeight: '900', color: COLORS.primary },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  matchScoreText: { fontSize: 11, fontWeight: '800', color: '#16A34A' },
  workerMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  workerInfo: { flex: 1, gap: 2 },
  workerName: { fontSize: 15, fontWeight: '800' },
  workerService: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 11 },
  workerRight: { alignItems: 'flex-end' },
  workerPrice: { fontSize: 17, fontWeight: '900' },
  perHour: { fontSize: 10 },
  reasonBox: {
    padding: 10,
    borderRadius: 12,
    gap: 2,
  },
  reasonTitle: { fontSize: 10, fontWeight: '800' },
  matchReason: { fontSize: 12, lineHeight: 16 },
  bookDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    height: 42,
    borderRadius: 12,
  },
  bookDirectBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.white },
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
  formLabel: { fontSize: 13, fontWeight: '800', marginBottom: 8, marginTop: 10 },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  durationChipText: { fontSize: 12, fontWeight: '700' },
  timeSlotsRow: { gap: 8, paddingBottom: 4 },
  timeSlotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeSlotText: { fontSize: 12, fontWeight: '700' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
  },
  textInput: { flex: 1, fontSize: 14 },
  priceSummaryBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 16,
  },
  confirmBookingBtn: {
    backgroundColor: COLORS.accent,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBookingText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});
