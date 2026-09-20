import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/appConstants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface WelfareScheme {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  details: string[];
}

const SCHEMES: WelfareScheme[] = [
  {
    id: 'insurance',
    title: '₹2,00,000 Accidental Insurance',
    subtitle: 'Comprehensive accidental disability & life insurance sponsored by ShramiGo Cooperative.',
    badge: 'ACTIVE BENEFIT',
    badgeColor: '#10B981',
    icon: 'shield-checkmark',
    iconColor: '#10B981',
    iconBg: '#DCFCE7',
    details: [
      '₹2,00,000 accidental death cover for on-duty and off-duty incidents.',
      '₹1,00,000 permanent disability assistance.',
      'Emergency hospitalization cash assistance up to ₹25,000.',
      'Instant cashless claim filing via ShramiGo partner network.',
    ],
  },
  {
    id: 'eshram',
    title: 'e-Shram & Social Security Card',
    subtitle: 'National unorganised worker registration for direct government subsidy distribution.',
    badge: 'GOVERNMENT SCHEME',
    badgeColor: '#3B82F6',
    icon: 'card',
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
    details: [
      '12-digit Universal Account Number (UAN) valid across India.',
      'Direct benefit transfer of state worker welfare funds.',
      'Eligibility for PM-SYM Pension Scheme (₹3,000/month after 60).',
      'Free digital verification certificate.',
    ],
  },
  {
    id: 'health',
    title: 'Free Family Tele-Health Consultations',
    subtitle: '24x7 doctor consultations on call for you and your family members.',
    badge: 'COOPERATIVE HEALTH',
    badgeColor: '#EC4899',
    icon: 'medkit',
    iconColor: '#DB2777',
    iconBg: '#FCE7F3',
    details: [
      'Unlimited audio/video doctor consultations in Hindi, Gujarati, English.',
      'Prescription delivered directly via WhatsApp or SMS.',
      'Specialist consultations for general medicine, pediatric, and dermatology.',
      'Up to 20% discount on generic medicines at partner pharmacies.',
    ],
  },
  {
    id: 'tools',
    title: 'Tool Financing & Equipment Grants',
    subtitle: 'Low-cost micro loans to upgrade professional electrical, plumbing & mechanical tools.',
    badge: 'UPGRADE AID',
    badgeColor: '#F59E0B',
    icon: 'hammer',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    details: [
      'Instant tool purchase financing from ₹5,000 up to ₹50,000.',
      'Zero processing fee for verified cooperative members.',
      'Flexible weekly repayment deducted seamlessly from job payouts.',
      'Special discounts with certified tool manufacturers.',
    ],
  },
];

export default function WorkerWelfareScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [selectedScheme, setSelectedScheme] = useState<WelfareScheme | null>(null);

  const bg = isDark ? '#0D0D0D' : '#F7F8F8';
  const cardBg = isDark ? '#1A1A1A' : COLORS.white;
  const cardBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const handleCallEmergency = () => {
    Linking.openURL('tel:18001234567');
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
          <Text style={[styles.topTitle, { color: textColor }]}>{t('Welfare & Benefits')}</Text>
          <Text style={[styles.topSub, { color: subTextColor }]}>Cooperative programs & insurance</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Emergency SOS Banner */}
        <View style={styles.sosCard}>
          <View style={styles.sosLeft}>
            <View style={styles.sosIconCircle}>
              <Ionicons name="call" size={22} color={COLORS.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sosTitle}>Worker Safety & SOS Helpline</Text>
              <Text style={styles.sosSub}>24x7 emergency and on-duty assistance</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.sosCallBtn} onPress={handleCallEmergency}>
            <Text style={styles.sosCallText}>Call SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Schemes List */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Active Welfare Programs</Text>
        <View style={styles.schemesList}>
          {SCHEMES.map(scheme => (
            <TouchableOpacity
              key={scheme.id}
              style={[styles.schemeCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              onPress={() => setSelectedScheme(scheme)}
              activeOpacity={0.8}
            >
              <View style={[styles.schemeIconWrap, { backgroundColor: scheme.iconBg }]}>
                <Ionicons name={scheme.icon as any} size={24} color={scheme.iconColor} />
              </View>

              <View style={styles.schemeInfo}>
                <View style={styles.schemeHeaderRow}>
                  <View style={[styles.schemeBadge, { backgroundColor: scheme.iconBg }]}>
                    <Text style={[styles.schemeBadgeText, { color: scheme.iconColor }]}>
                      {scheme.badge}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.schemeTitle, { color: textColor }]}>{scheme.title}</Text>
                <Text style={[styles.schemeSub, { color: subTextColor }]} numberOfLines={2}>
                  {scheme.subtitle}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={subTextColor} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Scheme Details Modal */}
      <Modal
        visible={!!selectedScheme}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedScheme(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
            <View style={styles.modalTopBar}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.modalTitle, { color: textColor }]}>{selectedScheme?.title}</Text>
                <Text style={[styles.modalSub, { color: subTextColor }]}>{selectedScheme?.subtitle}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedScheme(null)}
              >
                <Ionicons name="close" size={20} color={subTextColor} />
              </TouchableOpacity>
            </View>

            {selectedScheme && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <View style={styles.modalDetailsList}>
                  <Text style={[styles.modalGroupTitle, { color: textColor }]}>Key Program Benefits</Text>
                  {selectedScheme.details.map((detail, idx) => (
                    <View key={idx} style={styles.detailRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={[styles.detailText, { color: textColor }]}>{detail}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.claimBtn}
                  onPress={() => {
                    Alert.alert(
                      'Benefit Support',
                      `For assistance with ${selectedScheme.title}, contact your ShramiGo cooperative representative or call our toll-free support helpline.`,
                      [
                        { text: 'OK', style: 'default' },
                        { text: 'Call Support', onPress: handleCallEmergency },
                      ]
                    );
                  }}
                >
                  <Ionicons name="help-buoy" size={18} color={COLORS.white} />
                  <Text style={styles.claimBtnText}>Access or Claim Benefit</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sosCard: {
    backgroundColor: '#DC2626',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  sosLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sosIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  sosSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  sosCallBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sosCallText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginVertical: 12,
  },
  schemesList: {
    gap: 12,
  },
  schemeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  schemeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  schemeInfo: {
    flex: 1,
    gap: 4,
  },
  schemeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schemeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  schemeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  schemeTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  schemeSub: {
    fontSize: 12,
    lineHeight: 16,
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
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  modalDetailsList: {
    gap: 12,
    marginVertical: 14,
  },
  modalGroupTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 16,
    marginTop: 18,
  },
  claimBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
