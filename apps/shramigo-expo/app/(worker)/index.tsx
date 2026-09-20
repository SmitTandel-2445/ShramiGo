import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Switch, Modal, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getStoredUser, type AuthUser } from '@/features/auth/services';
import { getWorkerBookings, updateBookingStatus, markCashReceived, type Booking } from '@/features/bookings/services';
import { getWorkerAvailability, createWorkerAvailability } from '@/features/workers/services';

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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadData = async () => {
    try {
      const [u, bookingsData, availData] = await Promise.all([
        getStoredUser(),
        getWorkerBookings().catch(() => []),
        getWorkerAvailability().catch(() => []),
      ]);
      setUser(u);
      setBookings(bookingsData);
      if (availData.length > 0) {
        setIsAvailable(availData.some(a => a.is_available));
      }
    } catch (e) {
      console.error('Error loading worker dashboard data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleAvailability = async (value: boolean) => {
    setIsAvailable(value);
    try {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const todayDay = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
      await createWorkerAvailability({
        day_of_week: todayDay,
        start_time: '09:00',
        end_time: '18:00',
        is_available: value,
      }).catch(() => null);
    } catch {
      // Keep optimistic UI
    }
  };

  const handleUpdateStatus = async (bookingId: number, status: string) => {
    try {
      setUpdatingStatus(true);
      await updateBookingStatus(bookingId, status);
      await loadData();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status } : null);
      }
      Alert.alert(t('Status Updated'), `Booking status is now ${status.replace('_', ' ')}.`);
    } catch {
      Alert.alert(t('Error'), 'Failed to update booking status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCashCollection = async (bookingId: number) => {
    try {
      setUpdatingStatus(true);
      await markCashReceived(bookingId);
      await loadData();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, payment_status: 'paid' } : null);
      }
      Alert.alert(t('Payment Confirmed'), 'Cash payment recorded successfully.');
    } catch {
      Alert.alert(t('Error'), 'Failed to record cash payment.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.booking_date === todayStr);
  const activeBookings = bookings.filter(b => ['accepted', 'confirmed', 'in_progress'].includes(b.status.toLowerCase()));
  const completedToday = todayBookings.filter(b => b.status.toLowerCase() === 'completed');
  const todayEarnings = completedToday.reduce((sum, b) => sum + (b.worker_payout || 0), 0);
  const totalEarnings = bookings.filter(b => b.status.toLowerCase() === 'completed').reduce((sum, b) => sum + (b.worker_payout || 0), 0);

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
        {/* Hero Header */}
        <View style={styles.heroContainer}>
          <View style={styles.heroHeader}>
            <View style={styles.workerInfoRow}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarChar}>{user?.full_name?.charAt(0) || 'W'}</Text>
              </View>
              <View style={styles.workerMeta}>
                <Text style={styles.greetingText}>{t(getGreeting())},</Text>
                <View style={styles.nameRow}>
                  <Text style={styles.workerName}>{user?.full_name?.split(' ')[0] ?? 'Worker'}</Text>
                  {user?.is_verified && (
                    <View style={styles.miniVerified}>
                      <Ionicons name="checkmark-circle" size={16} color="#34D399" />
                    </View>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push('/(worker)/notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Duty Status Bar */}
          <View style={[styles.dutyCard, { backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)' }]}>
            <View style={styles.dutyLeft}>
              <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#10B981' : '#EF4444' }]} />
              <View>
                <Text style={styles.dutyTitle}>{t('Duty Status')}</Text>
                <Text style={styles.dutySub}>
                  {isAvailable ? t("You're Available") : t("You're Offline")}
                </Text>
              </View>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#6B7280', true: '#10B981' }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* 4 Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={[styles.statValue, { color: textColor }]}>₹{todayEarnings.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{t("Today's earnings")}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={[styles.statIconBg, { backgroundColor: '#FFF1E8' }]}>
                <Ionicons name="flash-outline" size={20} color={COLORS.accent} />
              </View>
              <Text style={[styles.statValue, { color: textColor }]}>{activeBookings.length}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{t('Active Jobs')}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={[styles.statIconBg, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="checkmark-done-outline" size={20} color="#16A34A" />
              </View>
              <Text style={[styles.statValue, { color: textColor }]}>{completedToday.length}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{t('Completed jobs today')}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={[styles.statIconBg, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="wallet-outline" size={20} color="#7C3AED" />
              </View>
              <Text style={[styles.statValue, { color: textColor }]}>₹{totalEarnings.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{t('Total Earnings')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('Quick Actions')}</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'briefcase', label: t('Job Requests'), route: '/(worker)/jobs', color: COLORS.accent, bg: '#FFF1E8' },
              { icon: 'calendar', label: t('My Schedule'), route: '/(worker)/availability', color: COLORS.primary, bg: COLORS.primaryLight },
              { icon: 'construct', label: t('Skills & Services'), route: '/(worker)/skills', color: '#7C3AED', bg: '#EDE9FE' },
              { icon: 'heart', label: 'Welfare', route: '/(worker)/welfare', color: '#DC2626', bg: '#FEE2E2' },
            ].map((action, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.actionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={[styles.actionCardLabel, { color: textColor }]} numberOfLines={2}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent / Today's Jobs */}
        <View style={[styles.section, { paddingBottom: 30 }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: textColor }]}>{t("Today's Jobs")}</Text>
              <Text style={[styles.sectionSub, { color: subTextColor }]}>
                {todayBookings.length} {todayBookings.length === 1 ? 'task' : 'tasks'} scheduled
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(worker)/jobs')} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>{t('View all jobs')} →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 24 }} />
          ) : todayBookings.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={32} color={subTextColor} />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>{t('No jobs scheduled for today')}</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>
                {t('Make sure your availability is turned ON to receive bookings.')}
              </Text>
              <TouchableOpacity
                style={styles.checkJobsBtn}
                onPress={() => router.push('/(worker)/jobs')}
                activeOpacity={0.85}
              >
                <Text style={styles.checkJobsBtnText}>{t('View All Bookings')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todayBookings.slice(0, 4).map(b => {
              const isCompleted = b.status.toLowerCase() === 'completed';
              const isInProgress = b.status.toLowerCase() === 'in_progress';
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.jobCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                  onPress={() => setSelectedBooking(b)}
                  activeOpacity={0.85}
                >
                  <View style={styles.jobMain}>
                    <View style={styles.jobTopRow}>
                      <View style={styles.jobIdTag}>
                        <Text style={styles.jobIdText}>#{b.id}</Text>
                      </View>
                      <View style={[
                        styles.statusChip,
                        {
                          backgroundColor: isCompleted ? '#DCFCE7' : isInProgress ? '#EDE9FE' : '#FEF3C7',
                        }
                      ]}>
                        <Text style={[
                          styles.statusChipText,
                          {
                            color: isCompleted ? '#16A34A' : isInProgress ? '#7C3AED' : '#D97706',
                          }
                        ]}>
                          {b.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.jobMetaRow}>
                      <Ionicons name="time-outline" size={15} color={subTextColor} />
                      <Text style={[styles.jobMetaText, { color: textColor }]}>
                        {b.booking_time} ({b.hours} hrs)
                      </Text>
                    </View>

                    <View style={styles.jobMetaRow}>
                      <Ionicons name="location-outline" size={15} color={subTextColor} />
                      <Text style={[styles.jobAddressText, { color: subTextColor }]} numberOfLines={1}>
                        {b.service_address || 'Service address specified'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.jobRightSide}>
                    <Text style={styles.payoutAmount}>₹{b.worker_payout}</Text>
                    <Text style={[styles.payoutLabel, { color: subTextColor }]}>{t('Payout')}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Interactive Job Details Modal */}
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
                style={styles.closeBtn}
                onPress={() => setSelectedBooking(null)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Status & Payout summary */}
                <View style={styles.modalSummaryBox}>
                  <View>
                    <Text style={styles.modalSummaryLabel}>{t('Worker Payout')}</Text>
                    <Text style={styles.modalSummaryPrice}>₹{selectedBooking.worker_payout}</Text>
                  </View>
                  <View style={[
                    styles.modalStatusBadge,
                    {
                      backgroundColor: selectedBooking.status === 'completed' ? '#DCFCE7' : '#FEF3C7'
                    }
                  ]}>
                    <Text style={{
                      fontWeight: '800',
                      fontSize: 12,
                      color: selectedBooking.status === 'completed' ? '#16A34A' : '#D97706',
                    }}>
                      {selectedBooking.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.modalDetailGroup}>
                  <Text style={[styles.modalGroupTitle, { color: textColor }]}>{t('Service Details')}</Text>
                  <View style={styles.modalRow}>
                    <Ionicons name="location" size={18} color={COLORS.primary} />
                    <Text style={[styles.modalRowText, { color: textColor }]}>
                      {selectedBooking.service_address}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Ionicons name="timer-outline" size={18} color={COLORS.primary} />
                    <Text style={[styles.modalRowText, { color: textColor }]}>
                      Duration: {selectedBooking.hours} Hours (@ ₹{selectedBooking.hourly_rate}/hr)
                    </Text>
                  </View>
                  {selectedBooking.description && (
                    <View style={styles.modalRow}>
                      <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                      <Text style={[styles.modalRowText, { color: textColor }]}>
                        {selectedBooking.description}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Quick Map Action */}
                <TouchableOpacity
                  style={[styles.mapBtn, { borderColor: cardBorder }]}
                  onPress={() => {
                    const addr = encodeURIComponent(selectedBooking.service_address);
                    Linking.openURL(`https://maps.google.com/?q=${addr}`);
                  }}
                >
                  <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.mapBtnText}>Open in Google Maps</Text>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  {selectedBooking.status.toLowerCase() === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        style={[styles.modalActionBtn, { backgroundColor: '#FEE2E2', flex: 1 }]}
                        onPress={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                        disabled={updatingStatus}
                      >
                        <Text style={{ color: '#DC2626', fontWeight: '800' }}>{t('Reject')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalActionBtn, { backgroundColor: COLORS.primary, flex: 1.5 }]}
                        onPress={() => handleUpdateStatus(selectedBooking.id, 'accepted')}
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? <ActivityIndicator color={COLORS.white} /> : (
                          <Text style={{ color: COLORS.white, fontWeight: '800' }}>{t('Accept')}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {['accepted', 'confirmed'].includes(selectedBooking.status.toLowerCase()) && (
                    <TouchableOpacity
                      style={[styles.modalActionBtn, { backgroundColor: '#7C3AED', width: '100%' }]}
                      onPress={() => handleUpdateStatus(selectedBooking.id, 'in_progress')}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? <ActivityIndicator color={COLORS.white} /> : (
                        <Text style={{ color: COLORS.white, fontWeight: '800' }}>{t('Start Job')}</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {selectedBooking.status.toLowerCase() === 'in_progress' && (
                    <View style={{ gap: 10 }}>
                      <TouchableOpacity
                        style={[styles.modalActionBtn, { backgroundColor: '#16A34A', width: '100%' }]}
                        onPress={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? <ActivityIndicator color={COLORS.white} /> : (
                          <Text style={{ color: COLORS.white, fontWeight: '800' }}>{t('Complete Job')}</Text>
                        )}
                      </TouchableOpacity>

                      {selectedBooking.payment_status !== 'paid' && (
                        <TouchableOpacity
                          style={[styles.modalActionBtn, { backgroundColor: '#FEF3C7', width: '100%' }]}
                          onPress={() => handleCashCollection(selectedBooking.id)}
                          disabled={updatingStatus}
                        >
                          <Text style={{ color: '#D97706', fontWeight: '800' }}>
                            💵 {t('Mark Cash Received')} (₹{selectedBooking.total_amount})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
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
  heroContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  workerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarChar: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
  },
  workerMeta: {
    gap: 2,
  },
  greetingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.82)',
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workerName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  miniVerified: {
    padding: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dutyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dutyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dutyTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  dutySub: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    height: 28,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 4,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
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
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  checkJobsBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  checkJobsBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  jobMain: {
    flex: 1,
    gap: 4,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  jobIdTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  jobIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobMetaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  jobAddressText: {
    fontSize: 12,
    flex: 1,
  },
  jobRightSide: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  payoutAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
  },
  payoutLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  modalSummaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalSummaryPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  modalDetailGroup: {
    gap: 10,
    marginBottom: 16,
  },
  modalGroupTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalRowText: {
    fontSize: 14,
    flex: 1,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 18,
  },
  mapBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  modalActions: {
    gap: 10,
  },
  modalActionBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
