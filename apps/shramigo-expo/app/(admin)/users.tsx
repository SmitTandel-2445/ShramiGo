import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAdminUsers, toggleUserActive, type AdminUser } from '@/features/admin/services';

const ADMIN_COLOR = '#4F46E5';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [toggling, setToggling] = useState<number | null>(null);

  const load = async () => {
    try { const data = await getAdminUsers(); setUsers(data); } catch { setUsers([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = (user: AdminUser) => {
    Alert.alert(
      `${user.is_active ? 'Deactivate' : 'Activate'} User`,
      `Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: user.is_active ? 'Deactivate' : 'Activate',
          style: user.is_active ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setToggling(user.id);
              await toggleUserActive(user.id);
              setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
            } catch (e: any) { Alert.alert('Error', e.message); } finally { setToggling(null); }
          },
        },
      ]
    );
  };

  const filtered = users.filter(u =>
    !query || u.full_name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
  );

  const roleColor = (role: string) => {
    if (role === 'admin') return { bg: '#EEF2FF', text: ADMIN_COLOR };
    if (role === 'worker') return { bg: '#E6F7F5', text: '#087F7A' };
    return { bg: '#FFF1E8', text: '#FF5A00' };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.subtitle}>{filtered.length} registered users</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" />
        <TextInput style={styles.searchInput} placeholder="Search by name or email..." placeholderTextColor="#9CA3AF" value={query} onChangeText={setQuery} autoCapitalize="none" />
      </View>

      {loading ? <ActivityIndicator color={ADMIN_COLOR} style={{ marginTop: 40 }} size="large" /> : (
        <FlatList
          data={filtered}
          keyExtractor={u => String(u.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ADMIN_COLOR} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          )}
          renderItem={({ item: user }) => {
            const rc = roleColor(user.role);
            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={[styles.avatar, { backgroundColor: rc.bg }]}>
                    <Text style={[styles.avatarInitial, { color: rc.text }]}>{user.full_name.charAt(0).toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{user.full_name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: rc.bg }]}>
                      <Text style={[styles.roleText, { color: rc.text }]}>{user.role.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
                  <Text style={styles.phone}>{user.phone}</Text>
                  <Text style={styles.joined}>Joined {new Date(user.created_at).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleBtn, { backgroundColor: user.is_active ? '#DCFCE7' : '#FEE2E2' }]}
                  onPress={() => handleToggle(user)}
                  disabled={toggling === user.id}
                >
                  {toggling === user.id ? (
                    <ActivityIndicator size="small" color={user.is_active ? '#16A34A' : '#DC2626'} />
                  ) : (
                    <Ionicons name={user.is_active ? 'checkmark-circle' : 'close-circle'} size={22} color={user.is_active ? '#16A34A' : '#DC2626'} />
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
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
  cardLeft: {},
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 18, fontWeight: '800' },
  userInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 9, fontWeight: '800' },
  email: { fontSize: 12, color: '#6B7280' },
  phone: { fontSize: 12, color: '#6B7280' },
  joined: { fontSize: 11, color: '#9CA3AF' },
  toggleBtn: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
