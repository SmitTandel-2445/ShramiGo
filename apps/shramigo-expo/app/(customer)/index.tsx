import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getStoredUser, type AuthUser } from '@/features/auth/services';
import { getWorkers, type Worker } from '@/features/workers/services';
import { getCustomerProfile } from '@/features/auth/profileServices';

const SERVICE_CATEGORIES = [
  { name: 'Electrician', icon: 'flash', color: '#FF5A00', bg: '#FFF1E8' },
  { name: 'Plumber', icon: 'water', color: '#087F7A', bg: '#E6F7F5' },
  { name: 'Carpenter', icon: 'hammer', color: '#FF5A00', bg: '#FFF1E8' },
  { name: 'Cleaner', icon: 'sparkles', color: '#087F7A', bg: '#E6F7F5' },
  { name: 'Painter', icon: 'color-palette', color: '#FF5A00', bg: '#FFF1E8' },
  { name: 'Driver', icon: 'car', color: '#087F7A', bg: '#E6F7F5' },
  { name: 'AC Repair', icon: 'snow', color: '#3B82F6', bg: '#EFF6FF' },
  { name: 'Mason', icon: 'construct', color: '#92400E', bg: '#FEF3C7' },
];

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
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Set your location');
  const [selectedService, setSelectedService] = useState('All');

  const bg = isDark ? '#0A0A0A' : COLORS.bg;
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadData = async () => {
    try {
      const [u, workersData, profile] = await Promise.all([
        getStoredUser(),
        getWorkers().catch(() => []),
        getCustomerProfile().catch(() => null),
      ]);
      setUser(u);
      setWorkers(workersData);
      if (profile?.city) setLocationLabel(profile.city);
    } catch { /* ignore */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = () => { setRefreshing(true); loadData(); };

  const filteredWorkers = selectedService === 'All'
    ? workers
    : workers.filter(w => w.service.toLowerCase().includes(selectedService.toLowerCase()));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.locationBtn} onPress={() => {}}>
              <Ionicons name="location-outline" size={15} color={COLORS.primary} />
              <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
              <Ionicons name="chevron-down" size={13} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={[styles.greeting, { color: textColor }]}>
              {t(getGreeting())} <Text style={{ fontWeight: '700' }}>{user?.full_name?.split(' ')[0] ?? 'there'} 👋</Text>
            </Text>
          </View>
          <TouchableOpacity style={[styles.notifBtn, { backgroundColor: cardBg }]} onPress={() => router.push('/(customer)/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: cardBg }]}
          onPress={() => router.push('/(customer)/search')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <Text style={styles.searchPlaceholder}>{t('Search for Electrician, Plumber...')}</Text>
        </TouchableOpacity>

        {/* AI Match Banner */}
        <TouchableOpacity style={styles.aiBanner} onPress={() => router.push('/(customer)/matching')} activeOpacity={0.9}>
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiIconBg}>
              <Ionicons name="sparkles" size={18} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.aiBannerTitle}>{t('Find your best match')}</Text>
              <Text style={styles.aiBannerDesc}>{t('Get smart worker recommendations near you.')}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{t('Popular Services')}</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/search')}>
              <Text style={styles.seeAll}>{t('See all')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesRow}>
            {SERVICE_CATEGORIES.map((svc) => (
              <TouchableOpacity
                key={svc.name}
                style={[styles.serviceChip, { backgroundColor: selectedService === svc.name ? svc.color : svc.bg, borderWidth: selectedService === svc.name ? 0 : 0 }]}
                onPress={() => setSelectedService(selectedService === svc.name ? 'All' : svc.name)}
                activeOpacity={0.8}
              >
                <Ionicons name={svc.icon as any} size={22} color={selectedService === svc.name ? COLORS.white : svc.color} />
                <Text style={[styles.serviceChipLabel, { color: selectedService === svc.name ? COLORS.white : '#374151' }]}>{t(svc.name)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Workers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{t('Top Rated Workers')}</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/search')}>
              <Text style={styles.seeAll}>{t('View all')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionSubtitle, { color: subTextColor }]}>{t('Verified workers from your local cooperative.')}</Text>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : filteredWorkers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color="#D1D5DB" />
              <Text style={[styles.emptyText, { color: subTextColor }]}>No workers found{selectedService !== 'All' ? ` for ${selectedService}` : ''}</Text>
            </View>
          ) : (
            <View style={styles.workersList}>
              {filteredWorkers.slice(0, 6).map((worker, index) => (
                <WorkerCard key={`${worker.id}-${worker.service}-${index}`} worker={worker} cardBg={cardBg} textColor={textColor} subTextColor={subTextColor} onPress={() => router.push(`/(customer)/workers/${worker.id}` as any)} t={t} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkerCard({ worker, cardBg, textColor, subTextColor, onPress, t }: {
  worker: Worker; cardBg: string; textColor: string; subTextColor: string; onPress: () => void; t: (k: string) => string;
}) {
  return (
    <TouchableOpacity style={[styles.workerCard, { backgroundColor: cardBg }]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.workerCardTop}>
        <View style={styles.workerAvatar}>
          {worker.image ? (
            <Image source={{ uri: worker.image }} style={styles.workerAvatarImg} />
          ) : (
            <View style={[styles.workerAvatarFallback, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={styles.workerAvatarInitial}>{worker.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={[styles.availBadge, { backgroundColor: worker.available ? '#22C55E' : '#9CA3AF' }]} />
        </View>
        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text style={[styles.workerName, { color: textColor }]} numberOfLines={1}>{worker.name}</Text>
            {worker.verified && <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} />}
          </View>
          <Text style={[styles.workerService, { color: COLORS.primary }]}>{t(worker.service)}</Text>
          <View style={styles.workerMeta}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.workerRating, { color: subTextColor }]}>{worker.rating.toFixed(1)} ({worker.reviews})</Text>
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
      <TouchableOpacity style={styles.bookBtn} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.bookBtnText}>{t('Book Now')}</Text>
        <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerLeft: { flex: 1, gap: 4 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, fontWeight: '600', color: COLORS.primary, maxWidth: 180 },
  greeting: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  notifBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2, marginLeft: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 16, padding: 14, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  searchPlaceholder: { flex: 1, fontSize: 14, color: '#9CA3AF' },
  aiBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 20, backgroundColor: COLORS.primary, borderRadius: 18, padding: 16 },
  aiBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  aiIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  aiBannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  seeAll: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  sectionSubtitle: { fontSize: 13, paddingHorizontal: 20, marginBottom: 14, lineHeight: 19 },
  servicesRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  serviceChip: { alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, minWidth: 76 },
  serviceChipLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  workersList: { paddingHorizontal: 20, gap: 12 },
  workerCard: { borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  workerCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  workerAvatar: { position: 'relative' },
  workerAvatarImg: { width: 52, height: 52, borderRadius: 16 },
  workerAvatarFallback: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  workerAvatarInitial: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  availBadge: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: COLORS.white },
  workerInfo: { flex: 1, gap: 3 },
  workerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workerName: { fontSize: 15, fontWeight: '700', flex: 1 },
  workerService: { fontSize: 12, fontWeight: '600' },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  workerRating: { fontSize: 11 },
  workerPriceCol: { alignItems: 'flex-end' },
  workerPrice: { fontSize: 16, fontWeight: '800' },
  workerPriceUnit: { fontSize: 11 },
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.accent, height: 40, borderRadius: 12 },
  bookBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14 },
});
