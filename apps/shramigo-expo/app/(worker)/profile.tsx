import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getStoredUser, logout, type AuthUser } from '@/features/auth/services';
import { getWorkerProfile, type WorkerProfile } from '@/features/workers/services';
import { getWorkerBookings } from '@/features/bookings/services';

export default function WorkerProfileScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [showLang, setShowLang] = useState(false);

  const bg = isDark ? '#0A0A0A' : COLORS.bg;
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    Promise.all([getStoredUser(), getWorkerProfile().catch(() => null), getWorkerBookings().catch(() => [])]).then(([u, p, b]) => {
      setUser(u); setProfile(p); setBookingCount(b.filter(bk => bk.status === 'completed').length);
    });
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/welcome'); } },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>{t('Worker Profile')}</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: COLORS.primary }]}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          {profile?.profile_image ? (
            <Image source={{ uri: profile.profile_image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{user?.full_name?.charAt(0) ?? 'W'}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{user?.full_name ?? 'Worker'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          {user?.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
              <Text style={styles.verifiedText}>{t('Verified Worker')}</Text>
            </View>
          )}
          <View style={styles.statsRow}>
            {[
              { value: bookingCount, label: t('Completed Jobs') },
              { value: profile?.experience_years ?? 0, label: t('Years Experience') },
              { value: profile?.city ?? 'N/A', label: 'City' },
            ].map((s, i) => (
              <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Professional */}
        <Text style={styles.sectionHeader}>Professional</Text>
        <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
          <MenuItem icon="construct-outline" label={t('Skills & Services')} sub={t('Manage categories')} onPress={() => router.push('/(worker)/skills')} textColor={textColor} subTextColor={subTextColor} color={COLORS.primary} />
          <MenuItem icon="calendar-outline" label={t('My Schedule')} sub={t('Update working hours')} onPress={() => router.push('/(worker)/availability')} textColor={textColor} subTextColor={subTextColor} color={COLORS.primary} />
          <MenuItem icon="person-outline" label={t('Personal information')} sub={t('Name, phone and email')} onPress={() => {}} textColor={textColor} subTextColor={subTextColor} color={COLORS.primary} />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: isDark ? '#F97316' + '20' : '#FFF1E8' }]}><Ionicons name="moon-outline" size={18} color="#F97316" /></View>
            <View style={styles.menuText}><Text style={[styles.menuLabel, { color: textColor }]}>{t('Dark Mode Theme')}</Text></View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#E5E7EB', true: COLORS.primary }} thumbColor={COLORS.white} />
          </View>
          <TouchableOpacity style={styles.menuRow} onPress={() => setShowLang(!showLang)}>
            <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryLight }]}><Ionicons name="language-outline" size={18} color={COLORS.primary} /></View>
            <View style={styles.menuText}><Text style={[styles.menuLabel, { color: textColor }]}>{t('Language')}</Text><Text style={[styles.menuSub, { color: subTextColor }]}>{language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'ગુજરાતી'}</Text></View>
            <Ionicons name={showLang ? 'chevron-up' : 'chevron-down'} size={18} color={subTextColor} />
          </TouchableOpacity>
          {showLang && (
            <View style={{ backgroundColor: '#F9FAFB' }}>
              {[{ code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' }, { code: 'gu', label: 'ગુજરાતી' }].map(l => (
                <TouchableOpacity key={l.code} style={[styles.langOpt, language === l.code && { backgroundColor: COLORS.primaryLight }]} onPress={() => { setLanguage(l.code as any); setShowLang(false); }}>
                  <Text style={[{ fontSize: 14, color: '#374151' }, language === l.code && { color: COLORS.primary, fontWeight: '700' }]}>{l.label}</Text>
                  {language === l.code && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Support */}
        <Text style={styles.sectionHeader}>Support</Text>
        <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
          <MenuItem icon="notifications-outline" label={t('Notifications')} sub={t('Manage notification preferences')} onPress={() => router.push('/(worker)/notifications')} textColor={textColor} subTextColor={subTextColor} color={COLORS.primary} />
          <MenuItem icon="help-circle-outline" label={t('Help & support')} sub={t('Get help with ShramiGo')} onPress={() => {}} textColor={textColor} subTextColor={subTextColor} color={COLORS.primary} />
          <MenuItem icon="shield-checkmark-outline" label={t('Privacy & Security')} sub="" onPress={() => {}} textColor={textColor} subTextColor={subTextColor} color={COLORS.primary} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>{t('Logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, sub, onPress, textColor, subTextColor, color }: { icon: string; label: string; sub: string; onPress: () => void; textColor: string; subTextColor: string; color: string }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryLight }]}>
        <Ionicons name={icon as any} size={18} color={color} />
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  profileCard: { marginHorizontal: 20, borderRadius: 24, padding: 20, alignItems: 'center', gap: 6, overflow: 'hidden', marginBottom: 20 },
  circle1: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)' },
  circle2: { position: 'absolute', bottom: -20, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)' },
  avatar: { width: 72, height: 72, borderRadius: 22, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', marginBottom: 4 },
  avatarFallback: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarInitial: { fontSize: 30, fontWeight: '900', color: COLORS.white },
  profileName: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  statsRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 12, marginTop: 6 },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)' },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  sectionHeader: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 20, marginBottom: 8 },
  menuCard: { marginHorizontal: 20, borderRadius: 18, marginBottom: 20, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600' },
  menuSub: { fontSize: 12, marginTop: 1 },
  langOpt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
