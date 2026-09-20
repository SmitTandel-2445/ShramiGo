import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput, Modal, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getWorkerBookings, updateBookingStatus, markCashReceived, type Booking,
} from '@/features/bookings/services';

const TABS = ['All', 'Pending', 'Active', 'Completed'];

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', label: 'PENDING' };
    case 'accepted':
    case 'confirmed':
      return { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE', label: 'ACCEPTED' };
    case 'in_progress':
      return { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE', label: 'IN PROGRESS' };
    case 'completed':
      return { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0', label: 'COMPLETED' };
    case 'cancelled':
      return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA', label: 'CANCELLED' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', label: status.toUpperCase() };
  }
}

export default function WorkerJobsScreen() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#242424' : '#F3F4F6';

  const loadBookings = async () => {
    try {
      const data = await getWorkerBookings();
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      setUpdating(bookingId);
      await updateBookingStatus(bookingId, newStatus);
      await loadBookings();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      }
      Alert.alert(t('Updated'), `Job status marked as ${newStatus.replace('_', ' ')}.`);
    } catch {
      Alert.alert(t('Error'), 'Failed to update job status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleCashCollection = async (bookingId: number) => {
    try {
      setUpdating(bookingId);
      await markCashReceived(bookingId);
      await loadBookings();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, payment_status: 'paid' } : null);
      }
      Alert.alert(t('Success'), 'Payment marked as received.');
    } catch {
      Alert.alert(t('Error'), 'Failed to record cash payment.');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = bookings.filter(b => {
    const s = b.status.toLowerCase();
    let matchesTab = true;
    if (activeTab === 'Pending') matchesTab = s === 'pending';
    else if (activeTab === 'Active') matchesTab = ['accepted', 'confirmed', 'in_progress'].includes(s);
    else if (activeTab === 'Completed') matchesTab = s === 'completed';

    if (!matchesTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const addr = (b.service_address || '').toLowerCase();
      const idStr = String(b.id);
      const desc = (b.description || '').toLowerCase();
      return addr.includes(q) || idStr.includes(q) || desc.includes(q);
    }
    return true;
  });

  const getTabCount = (tab: string) => {
    if (tab === 'All') return bookings.length;
    if (tab === 'Pending') return bookings.filter(b => b.status.toLowerCase() === 'pending').length;
    if (tab === 'Active') return bookings.filter(b => ['accepted', 'confirmed', 'in_progress'].includes(b.status.toLowerCase())).length;
    if (tab === 'Completed') return bookings.filter(b => b.status.toLowerCase() === 'completed').length;
    return 0;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>{t('Job Requests')}</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>{t('Jobs assigned to you')}</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{bookings.length} Total</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: inputBg, borderColor: cardBorder }]}>
          <Ionicons name="search-outline" size={18} color={subTextColor} />
          <TextInput
            placeholder={t('Search jobs...')}
            placeholderTextColor={subTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: textColor }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={subTextColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map(tab => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isActive ? COLORS.primary : cardBg,
                    borderColor: isActive ? COLORS.primary : cardBorder,
                  },
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    { color: isActive ? COLORS.white : subTextColor },
                  ]}
                >
                  {t(tab)}
                </Text>
                <View
                  style={[
                    styles.tabChipBadge,
                    {
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : isDark ? '#2D2D2D' : '#E5E7EB',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabChipBadgeText,
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

      {/* Main List */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={[styles.loadingText, { color: subTextColor }]}>{t('Loading your jobs...')}</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadBookings(); }}
              tintColor={COLORS.primary}
            />
          }
          data={filtered}
          keyExtractor={(b) => String(b.id)}
          ListEmptyComponent={
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="briefcase-outline" size={38} color={subTextColor} />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                {searchQuery ? t('No matching jobs found') : t('No job requests yet.')}
              </Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>
                {searchQuery
                  ? t('Try adjusting your search query or clear the filter.')
                  : t('Make sure your availability is turned ON to receive bookings.')}
              </Text>
            </View>
          }
          renderItem={({ item: b }) => {
              const style = getStatusStyle(b.status);
              const isPending = b.status.toLowerCase() === 'pending';
              const isAccepted = ['accepted', 'confirmed'].includes(b.status.toLowerCase());
              const isInProgress = b.status.toLowerCase() === 'in_progress';
              const isCompleted = b.status.toLowerCase() === 'completed';
              const isUpdatingThis = updating === b.id;

              return (
                <View
                  style={[styles.jobCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                >
                  {/* Top Bar */}
                  <View style={styles.jobHeader}>
                    <View style={styles.jobIdRow}>
                      <View style={styles.idBadge}>
                        <Text style={styles.idBadgeText}>#{b.id}</Text>
                      </View>
                      <View style={styles.dateTimeRow}>
                        <Ionicons name="calendar-outline" size={13} color={subTextColor} />
                        <Text style={[styles.dateTimeText, { color: subTextColor }]}>
                          {b.booking_date} · {b.booking_time}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: style.bg, borderColor: style.border }]}>
                      <Text style={[styles.statusBadgeText, { color: style.text }]}>{style.label}</Text>
                    </View>
                  </View>

                  {/* Body Info */}
                  <TouchableOpacity
                    style={styles.jobBody}
                    onPress={() => setSelectedBooking(b)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
                      <Text style={[styles.addressText, { color: textColor }]} numberOfLines={2}>
                        {b.service_address || 'Customer address provided upon acceptance'}
                      </Text>
                    </View>

                    <View style={styles.specsRow}>
                      <View style={styles.specChip}>
                        <Ionicons name="time-outline" size={13} color={subTextColor} />
                        <Text style={[styles.specText, { color: subTextColor }]}>
                          {b.hours} {b.hours === 1 ? 'Hour' : 'Hours'}
                        </Text>
                      </View>

                      <View style={styles.specChip}>
                        <Ionicons name="pricetag-outline" size={13} color={subTextColor} />
                        <Text style={[styles.specText, { color: subTextColor }]}>
                          ₹{b.hourly_rate}/hr
                        </Text>
                      </View>

                      <View style={styles.specChip}>
                        <Ionicons name="card-outline" size={13} color={subTextColor} />
                        <Text style={[styles.specText, { color: subTextColor }]}>
                          {b.payment_method === 'cash' ? 'Cash' : 'Online'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Footer & Actions */}
                  <View style={[styles.jobFooter, { borderTopColor: cardBorder }]}>
                    <View style={styles.payoutCol}>
                      <Text style={[styles.payoutLabel, { color: subTextColor }]}>{t('Earned')}</Text>
                      <Text style={styles.payoutAmount}>₹{b.worker_payout.toLocaleString()}</Text>
                    </View>

                    <View style={styles.actionsRow}>
                      {isPending && (
                        <>
                          <TouchableOpacity
                            style={[styles.btnSmall, styles.btnReject]}
                            onPress={() => handleStatusUpdate(b.id, 'cancelled')}
                            disabled={isUpdatingThis}
                          >
                            <Text style={styles.btnRejectText}>{t('Reject')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.btnSmall, styles.btnAccept]}
                            onPress={() => handleStatusUpdate(b.id, 'accepted')}
                            disabled={isUpdatingThis}
                          >
                            {isUpdatingThis ? (
                              <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                              <Text style={styles.btnAcceptText}>{t('Accept')}</Text>
                            )}
                          </TouchableOpacity>
                        </>
                      )}

                      {isAccepted && (
                        <TouchableOpacity
                          style={[styles.btnSmall, styles.btnStart]}
                          onPress={() => handleStatusUpdate(b.id, 'in_progress')}
                          disabled={isUpdatingThis}
                        >
                          {isUpdatingThis ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                          ) : (
                            <Text style={styles.btnStartText}>{t('Start Job')}</Text>
                          )}
                        </TouchableOpacity>
                      )}

                      {isInProgress && (
                        <TouchableOpacity
                          style={[styles.btnSmall, styles.btnComplete]}
                          onPress={() => handleStatusUpdate(b.id, 'completed')}
                          disabled={isUpdatingThis}
                        >
                          {isUpdatingThis ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                          ) : (
                            <Text style={styles.btnCompleteText}>{t('Complete Job')}</Text>
                          )}
                        </TouchableOpacity>
                      )}

                      {isCompleted && (
                        <TouchableOpacity
                          style={[styles.btnSmall, styles.btnDetails]}
                          onPress={() => setSelectedBooking(b)}
                        >
                          <Text style={[styles.btnDetailsText, { color: COLORS.primary }]}>Details</Text>
                          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
          }}
        />
      )}

      {/* Job Details Modal */}
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
                {/* Financial Summary */}
                <View style={styles.modalBanner}>
                  <View>
                    <Text style={styles.modalBannerLabel}>{t('Your Payout')}</Text>
                    <Text style={styles.modalBannerAmount}>₹{selectedBooking.worker_payout.toLocaleString()}</Text>
                  </View>
                  <View style={styles.modalBannerRight}>
                    <Text style={styles.modalBannerTotalLabel}>Customer Total</Text>
                    <Text style={styles.modalBannerTotalAmount}>₹{selectedBooking.total_amount}</Text>
                  </View>
                </View>

                {/* Status and Details */}
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, { color: textColor }]}>{t('Customer Details')}</Text>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="location" size={18} color={COLORS.primary} />
                    <Text style={[styles.modalInfoText, { color: textColor }]}>
                      {selectedBooking.service_address}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="time" size={18} color={COLORS.primary} />
                    <Text style={[styles.modalInfoText, { color: textColor }]}>
                      {selectedBooking.hours} Hours (@ ₹{selectedBooking.hourly_rate}/hr)
                    </Text>
                  </View>

                  {selectedBooking.description && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="chatbox-ellipses" size={18} color={COLORS.primary} />
                      <Text style={[styles.modalInfoText, { color: textColor }]}>
                        {selectedBooking.description}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Navigation Button */}
                <TouchableOpacity
                  style={[styles.actionOutlineBtn, { borderColor: cardBorder }]}
                  onPress={() => {
                    const addr = encodeURIComponent(selectedBooking.service_address);
                    Linking.openURL(`https://maps.google.com/?q=${addr}`);
                  }}
                >
                  <Ionicons name="navigate" size={18} color={COLORS.primary} />
                  <Text style={styles.actionOutlineBtnText}>Get Directions in Maps</Text>
                </TouchableOpacity>

                {/* Status Modifiers */}
                <View style={{ gap: 10, marginTop: 10 }}>
                  {selectedBooking.status.toLowerCase() === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: '#FEE2E2', flex: 1 }]}
                        onPress={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                        disabled={updating === selectedBooking.id}
                      >
                        <Text style={{ color: '#DC2626', fontWeight: '800' }}>{t('Reject')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: COLORS.primary, flex: 1.5 }]}
                        onPress={() => handleStatusUpdate(selectedBooking.id, 'accepted')}
                        disabled={updating === selectedBooking.id}
                      >
                        {updating === selectedBooking.id ? (
                          <ActivityIndicator color={COLORS.white} />
                        ) : (
                          <Text style={{ color: COLORS.white, fontWeight: '800' }}>{t('Accept')}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {['accepted', 'confirmed'].includes(selectedBooking.status.toLowerCase()) && (
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: '#7C3AED' }]}
                      onPress={() => handleStatusUpdate(selectedBooking.id, 'in_progress')}
                      disabled={updating === selectedBooking.id}
                    >
                      {updating === selectedBooking.id ? (
                        <ActivityIndicator color={COLORS.white} />
                      ) : (
                        <Text style={{ color: COLORS.white, fontWeight: '800' }}>{t('Start Job')}</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {selectedBooking.status.toLowerCase() === 'in_progress' && (
                    <View style={{ gap: 10 }}>
                      <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: '#16A34A' }]}
                        onPress={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                        disabled={updating === selectedBooking.id}
                      >
                        {updating === selectedBooking.id ? (
                          <ActivityIndicator color={COLORS.white} />
                        ) : (
                          <Text style={{ color: COLORS.white, fontWeight: '800' }}>{t('Complete Job')}</Text>
                        )}
                      </TouchableOpacity>

                      {selectedBooking.payment_status !== 'paid' && (
                        <TouchableOpacity
                          style={[styles.modalBtn, { backgroundColor: '#FEF3C7' }]}
                          onPress={() => handleCashCollection(selectedBooking.id)}
                          disabled={updating === selectedBooking.id}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 13, marginTop: 2 },
  totalBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalBadgeText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  tabsWrapper: {
    paddingBottom: 8,
  },
  tabsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabChipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabChipBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 30,
    gap: 14,
  },
  emptyCard: {
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(156, 163, 175, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  jobCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  jobIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTimeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  jobBody: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 19,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  payoutCol: {
    gap: 1,
  },
  payoutLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnSmall: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  btnReject: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnRejectText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },
  btnAccept: {
    backgroundColor: COLORS.primary,
  },
  btnAcceptText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  btnStart: {
    backgroundColor: '#7C3AED',
  },
  btnStartText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  btnComplete: {
    backgroundColor: '#16A34A',
  },
  btnCompleteText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  btnDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.primaryLight,
  },
  btnDetailsText: {
    fontSize: 12,
    fontWeight: '800',
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
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalSub: {
    fontSize: 13,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  modalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalBannerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalBannerAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  modalBannerRight: {
    alignItems: 'flex-end',
  },
  modalBannerTotalLabel: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  modalBannerTotalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalSection: {
    gap: 12,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalInfoText: {
    fontSize: 14,
    flex: 1,
  },
  actionOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  actionOutlineBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
