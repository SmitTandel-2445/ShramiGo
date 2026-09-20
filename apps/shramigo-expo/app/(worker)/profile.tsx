import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
  Modal, TextInput, ActivityIndicator, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getStoredUser, logout, type AuthUser } from '@/features/auth/services';
import { getWorkerProfile, updateWorkerProfile, type WorkerProfile } from '@/features/workers/services';
import { getWorkerBookings } from '@/features/bookings/services';

export default function WorkerProfileScreen() {
  const router = useRouter();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [bookingCount, setBookingCount] = useState(0);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Form state for profile editing
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    experience_years: '0',
    bio: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#242424' : '#F3F4F6';

  const loadData = async () => {
    try {
      const [u, p, b] = await Promise.all([
        getStoredUser(),
        getWorkerProfile().catch(() => null),
        getWorkerBookings().catch(() => []),
      ]);
      setUser(u);
      setProfile(p);
      setBookingCount(b.filter(bk => bk.status.toLowerCase() === 'completed').length);

      if (u || p) {
        setEditForm({
          full_name: u?.full_name || '',
          phone: u?.phone || '',
          city: p?.city || '',
          state: p?.state || '',
          pincode: p?.pincode || '',
          experience_years: String(p?.experience_years ?? 0),
          bio: p?.bio || '',
        });
      }
    } catch (e) {
      console.error('Error loading worker profile data', e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const updated = await updateWorkerProfile({
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        pincode: editForm.pincode.trim(),
        experience_years: parseInt(editForm.experience_years, 10) || 0,
        bio: editForm.bio.trim(),
      });
      setProfile(updated);
      if (user) {
        setUser({ ...user, full_name: editForm.full_name, phone: editForm.phone });
      }
      setShowEditModal(false);
      Alert.alert(t('Profile Updated'), 'Your profile information has been saved.');
    } catch {
      Alert.alert(t('Error'), 'Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('Logout'), 'Are you sure you want to log out of your worker account?', [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/welcome');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>{t('Worker Profile')}</Text>
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={styles.editHeaderText}>{t('Edit')}</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Hero Card */}
        <View style={styles.profileCard}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />

          {profile?.profile_image ? (
            <Image source={{ uri: profile.profile_image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{user?.full_name?.charAt(0) ?? 'W'}</Text>
            </View>
          )}

          <Text style={styles.profileName}>{user?.full_name ?? 'Worker Professional'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? user?.phone ?? ''}</Text>

          {user?.is_verified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.verifiedText}>{t('Verified Worker')}</Text>
            </View>
          ) : (
            <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Ionicons name="time-outline" size={14} color="#F59E0B" />
              <Text style={[styles.verifiedText, { color: '#FDE68A' }]}>Under Verification</Text>
            </View>
          )}

          {profile?.bio ? (
            <Text style={styles.profileBio} numberOfLines={2}>
              "{profile.bio}"
            </Text>
          ) : null}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bookingCount}</Text>
              <Text style={styles.statLabel}>{t('Completed Jobs')}</Text>
            </View>

            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statValue}>{profile?.experience_years ?? 0} yrs</Text>
              <Text style={styles.statLabel}>{t('Experience')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.city || 'Local'}</Text>
              <Text style={styles.statLabel}>Location</Text>
            </View>
          </View>
        </View>

        {/* Professional Management */}
        <Text style={styles.sectionHeader}>{t('Professional Information')}</Text>
        <View style={[styles.menuCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <MenuItem
            icon="construct-outline"
            label={t('Skills & Services')}
            sub={t('Manage categories')}
            onPress={() => router.push('/(worker)/skills')}
            textColor={textColor}
            subTextColor={subTextColor}
            cardBorder={cardBorder}
            color={COLORS.primary}
          />
          <MenuItem
            icon="calendar-outline"
            label={t('My Schedule')}
            sub={t('Update working hours')}
            onPress={() => router.push('/(worker)/availability')}
            textColor={textColor}
            subTextColor={subTextColor}
            cardBorder={cardBorder}
            color={COLORS.primary}
          />
          <MenuItem
            icon="heart-outline"
            label={t('Welfare & Benefits')}
            sub="Insurance, healthcare & pension"
            onPress={() => router.push('/(worker)/welfare')}
            textColor={textColor}
            subTextColor={subTextColor}
            cardBorder={cardBorder}
            color="#DC2626"
          />
          <MenuItem
            icon="person-outline"
            label={t('Personal Information')}
            sub={t('Manage your name, phone and email')}
            onPress={() => setShowEditModal(true)}
            textColor={textColor}
            subTextColor={subTextColor}
            cardBorder={cardBorder}
            color={COLORS.primary}
            isLast
          />
        </View>

        {/* Preferences & Theme */}
        <Text style={styles.sectionHeader}>{t('App Settings')}</Text>
        <View style={[styles.menuCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={[styles.menuRow, { borderBottomColor: cardBorder }]}>
            <View style={[styles.menuIcon, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFF1E8' }]}>
              <Ionicons name="moon-outline" size={18} color="#F97316" />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: textColor }]}>{t('Dark Mode Theme')}</Text>
              <Text style={[styles.menuSub, { color: subTextColor }]}>
                {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: cardBorder }]}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="language-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: textColor }]}>{t('Language')}</Text>
              <Text style={[styles.menuSub, { color: subTextColor }]}>
                {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'ગુજરાતી'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={subTextColor} />
          </TouchableOpacity>

          <MenuItem
            icon="notifications-outline"
            label={t('Notifications')}
            sub={t('Manage notification preferences')}
            onPress={() => router.push('/(worker)/notifications')}
            textColor={textColor}
            subTextColor={subTextColor}
            cardBorder={cardBorder}
            color={COLORS.primary}
            isLast
          />
        </View>

        {/* Support & Legal */}
        <Text style={styles.sectionHeader}>{t('Support')}</Text>
        <View style={[styles.menuCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <MenuItem
            icon="help-circle-outline"
            label={t('Help & Support')}
            sub={t('Get help with ShramiGo')}
            onPress={() => setShowHelpModal(true)}
            textColor={textColor}
            subTextColor={subTextColor}
            cardBorder={cardBorder}
            color={COLORS.primary}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label={t('Privacy & Security')}
            sub={t('Manage your account security')}
            onPress={() => {
              Alert.alert('Privacy & Security', 'ShramiGo strictly protects worker personal data, earnings records, and location safety.');
            }}
            textColor={textColor}
            subTextColor={subTextColor}
            cardBorder={cardBorder}
            color={COLORS.primary}
            isLast
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>{t('Logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalSheetTitle, { color: textColor }]}>{t('Edit Profile')}</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textColor }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: cardBorder }]}
                  value={editForm.full_name}
                  onChangeText={v => setEditForm(f => ({ ...f, full_name: v }))}
                  placeholder="Your Full Name"
                  placeholderTextColor={subTextColor}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textColor }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: cardBorder }]}
                  value={editForm.phone}
                  onChangeText={v => setEditForm(f => ({ ...f, phone: v }))}
                  placeholder="Phone Number"
                  placeholderTextColor={subTextColor}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>City</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: cardBorder }]}
                    value={editForm.city}
                    onChangeText={v => setEditForm(f => ({ ...f, city: v }))}
                    placeholder="City"
                    placeholderTextColor={subTextColor}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Pincode</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: cardBorder }]}
                    value={editForm.pincode}
                    onChangeText={v => setEditForm(f => ({ ...f, pincode: v }))}
                    placeholder="Pincode"
                    placeholderTextColor={subTextColor}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textColor }]}>Years of Experience</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: cardBorder }]}
                  value={editForm.experience_years}
                  onChangeText={v => setEditForm(f => ({ ...f, experience_years: v }))}
                  placeholder="e.g. 5"
                  placeholderTextColor={subTextColor}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textColor }]}>Professional Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: textColor, borderColor: cardBorder }]}
                  value={editForm.bio}
                  onChangeText={v => setEditForm(f => ({ ...f, bio: v }))}
                  placeholder="Tell clients about your expertise and work quality..."
                  placeholderTextColor={subTextColor}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={savingProfile}
                activeOpacity={0.85}
              >
                {savingProfile ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveBtnText}>{t('Save Changes')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLangModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalSheetTitle, { color: textColor }]}>{t('Choose your preferred language')}</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowLangModal(false)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, paddingBottom: 20 }}>
              {supportedLanguages.map(l => {
                const isSelected = language === l.code;
                return (
                  <TouchableOpacity
                    key={l.code}
                    style={[
                      styles.langCard,
                      {
                        backgroundColor: isSelected ? COLORS.primaryLight : inputBg,
                        borderColor: isSelected ? COLORS.primary : cardBorder,
                      },
                    ]}
                    onPress={() => {
                      setLanguage(l.code);
                      setShowLangModal(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.langNative, { color: isSelected ? COLORS.primary : textColor }]}>
                        {l.nativeLabel}
                      </Text>
                      <Text style={[styles.langLabel, { color: isSelected ? COLORS.primary : subTextColor }]}>
                        {l.label}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalSheetTitle, { color: textColor }]}>{t('Help & Support')}</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowHelpModal(false)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 14, paddingBottom: 24 }}>
              <TouchableOpacity
                style={[styles.helpOption, { backgroundColor: inputBg, borderColor: cardBorder }]}
                onPress={() => Linking.openURL('tel:18001234567')}
              >
                <View style={[styles.helpIconBg, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="call" size={20} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpOptionTitle, { color: textColor }]}>Worker Helpline (Toll-Free)</Text>
                  <Text style={[styles.helpOptionSub, { color: subTextColor }]}>1800-123-4567 (24x7 Support)</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={subTextColor} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.helpOption, { backgroundColor: inputBg, borderColor: cardBorder }]}
                onPress={() => Linking.openURL('mailto:support@shramigo.com')}
              >
                <View style={[styles.helpIconBg, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="mail" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpOptionTitle, { color: textColor }]}>Email Support</Text>
                  <Text style={[styles.helpOptionSub, { color: subTextColor }]}>support@shramigo.com</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={subTextColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MenuItem({
  icon, label, sub, onPress, textColor, subTextColor, color, cardBorder, isLast,
}: {
  icon: string; label: string; sub: string; onPress: () => void;
  textColor: string; subTextColor: string; color: string; cardBorder: string; isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, !isLast && { borderBottomColor: cardBorder, borderBottomWidth: 1 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: color + '18' }]}>
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
  scroll: { paddingBottom: 36 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '900' },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  editHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    padding: 22,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
    marginBottom: 22,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  circle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  profileBio: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: 14,
    marginTop: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuSub: {
    fontSize: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
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
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSheetTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  inputGroup: {
    gap: 6,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  langNative: {
    fontSize: 16,
    fontWeight: '800',
  },
  langLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  helpIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  helpOptionSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
