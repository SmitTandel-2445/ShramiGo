import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAdminWorkers, toggleWorkerVerified, type AdminWorker } from '@/features/admin/services';

const ADMIN_COLOR = '#4F46E5';

export default function AdminWorkersScreen() {
  const [workers, setWorkers] = useState<AdminWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [toggling, setToggling] = useState<number | null>(null);

  const load = async () => {
    try { const data = await getAdminWorkers(); setWorkers(data); } catch { setWorkers([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const handleVerify = (worker: AdminWorker) => {
    Alert.alert(
      `${worker.is_verified ? 'Unverify' : 'Verify'} Worker`,
      `${worker.is_verified ? 'Remove verification from' : 'Verify'} ${worker.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: worker.is_verified ? 'Unverify' : 'Verify',
          onPress: async () => {
            try {
              setToggling(worker.id);
              await toggleWorkerVerified(worker.id);
              setWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, is_verified: !w.is_verified } : w));
            } catch (e: any) { Alert.alert('Error', e.message); } finally { setToggling(null); }
          },
        },
      ]
    );
  };

  const filtered = workers.filter(w =>
    !query || w.full_name.toLowerCase().includes(query.toLowerCase()) || w.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Workers</Text>
        <Text style={styles.subtitle}>{filtered.length} registered workers</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" />
        <TextInput style={styles.searchInput} placeholder="Search workers..." placeholderTextColor="#9CA3AF" value={query} onChangeText={setQuery} autoCapitalize="none" />
      </View>

      {loading ? <ActivityIndicator color={ADMIN_COLOR} style={{ marginTop: 40 }} size="large" /> : (
        <FlatList
          data={filtered}
          keyExtractor={w => String(w.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ADMIN_COLOR} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="hammer-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No workers found</Text>
            </View>
          )}
          renderItem={({ item: worker }) => (
            <View style={styles.card}>
              <View style={[styles.avatar, { backgroundColor: worker.is_verified ? '#E6F7F5' : '#F3F4F6' }]}>
                <Text style={[styles.avatarInitial, { color: worker.is_verified ? '#087F7A' : '#9CA3AF' }]}>{worker.full_name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{worker.full_name}</Text>
                  {worker.is_verified && <Ionicons name="checkmark-circle" size={16} color="#087F7A" />}
                </View>
                <Text style={styles.email} numberOfLines={1}>{worker.email}</Text>
                <View style={styles.metaRow}>
                  {worker.city && <Text style={styles.meta}>{worker.city}{worker.state ? `, ${worker.state}` : ''}</Text>}
                  <Text style={styles.meta}>{worker.experience_years}yr exp</Text>
                  <Text style={styles.meta}>{worker.booking_count} jobs</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.verifyBtn, { backgroundColor: worker.is_verified ? '#E6F7F5' : '#EEF2FF' }]}
                onPress={() => handleVerify(worker)}
                disabled={toggling === worker.id}
              >
                {toggling === worker.id ? (
                  <ActivityIndicator size="small" color={worker.is_verified ? '#087F7A' : ADMIN_COLOR} />
                ) : (
                  <>
                    <Ionicons name={worker.is_verified ? 'shield-checkmark' : 'shield-outline'} size={16} color={worker.is_verified ? '#087F7A' : ADMIN_COLOR} />
                    <Text style={[styles.verifyBtnText, { color: worker.is_verified ? '#087F7A' : ADMIN_COLOR }]}>{worker.is_verified ? 'Verified' : 'Verify'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, height: 44, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 18, fontWeight: '800' },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1 },
  email: { fontSize: 12, color: '#6B7280' },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  meta: { fontSize: 11, color: '#9CA3AF' },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, minWidth: 70 },
  verifyBtnText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
