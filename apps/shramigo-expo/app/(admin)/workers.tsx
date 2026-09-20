import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput, Alert, Modal, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/lib/appConstants';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdminWorkers, toggleWorkerVerified, type AdminWorker } from '@/features/admin/services';

const ADMIN_PRIMARY = '#4F46E5';
const FILTERS = ['All', 'Verified', 'Unverified'];

export default function AdminWorkersScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [workers, setWorkers] = useState<AdminWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [toggling, setToggling] = useState<number | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<AdminWorker | null>(null);

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#141414' : '#FFFFFF';
  const cardBorder = isDark ? '#27272A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadWorkers = async () => {
    try {
      const data = await getAdminWorkers();
      setWorkers(data || []);
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadWorkers(); }, []);

  const handleVerifyToggle = async (worker: AdminWorker) => {
    try {
      setToggling(worker.id);
      const res = await toggleWorkerVerified(worker.id);
      const newStatus = res.is_verified;
      setWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, is_verified: newStatus } : w));
      if (selectedWorker?.id === worker.id) {
        setSelectedWorker(prev => prev ? { ...prev, is_verified: newStatus } : null);
      }
    } catch (err: any) {
      Alert.alert('Action Failed', err.message || 'Could not update verification status.');
    } finally {
      setToggling(null);
    }
  };

  const filtered = workers.filter(w => {
    if (activeFilter === 'Verified' && !w.is_verified) return false;
    if (activeFilter === 'Unverified' && w.is_verified) return false;

    if (!query) return true;
    const q = query.toLowerCase();
    return (
      w.full_name.toLowerCase().includes(q) ||
      w.email.toLowerCase().includes(q) ||
      (w.city && w.city.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Worker Directory</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            {workers.length} registered professionals · {workers.filter(w => w.is_verified).length} verified
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Ionicons name="search-outline" size={18} color={subTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search by worker name, email or city..."
            placeholderTextColor={subTextColor}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={subTextColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const isSelected = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? ADMIN_PRIMARY : cardBg,
                  borderColor: isSelected ? ADMIN_PRIMARY : cardBorder,
                },
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? '#FFFFFF' : subTextColor },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={ADMIN_PRIMARY} size="large" />
          <Text style={[styles.loadingText, { color: subTextColor }]}>Loading worker records...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={w => String(w.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadWorkers(); }}
              tintColor={ADMIN_PRIMARY}
            />
          }
          ListEmptyComponent={() => (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Ionicons name="hammer-outline" size={44} color={subTextColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No workers found</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>Try adjusting your search criteria.</Text>
            </View>
          )}
          renderItem={({ item: worker }) => {
            const isUpdating = toggling === worker.id;
            return (
              <TouchableOpacity
                style={[styles.workerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => setSelectedWorker(worker)}
                activeOpacity={0.8}
              >
                <View style={[styles.avatar, { backgroundColor: worker.is_verified ? '#DCFCE7' : '#EEF2FF' }]}>
                  <Text style={[styles.avatarText, { color: worker.is_verified ? '#16A34A' : ADMIN_PRIMARY }]}>
                    {worker.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.workerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.workerName, { color: textColor }]} numberOfLines={1}>
                      {worker.full_name}
                    </Text>
                    {worker.is_verified ? (
                      <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
                    ) : (
                      <Ionicons name="alert-circle-outline" size={15} color="#F59E0B" />
                    )}
                  </View>

                  <Text style={[styles.workerEmail, { color: subTextColor }]} numberOfLines={1}>
                    {worker.email}
                  </Text>

                  <View style={styles.metaRow}>
                    {worker.city && (
                      <Text style={[styles.metaText, { color: subTextColor }]}>
                        📍 {worker.city}
                      </Text>
                    )}
                    <Text style={[styles.metaText, { color: subTextColor }]}>
                      {worker.experience_years}y exp
                    </Text>
                    <Text style={[styles.metaText, { color: subTextColor }]}>
                      {worker.booking_count} bookings
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.verifyBtn,
                    {
                      backgroundColor: worker.is_verified ? '#DCFCE7' : '#EEF2FF',
                    },
                  ]}
                  onPress={() => handleVerifyToggle(worker)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color={ADMIN_PRIMARY} />
                  ) : (
                    <>
                      <Ionicons
                        name={worker.is_verified ? 'shield-checkmark' : 'shield-outline'}
                        size={15}
                        color={worker.is_verified ? '#16A34A' : ADMIN_PRIMARY}
                      />
                      <Text
                        style={[
                          styles.verifyBtnText,
                          { color: worker.is_verified ? '#16A34A' : ADMIN_PRIMARY },
                        ]}
                      >
                        {worker.is_verified ? 'Verified' : 'Verify'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Worker KYC Modal */}
      <Modal
        visible={!!selectedWorker}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedWorker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: textColor }]}>Worker Details</Text>
                <Text style={[styles.modalSub, { color: subTextColor }]}>KYC & Account Status</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedWorker(null)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            {selectedWorker && (
              <View style={{ gap: 14, paddingBottom: 24 }}>
                <View style={[styles.detailHero, { backgroundColor: COLORS.primaryLight }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailName}>{selectedWorker.full_name}</Text>
                    <Text style={styles.detailEmail}>{selectedWorker.email}</Text>
                    <Text style={styles.detailPhone}>{selectedWorker.phone}</Text>
                  </View>
                  <View style={[
                    styles.verifiedChip,
                    { backgroundColor: selectedWorker.is_verified ? '#DCFCE7' : '#FEF3C7' },
                  ]}>
                    <Text style={{
                      fontWeight: '800',
                      fontSize: 11,
                      color: selectedWorker.is_verified ? '#16A34A' : '#D97706',
                    }}>
                      {selectedWorker.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailInfoGroup}>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} color={ADMIN_PRIMARY} />
                    <Text style={[styles.infoRowText, { color: textColor }]}>
                      Location: {selectedWorker.city || 'Not specified'}{selectedWorker.state ? `, ${selectedWorker.state}` : ''}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="ribbon-outline" size={18} color={ADMIN_PRIMARY} />
                    <Text style={[styles.infoRowText, { color: textColor }]}>
                      Experience: {selectedWorker.experience_years} Years
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color={ADMIN_PRIMARY} />
                    <Text style={[styles.infoRowText, { color: textColor }]}>
                      Total Completed Jobs: {selectedWorker.booking_count}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modalActionBtn,
                    { backgroundColor: selectedWorker.is_verified ? '#FEE2E2' : '#DCFCE7' },
                  ]}
                  onPress={() => handleVerifyToggle(selectedWorker)}
                >
                  <Text style={{
                    fontWeight: '800',
                    fontSize: 14,
                    color: selectedWorker.is_verified ? '#DC2626' : '#16A34A',
                  }}>
                    {selectedWorker.is_verified ? 'Revoke Verification' : 'Grant Verified Trust Badge'}
                  </Text>
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterText: { fontSize: 12, fontWeight: '700' },
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
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '900' },
  workerInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workerName: { fontSize: 14, fontWeight: '800', flex: 1 },
  workerEmail: { fontSize: 12 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 2 },
  metaText: { fontSize: 11, fontWeight: '600' },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    minWidth: 72,
    justifyContent: 'center',
  },
  verifyBtnText: { fontSize: 11, fontWeight: '800' },
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
  detailHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
  },
  detailName: { fontSize: 16, fontWeight: '800', color: ADMIN_PRIMARY },
  detailEmail: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  detailPhone: { fontSize: 12, color: '#4B5563' },
  verifiedChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailInfoGroup: {
    gap: 12,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoRowText: { fontSize: 13, fontWeight: '600' },
  modalActionBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});
