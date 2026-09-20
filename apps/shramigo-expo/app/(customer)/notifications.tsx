import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomerNotif {
  id: string;
  type: 'booking' | 'offer' | 'system';
  title: string;
  message: string;
  time: string;
  is_read: boolean;
}

const INITIAL_NOTIFICATIONS: CustomerNotif[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Worker Assigned & Confirmed',
    message: 'Rajesh Kumar (Electrician) has accepted your booking #102 for 10:00 AM.',
    time: '15 mins ago',
    is_read: false,
  },
  {
    id: '2',
    type: 'booking',
    title: 'Service Completed Successfully',
    message: 'Your AC Repair service was marked completed. Tap to view invoice & leave a review.',
    time: '3 hours ago',
    is_read: false,
  },
  {
    id: '3',
    type: 'offer',
    title: 'Cooperative Monsoon Discount',
    message: 'Enjoy 15% off on all home plumbing, water leakage, and roof repairs this week.',
    time: 'Yesterday',
    is_read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Worker Verification Guarantee',
    message: 'All workers dispatched via ShramiGo are verified by local cooperative committees with background checks.',
    time: '2 days ago',
    is_read: true,
  },
];

const FILTERS = ['All', 'Bookings', 'Offers', 'Updates'];

export default function CustomerNotificationsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [notifications, setNotifications] = useState<CustomerNotif[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('All');

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Bookings') return n.type === 'booking';
    if (activeFilter === 'Offers') return n.type === 'offer';
    if (activeFilter === 'Updates') return n.type === 'system';
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return { icon: 'calendar', color: COLORS.accent, bg: '#FFF1E8' };
      case 'offer':
        return { icon: 'pricetag', color: '#16A34A', bg: '#DCFCE7' };
      default:
        return { icon: 'notifications', color: COLORS.primary, bg: COLORS.primaryLight };
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: cardBg, borderColor: cardBorder }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.topTitle, { color: textColor }]}>{t('Notifications')}</Text>
          <Text style={[styles.topSub, { color: subTextColor }]}>
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markReadBtn}>
            <Text style={styles.markReadText}>Read All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const isActive = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? COLORS.accent : cardBg,
                  borderColor: isActive ? COLORS.accent : cardBorder,
                },
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isActive ? COLORS.white : subTextColor },
                ]}
              >
                {t(f)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Ionicons name="notifications-off-outline" size={40} color={subTextColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No notifications in this filter</Text>
            <Text style={[styles.emptyDesc, { color: subTextColor }]}>
              You're all caught up with your latest service alerts.
            </Text>
          </View>
        ) : (
          filtered.map(item => {
            const iconData = getNotifIcon(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: item.is_read ? cardBorder : COLORS.accent + '50',
                  },
                ]}
                onPress={() => {
                  setNotifications(prev =>
                    prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n))
                  );
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrap, { backgroundColor: iconData.bg }]}>
                  <Ionicons name={iconData.icon as any} size={20} color={iconData.color} />
                </View>

                <View style={styles.notifBody}>
                  <View style={styles.notifHeaderRow}>
                    <Text style={[styles.notifTitle, { color: textColor }]}>{item.title}</Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={[styles.notifMsg, { color: subTextColor }]}>{item.message}</Text>
                  <Text style={[styles.notifTime, { color: subTextColor }]}>{item.time}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  topTitle: { fontSize: 20, fontWeight: '900' },
  topSub: { fontSize: 12 },
  markReadBtn: {
    backgroundColor: '#FFF1E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  markReadText: { color: COLORS.accent, fontSize: 12, fontWeight: '800' },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: '700' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
    gap: 10,
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
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifBody: { flex: 1, gap: 4 },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: { fontSize: 14, fontWeight: '800', flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginLeft: 6,
  },
  notifMsg: { fontSize: 12, lineHeight: 17 },
  notifTime: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
