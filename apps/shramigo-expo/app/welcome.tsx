import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BrandLogo } from '@/components/BrandLogo';
import { COLORS } from '@/lib/appConstants';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.primary }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.circleTopRight} />
          <View style={styles.circleBottomLeft} />
          <View style={styles.heroContent}>
            <View style={styles.logoRow}>
              <BrandLogo size="md" />
            </View>
            <Text style={styles.welcomeLabel}>Welcome to</Text>
            <Text style={styles.title}>ShramiGo</Text>
            <Text style={styles.heroDesc}>
              A trusted platform connecting customers with skilled local professionals.
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.heading}>One platform. Two possibilities.</Text>
          <Text style={styles.subheading}>
            Whether you need a service or want to offer your skills, ShramiGo connects you with the right people.
          </Text>

          {/* Role Cards */}
          <View style={styles.cardsRow}>
            <View style={[styles.card, { backgroundColor: '#FFF4EE', borderColor: '#FFE0CC' }]}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.white }]}>
                <Ionicons name="search" size={22} color={COLORS.accent} />
              </View>
              <Text style={styles.cardTitle}>Need a Service?</Text>
              <Text style={styles.cardDesc}>Find trusted professionals near you.</Text>
            </View>
            <View style={[styles.card, { backgroundColor: COLORS.primaryLight, borderColor: '#B2E0DD' }]}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.white }]}>
                <Ionicons name="briefcase" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.cardTitle}>Offer Your Skills</Text>
              <Text style={styles.cardDesc}>Find jobs and grow your work.</Text>
            </View>
          </View>

          {/* Trust Points */}
          <View style={styles.trustList}>
            <TrustPoint icon="checkmark-circle" text="Verified local professionals" />
            <TrustPoint icon="shield-checkmark" text="Safe and trusted connections" />
          </View>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/role-selection')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.ctaHint}>Choose your role to continue</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function TrustPoint({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.trustRow}>
      <Ionicons name={icon as any} size={20} color={COLORS.primary} />
      <Text style={styles.trustText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1 },
  hero: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden' },
  circleTopRight: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)' },
  circleBottomLeft: { position: 'absolute', bottom: -60, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)' },
  heroContent: { zIndex: 1 },
  logoRow: { marginBottom: 24 },
  welcomeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 40, fontWeight: '800', color: COLORS.white, letterSpacing: -1, marginBottom: 12 },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22, maxWidth: 280 },
  content: { paddingHorizontal: 24, paddingTop: 28 },
  heading: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subheading: { fontSize: 14, color: '#6B7280', lineHeight: 21, marginBottom: 24 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  card: { flex: 1, borderRadius: 20, borderWidth: 1, padding: 16 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  trustList: { gap: 12, marginBottom: 8 },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trustText: { fontSize: 14, color: '#4B5563' },
  cta: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.accent, height: 56, borderRadius: 20, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  ctaText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  ctaHint: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 12 },
});
