import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getWorkerSkills, createWorkerSkill, deleteWorkerSkill,
  type WorkerSkill,
} from '@/features/workers/services';

const POPULAR_CATEGORIES = [
  { name: 'Electrician', icon: 'flash' },
  { name: 'Plumber', icon: 'water' },
  { name: 'Carpenter', icon: 'hammer' },
  { name: 'Cleaner', icon: 'sparkles' },
  { name: 'Painter', icon: 'color-palette' },
  { name: 'AC Repair', icon: 'snow' },
  { name: 'Mason', icon: 'business' },
  { name: 'Driver', icon: 'car' },
  { name: 'Appliance Repair', icon: 'tv' },
  { name: 'Gardener', icon: 'leaf' },
];

export default function WorkerSkillsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [skills, setSkills] = useState<WorkerSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add skill form
  const [selectedCategory, setSelectedCategory] = useState('Electrician');
  const [skillName, setSkillName] = useState('');
  const [description, setDescription] = useState('');

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#242424' : '#F3F4F6';

  const loadSkills = async () => {
    try {
      const data = await getWorkerSkills();
      setSkills(data || []);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSkills(); }, []);

  const handleAddSkill = async () => {
    const finalName = skillName.trim() || selectedCategory;
    try {
      setSaving(true);
      const newSkill = await createWorkerSkill({
        skill_name: finalName,
        category: selectedCategory,
        description: description.trim() || `${selectedCategory} expert service`,
      });
      setSkills(prev => [...prev, newSkill]);
      setShowAddModal(false);
      setSkillName('');
      setDescription('');
      Alert.alert(t('Skill Added'), `${finalName} has been added to your profile.`);
    } catch {
      Alert.alert(t('Error'), 'Failed to add skill.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = (id: number, name: string) => {
    Alert.alert(t('Delete Skill'), `Are you sure you want to remove "${name}" from your profile?`, [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Reject'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWorkerSkill(id);
            setSkills(prev => prev.filter(s => s.id !== id));
          } catch {
            Alert.alert(t('Error'), 'Failed to delete skill.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: cardBg, borderColor: cardBorder }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.topTitle, { color: textColor }]}>{t('Skills & Services')}</Text>
          <Text style={[styles.topSub, { color: subTextColor }]}>{t('Manage categories')}</Text>
        </View>
        <TouchableOpacity
          style={styles.addHeaderBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.addHeaderText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={[styles.loadingText, { color: subTextColor }]}>Loading your skills...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Info Banner */}
          <View style={[styles.banner, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary + '30' }]}>
            <Ionicons name="bulb-outline" size={22} color={COLORS.primary} />
            <Text style={styles.bannerText}>
              Skills help the ShramiGo AI matchmaking system recommend you to nearby customers looking for your exact trade.
            </Text>
          </View>

          {/* Active Skills List */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {t('Skills')} ({skills.length})
            </Text>

            {skills.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <Ionicons name="construct-outline" size={40} color={subTextColor} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>No skills added yet</Text>
                <Text style={[styles.emptyDesc, { color: subTextColor }]}>
                  Add the services and trades you excel at so customers can start booking you.
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.emptyAddBtnText}>+ Add First Skill</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.skillsList}>
                {skills.map(skill => (
                  <View
                    key={skill.id}
                    style={[styles.skillCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                  >
                    <View style={[styles.skillIconWrap, { backgroundColor: COLORS.primaryLight }]}>
                      <Ionicons name="hammer-outline" size={20} color={COLORS.primary} />
                    </View>

                    <View style={styles.skillDetails}>
                      <Text style={[styles.skillName, { color: textColor }]}>{skill.skill_name}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{skill.category || 'General Service'}</Text>
                      </View>
                      {skill.description ? (
                        <Text style={[styles.skillDesc, { color: subTextColor }]} numberOfLines={2}>
                          {skill.description}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteSkill(skill.id, skill.skill_name)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Add Skill Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Add Skill or Service</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Select Category</Text>
              <View style={styles.categoriesGrid}>
                {POPULAR_CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      style={[
                        styles.categoryCard,
                        {
                          backgroundColor: isSelected ? COLORS.primaryLight : inputBg,
                          borderColor: isSelected ? COLORS.primary : cardBorder,
                        },
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat.name);
                        if (!skillName) setSkillName(cat.name);
                      }}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={20}
                        color={isSelected ? COLORS.primary : subTextColor}
                      />
                      <Text
                        style={[
                          styles.categoryCardText,
                          { color: isSelected ? COLORS.primary : textColor },
                        ]}
                      >
                        {t(cat.name)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textColor }]}>Specific Skill Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: cardBorder }]}
                  value={skillName}
                  onChangeText={setSkillName}
                  placeholder="e.g. Master Wiring, Pipe Fitting, Furniture Assembly"
                  placeholderTextColor={subTextColor}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textColor }]}>Experience / Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: textColor, borderColor: cardBorder }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. 5+ years commercial experience with certified tools."
                  placeholderTextColor={subTextColor}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAddSkill}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Add to Profile</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  topSub: {
    fontSize: 12,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addHeaderText: {
    color: COLORS.white,
    fontSize: 13,
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
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 10,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  emptyAddBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  emptyAddBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  skillsList: {
    gap: 10,
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  skillIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skillDetails: {
    flex: 1,
    gap: 4,
  },
  skillName: {
    fontSize: 15,
    fontWeight: '800',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  skillDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    marginLeft: 8,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  categoryCardText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    height: 70,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
