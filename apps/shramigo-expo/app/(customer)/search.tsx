import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Image, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getWorkers, type Worker } from '@/features/workers/services';

const SERVICE_FILTERS = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Painter', 'Driver', 'AC Repair', 'Mason', 'Gardener'];

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

  const bg = isDark ? '#0A0A0A' : COLORS.bg;
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadWorkers = async (service?: string) => {
    try {
      const data = await getWorkers(service !== 'All' ? service : undefined);
      setWorkers(data);
    } catch { setWorkers([]); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadWorkers(selectedService); }, [selectedService]);

  const filteredWorkers = workers.filter(w =>
    !query || w.name.toLowerCase().includes(query.toLowerCase()) || w.service.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : parseFloat(a.price) - parseFloat(b.price));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{t('Search')}</Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>{t('All Workers')}</Text>
      </View>

      {/* Search Input */}
      <View style={[styles.searchWrapper, { backgroundColor: cardBg }]}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={t('Search for Electrician, Plumber...')}
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Service Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {SERVICE_FILTERS.map(svc => (
          <TouchableOpacity
            key={svc}
            style={[styles.filterChip, selectedService === svc && styles.filterChipActive]}
            onPress={() => { setSelectedService(svc); setLoading(true); }}
          >
            <Text style={[styles.filterChipText, selectedService === svc && styles.filterChipTextActive]}>{t(svc)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Row */}
      <View style={styles.sortRow}>
        <Text style={[styles.resultCount, { color: subTextColor }]}>{filteredWorkers.length} workers found</Text>
        <View style={styles.sortBtns}>
          <TouchableOpacity style={[styles.sortBtn, sortBy === 'rating' && styles.sortBtnActive]} onPress={() => setSortBy('rating')}>
            <Text style={[styles.sortBtnText, sortBy === 'rating' && { color: COLORS.accent }]}>{t('Rating')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sortBtn, sortBy === 'price' && styles.sortBtnActive]} onPress={() => setSortBy('price')}>
            <Text style={[styles.sortBtnText, sortBy === 'price' && { color: COLORS.accent }]}>{t('Price')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} size="large" />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadWorkers(selectedService); }} tintColor={COLORS.primary} />}>
          {filteredWorkers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={50} color="#D1D5DB" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No workers found</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>Try a different service or location</Text>
            </View>
          ) : filteredWorkers.map((worker, index) => (
            <TouchableOpacity key={`${worker.id}-${worker.service}-${index}`} style={[styles.workerCard, { backgroundColor: cardBg }]} onPress={() => router.push(`/(customer)/workers/${worker.id}` as any)} activeOpacity={0.85}>
              <View style={styles.workerLeft}>
                {worker.image ? (
                  <Image source={{ uri: worker.image }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: COLORS.primaryLight }]}>
                    <Text style={styles.avatarInitial}>{worker.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.workerInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.workerName, { color: textColor }]} numberOfLines={1}>{worker.name}</Text>
                  {worker.verified && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />}
                </View>
                <Text style={styles.workerService}>{t(worker.service)}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={[styles.metaText, { color: subTextColor }]}>{worker.rating.toFixed(1)}</Text>
                  <Text style={{ color: '#D1D5DB' }}> · </Text>
                  <Text style={[styles.metaText, { color: subTextColor }]}>{worker.experience} exp</Text>
                  {worker.distance && <>
                    <Text style={{ color: '#D1D5DB' }}> · </Text>
                    <Ionicons name="location-outline" size={12} color={subTextColor} />
                    <Text style={[styles.metaText, { color: subTextColor }]}>{worker.distance}</Text>
                  </>}
                </View>
              </View>
              <View style={styles.workerRight}>
                <Text style={[styles.workerPrice, { color: textColor }]}>{worker.price}</Text>
                <Text style={[styles.workerPriceUnit, { color: subTextColor }]}>{t('/hr')}</Text>
                <View style={[styles.availChip, { backgroundColor: worker.available ? '#DCFCE7' : '#F3F4F6' }]}>
                  <Text style={[styles.availText, { color: worker.available ? '#16A34A' : '#9CA3AF' }]}>{worker.available ? t('Available') : t('Offline')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginVertical: 12, padding: 14, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterChipTextActive: { color: COLORS.primary },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  resultCount: { fontSize: 13 },
  sortBtns: { flexDirection: 'row', gap: 8 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB' },
  sortBtnActive: { borderColor: COLORS.accent },
  sortBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  workerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  workerLeft: {},
  avatar: { width: 52, height: 52, borderRadius: 16 },
  avatarFallback: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  workerInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workerName: { fontSize: 14, fontWeight: '700', flex: 1 },
  workerService: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  metaText: { fontSize: 11 },
  workerRight: { alignItems: 'flex-end', gap: 4 },
  workerPrice: { fontSize: 16, fontWeight: '800' },
  workerPriceUnit: { fontSize: 11, marginTop: -4 },
  availChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  availText: { fontSize: 10, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14 },
});
