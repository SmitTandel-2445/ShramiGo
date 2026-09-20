import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getWorkerAvailability, createWorkerAvailability, updateWorkerAvailability,
  type WorkerAvailability,
} from '@/features/workers/services';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM',
];

interface DaySchedule {
  day: string;
  is_available: boolean;
  start_time: string;
  end_time: string;
  id?: number;
}

export default function WorkerAvailabilityScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map(d => ({
      day: d,
      is_available: d !== 'Sunday',
      start_time: '09:00 AM',
      end_time: '06:00 PM',
    }))
  );
  const [globalDuty, setGlobalDuty] = useState(true);

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const loadAvailability = async () => {
    try {
      const data = await getWorkerAvailability();
      if (data && data.length > 0) {
        setSchedule(DAYS_OF_WEEK.map(day => {
          const match = data.find(item => item.day_of_week.toLowerCase() === day.toLowerCase());
          if (match) {
            return {
              day,
              is_available: match.is_available,
              start_time: match.start_time || '09:00 AM',
              end_time: match.end_time || '06:00 PM',
              id: match.id,
            };
          }
          return {
            day,
            is_available: day !== 'Sunday',
            start_time: '09:00 AM',
            end_time: '06:00 PM',
          };
        }));
        setGlobalDuty(data.some(d => d.is_available));
      }
    } catch {
      // Fallback to default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAvailability(); }, []);

  const handleToggleDay = (day: string, val: boolean) => {
    setSchedule(prev => prev.map(s => s.day === day ? { ...s, is_available: val } : s));
  };

  const applyPreset = (presetType: 'weekdays' | 'all' | 'custom') => {
    if (presetType === 'weekdays') {
      setSchedule(prev => prev.map(s => ({
        ...s,
        is_available: s.day !== 'Saturday' && s.day !== 'Sunday',
        start_time: '09:00 AM',
        end_time: '06:00 PM',
      })));
    } else if (presetType === 'all') {
      setSchedule(prev => prev.map(s => ({
        ...s,
        is_available: true,
        start_time: '08:00 AM',
        end_time: '08:00 PM',
      })));
    }
    Alert.alert(t('Preset Applied'), 'Your schedule has been updated. Tap "Save Schedule" to commit.');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      for (const item of schedule) {
        if (item.id) {
          await updateWorkerAvailability(item.id, {
            day_of_week: item.day,
            start_time: item.start_time,
            end_time: item.end_time,
            is_available: item.is_available,
          });
        } else {
          await createWorkerAvailability({
            day_of_week: item.day,
            start_time: item.start_time,
            end_time: item.end_time,
            is_available: item.is_available,
          });
        }
      }
      Alert.alert(t('Schedule Saved'), 'Your weekly availability hours are updated.');
      router.back();
    } catch {
      Alert.alert(t('Error'), 'Failed to save schedule.');
    } finally {
      setSaving(false);
    }
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
          <Text style={[styles.topTitle, { color: textColor }]}>{t('My Schedule')}</Text>
          <Text style={[styles.topSub, { color: subTextColor }]}>{t('Manage your working hours')}</Text>
        </View>
        <TouchableOpacity
          style={styles.saveHeaderBtn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.saveHeaderText}>{t('Save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={[styles.loadingText, { color: subTextColor }]}>Loading your schedule...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Master Duty Card */}
          <View style={[styles.masterCard, { backgroundColor: COLORS.primary }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.masterTitle}>{t('Duty on')}</Text>
              <Text style={styles.masterDesc}>
                {globalDuty
                  ? t("You're Available")
                  : t("You're Offline")}
              </Text>
            </View>
            <Switch
              value={globalDuty}
              onValueChange={v => {
                setGlobalDuty(v);
                setSchedule(prev => prev.map(s => ({ ...s, is_available: v })));
              }}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#10B981' }}
              thumbColor={COLORS.white}
            />
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsSection}>
            <Text style={[styles.presetsTitle, { color: subTextColor }]}>QUICK PRESETS</Text>
            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={[styles.presetChip, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => applyPreset('weekdays')}
              >
                <Ionicons name="briefcase-outline" size={15} color={COLORS.primary} />
                <Text style={[styles.presetChipText, { color: textColor }]}>Mon - Fri (9 to 6)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetChip, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => applyPreset('all')}
              >
                <Ionicons name="sunny-outline" size={15} color={COLORS.accent} />
                <Text style={[styles.presetChipText, { color: textColor }]}>All 7 Days</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Days List */}
          <View style={styles.daysList}>
            {schedule.map(item => (
              <View
                key={item.day}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: item.is_available ? COLORS.primary + '60' : cardBorder,
                  },
                ]}
              >
                <View style={styles.dayTopRow}>
                  <View style={styles.dayNameGroup}>
                    <View
                      style={[
                        styles.dayIndicator,
                        { backgroundColor: item.is_available ? '#10B981' : '#9CA3AF' },
                      ]}
                    />
                    <Text style={[styles.dayName, { color: textColor }]}>{t(item.day)}</Text>
                  </View>

                  <Switch
                    value={item.is_available}
                    onValueChange={val => handleToggleDay(item.day, val)}
                    trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
                    thumbColor={COLORS.white}
                  />
                </View>

                {item.is_available ? (
                  <View style={styles.timeSlotsRow}>
                    <View style={styles.timeBlock}>
                      <Text style={[styles.timeLabel, { color: subTextColor }]}>START</Text>
                      <View style={[styles.timeChip, { backgroundColor: isDark ? '#262626' : '#F3F4F6' }]}>
                        <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                        <Text style={[styles.timeValue, { color: textColor }]}>{item.start_time}</Text>
                      </View>
                    </View>

                    <Ionicons name="arrow-forward" size={16} color={subTextColor} style={{ marginTop: 14 }} />

                    <View style={styles.timeBlock}>
                      <Text style={[styles.timeLabel, { color: subTextColor }]}>END</Text>
                      <View style={[styles.timeChip, { backgroundColor: isDark ? '#262626' : '#F3F4F6' }]}>
                        <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                        <Text style={[styles.timeValue, { color: textColor }]}>{item.end_time}</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.offText, { color: subTextColor }]}>Marked as Day Off</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  saveHeaderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 64,
    alignItems: 'center',
  },
  saveHeaderText: {
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
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 20,
    marginVertical: 10,
  },
  masterTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.white,
  },
  masterDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  presetsSection: {
    marginVertical: 12,
    gap: 8,
  },
  presetsTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  daysList: {
    gap: 10,
    marginTop: 6,
  },
  dayCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '800',
  },
  timeSlotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.15)',
  },
  timeBlock: {
    gap: 4,
    flex: 1,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  offText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
});
