import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Switch, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getStoredUser, logout, type AuthUser } from '@/features/auth/services';
import { getCustomerProfile, type CustomerProfile } from '@/features/auth/profileServices';
import { getMyBookings } from '@/features/bookings/services';

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLang, setShowLang] = useState(false);

  const bg = isDark ? '#0A0A0A' : COLORS.bg;
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    Promise.all([getStoredUser(), getCustomerProfile().catch(() => null), getMyBookings().catch(() => [])]).then(([u, p, b]) => {
      setUser(u); setProfile(p); setBookingCount(b.length); setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/welcome'); } },
    ]);
  };

  if (loading) return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} size="large" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>{t('My Profile')}</Text>
        </View>

        {/* Avatar */}
        <View style={[styles.avatarCard, { backgroundColor: cardBg }]}>
          <View style={styles.avatarRow}>
            {profile?.profile_image ? (
              <Image source={{ uri: profile.profile_image }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{user?.full_name?.charAt(0) ?? 'C'}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: textColor }]}>{user?.full_name ?? 'Customer'}</Text>
              <Text style={[styles.userEmail, { color: subTextColor }]}>{user?.email ?? ''}</Text>
              <View style={styles.verifiedRow}>
                {user?.is_verified && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />}
                <Text style={[styles.verifiedText, { color: COLORS.primary }]}>{user?.is_verified ? 'Verified Account' : 'Account Active'}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: t('Bookings count'), value: bookingCount },
              { label: t('Active'), value: 0 },
              { label: t('Addresses'), value: profile?.address ? 1 : 0 },
            ].map((stat, i) => (
              <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: '#F3F4F6' }]}>
                <Text style={[styles.statValue, { color: textColor }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: subTextColor }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Account Section */}
        <SectionHeader title={t('Account')} />
        <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
          <MenuItem icon="person-outline" label={t('Personal Information')} sub={t('Manage your name, phone and email')} onPress={() => {}} textColor={textColor} subTextColor={subTextColor} />
          <MenuItem icon="location-outline" label={t('My Addresses')} sub="" onPress={() => {}} textColor={textColor} subTextColor={subTextColor} />
          <MenuItem icon="card-outline" label={t('Payment Methods')} sub={t('UPI, Cards, and Cash on Completion')} onPress={() => {}} textColor={textColor} subTextColor={subTextColor} />
        </View>

        {/* Preferences Section */}
        <SectionHeader title="Preferences" />
        <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
          <View style={styles.menuItemRow}>
            <View style={[styles.menuIconBg, { backgroundColor: isDark ? '#F97316' + '20' : '#FFF1E8' }]}>
              <Ionicons name="moon-outline" size={18} color="#F97316" />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: textColor }]}>{t('Dark Mode Theme')}</Text>
              <Text style={[styles.menuSub, { color: subTextColor }]}>{t('Switch between cyber dark and clean light')}</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#E5E7EB', true: COLORS.primary }} thumbColor={COLORS.white} />
          </View>
          <TouchableOpacity style={styles.menuItemRow} onPress={() => setShowLang(!showLang)}>
            <View style={[styles.menuIconBg, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="language-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: textColor }]}>{t('Language')}</Text>
              <Text style={[styles.menuSub, { color: subTextColor }]}>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeLabel ?? 'English'}</Text>
            </View>
            <Ionicons name={showLang ? 'chevron-up' : 'chevron-down'} size={18} color={subTextColor} />
          </TouchableOpacity>
          {showLang && (
            <View style={styles.langOptions}>
              {[{ code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' }, { code: 'gu', label: 'ગુજરાતી' }].map(lang => (
                <TouchableOpacity key={lang.code} style={[styles.langOption, language === lang.code && { backgroundColor: COLORS.primaryLight }]} onPress={() => { setLanguage(lang.code as any); setShowLang(false); }}>
                  <Text style={[styles.langOptionText, language === lang.code && { color: COLORS.primary, fontWeight: '700' }]}>{lang.label}</Text>
                  {language === lang.code && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Support */}
        <SectionHeader title={t('Support')} />
        <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
          <MenuItem icon="notifications-outline" label={t('Notifications')} sub={t('Booking and service updates')} onPress={() => router.push('/(customer)/notifications')} textColor={textColor} subTextColor={subTextColor} />
          <MenuItem icon="help-circle-outline" label={t('Help & Support')} sub={t('Get help with your bookings')} onPress={() => {}} textColor={textColor} subTextColor={subTextColor} />
          <MenuItem icon="shield-checkmark-outline" label={t('Privacy & Security')} sub={t('Manage your account security')} onPress={() => {}} textColor={textColor} subTextColor={subTextColor} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>{t('Logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function MenuItem({ icon, label, sub, onPress, textColor, subTextColor }: {
  icon: string; label: string; sub: string; onPress: () => void; textColor: string; subTextColor: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItemRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconBg, { backgroundColor: COLORS.primaryLight }]}>
        <Ionicons name={icon as any} size={18} color={COLORS.primary} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, { color: textColor }]}>{label}</Text>
        {sub ? <Text style={[styles.menuSub, { color: subTextColor }]}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={subTextColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  avatarCard: { marginHorizontal: 20, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatarImg: { width: 64, height: 64, borderRadius: 20 },
  avatarFallback: { width: 64, height: 64, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  userInfo: { flex: 1, gap: 3 },
  userName: { fontSize: 18, fontWeight: '800' },
  userEmail: { fontSize: 13 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center' },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8 },
  menuCard: { marginHorizontal: 20, borderRadius: 18, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  menuItemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600' },
  menuSub: { fontSize: 12, marginTop: 1 },
  langOptions: { backgroundColor: '#F9FAFB', paddingVertical: 4 },
  langOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  langOptionText: { fontSize: 14, color: '#374151' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});

// Re-export SUPPORTED_LANGUAGES for use in this file
const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
];
