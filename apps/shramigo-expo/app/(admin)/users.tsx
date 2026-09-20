import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdminUsers, toggleUserActive, type AdminUser } from '@/features/admin/services';

const ADMIN_PRIMARY = '#4F46E5';
const ROLE_FILTERS = ['All', 'customer', 'worker', 'admin'];

export default function AdminUsersScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [toggling, setToggling] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const bg = isDark ? '#0D0D0D' : '#F8FAFF';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggleActive = (user: AdminUser) => {
    const action = user.is_active ? 'Deactivate' : 'Activate';
    Alert.alert(
      `${action} User Account`,
      `Are you sure you want to ${action.toLowerCase()} ${user.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: user.is_active ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setToggling(user.id);
              await toggleUserActive(user.id);
              setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
              );
              if (selectedUser && selectedUser.id === user.id) {
                setSelectedUser({ ...selectedUser, is_active: !selectedUser.is_active });
              }
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to update account status.');
            } finally {
              setToggling(null);
            }
          },
        },
      ]
    );
  };

  const getRoleStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return { bg: '#EEF2FF', text: ADMIN_PRIMARY };
      case 'worker':
        return { bg: '#E6F7F5', text: '#087F7A' };
      default:
        return { bg: '#FFF1E8', text: '#FF5A00' };
    }
  };

  const filtered = users.filter(u => {
    if (selectedRole !== 'All' && u.role.toLowerCase() !== selectedRole.toLowerCase()) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>User Directory</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            {users.length} registered platform accounts
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Ionicons name="search-outline" size={18} color={subTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search by name, email or phone..."
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

      {/* Role Filter Chips */}
      <View style={styles.filterRow}>
        {ROLE_FILTERS.map(role => {
          const isSelected = selectedRole === role;
          return (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? ADMIN_PRIMARY : cardBg,
                  borderColor: isSelected ? ADMIN_PRIMARY : cardBorder,
                },
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? '#FFFFFF' : subTextColor },
                ]}
              >
                {role.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={ADMIN_PRIMARY} size="large" />
          <Text style={[styles.loadingText, { color: subTextColor }]}>Loading user accounts...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={u => String(u.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadUsers(); }}
              tintColor={ADMIN_PRIMARY}
            />
          }
          ListEmptyComponent={() => (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Ionicons name="people-outline" size={44} color={subTextColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No users found</Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>Try adjusting your search criteria.</Text>
            </View>
          )}
          renderItem={({ item: user }) => {
            const roleStyle = getRoleStyle(user.role);
            const isUpdating = toggling === user.id;
            return (
              <TouchableOpacity
                style={[styles.userCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => setSelectedUser(user)}
                activeOpacity={0.8}
              >
                <View style={[styles.avatar, { backgroundColor: roleStyle.bg }]}>
                  <Text style={[styles.avatarText, { color: roleStyle.text }]}>
                    {user.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
                      {user.full_name}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
                      <Text style={[styles.roleText, { color: roleStyle.text }]}>
                        {user.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.userEmail, { color: subTextColor }]} numberOfLines={1}>
                    {user.email}
                  </Text>
                  <Text style={[styles.userPhone, { color: subTextColor }]}>
                    {user.phone || 'No phone registered'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    { backgroundColor: user.is_active ? '#DCFCE7' : '#FEE2E2' },
                  ]}
                  onPress={() => handleToggleActive(user)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color={user.is_active ? '#16A34A' : '#DC2626'} />
                  ) : (
                    <Ionicons
                      name={user.is_active ? 'checkmark-circle' : 'ban'}
                      size={20}
                      color={user.is_active ? '#16A34A' : '#DC2626'}
                    />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* User Details Modal */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: textColor }]}>User Profile</Text>
                <Text style={[styles.modalSub, { color: subTextColor }]}>Account ID #{selectedUser?.id}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedUser(null)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <View style={{ gap: 14, paddingBottom: 24 }}>
                <View style={[styles.detailHero, { backgroundColor: getRoleStyle(selectedUser.role).bg }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailName, { color: getRoleStyle(selectedUser.role).text }]}>
                      {selectedUser.full_name}
                    </Text>
                    <Text style={styles.detailEmail}>{selectedUser.email}</Text>
                    <Text style={styles.detailPhone}>{selectedUser.phone}</Text>
                  </View>
                  <View style={[styles.statusChip, { backgroundColor: selectedUser.is_active ? '#DCFCE7' : '#FEE2E2' }]}>
                    <Text style={{ fontWeight: '800', fontSize: 11, color: selectedUser.is_active ? '#16A34A' : '#DC2626' }}>
                      {selectedUser.is_active ? 'ACTIVE' : 'SUSPENDED'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailGroup}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={18} color={ADMIN_PRIMARY} />
                    <Text style={[styles.infoRowText, { color: textColor }]}>
                      Platform Role: {selectedUser.role.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color={ADMIN_PRIMARY} />
                    <Text style={[styles.infoRowText, { color: textColor }]}>
                      Account Created: {new Date(selectedUser.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modalActionBtn,
                    { backgroundColor: selectedUser.is_active ? '#FEE2E2' : '#DCFCE7' },
                  ]}
                  onPress={() => handleToggleActive(selectedUser)}
                >
                  <Text style={{
                    fontWeight: '800',
                    fontSize: 14,
                    color: selectedUser.is_active ? '#DC2626' : '#16A34A',
                  }}>
                    {selectedUser.is_active ? 'Suspend Account' : 'Activate Account'}
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
  filterText: { fontSize: 11, fontWeight: '800' },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  userCard: {
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
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 17, fontWeight: '900' },
  userInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 14, fontWeight: '800', flex: 1 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 9, fontWeight: '800' },
  userEmail: { fontSize: 12 },
  userPhone: { fontSize: 11 },
  statusToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  detailName: { fontSize: 16, fontWeight: '800' },
  detailEmail: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  detailPhone: { fontSize: 12, color: '#4B5563' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  detailGroup: { gap: 12, marginVertical: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoRowText: { fontSize: 13, fontWeight: '600' },
  modalActionBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});
