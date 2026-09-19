import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/appConstants';
import { getStoredUser } from '@/features/auth/services';
import { BrandLogo } from '@/components/BrandLogo';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      try {
        const user = await getStoredUser();
        if (user) {
          if (user.role === 'customer') router.replace('/(customer)');
          else if (user.role === 'worker') router.replace('/(worker)');
          else if (user.role === 'admin') router.replace('/(admin)');
          else router.replace('/welcome');
        } else {
          router.replace('/welcome');
        }
      } catch {
        router.replace('/welcome');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative circles */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <BrandLogo size="lg" />
        </View>

        <Text style={styles.title}>ShramiGo</Text>
        <Text style={styles.subtitle}>Connecting people. Empowering work.</Text>
        <Text style={styles.tagline}>Your trusted platform for local services</Text>

        {/* Loading dots */}
        <View style={styles.dotsContainer}>
          {[0, 150, 300].map((delay, i) => (
            <LoadingDot key={i} delay={delay} />
          ))}
        </View>
        <Text style={styles.loadingText}>Getting things ready...</Text>
      </Animated.View>

      {/* Bottom info */}
      <View style={styles.bottomSection}>
        <View style={styles.featureGrid}>
          <FeatureItem icon="search" label="Find Services" color={COLORS.accent} bg="#FFF1E8" />
          <FeatureItem icon="briefcase" label="Find Work" color={COLORS.primary} bg={COLORS.primaryLight} />
          <FeatureItem icon="shield-checkmark" label="Trusted" color="#16A34A" bg="#F0FDF4" />
        </View>
        <Text style={styles.bottomTagline}>Empowering communities through local services</Text>
      </View>
    </View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opacityAnim = React.useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.dot, { opacity: opacityAnim }]} />;
}

function FeatureItem({ icon, label, color, bg }: { icon: string; label: string; color: string; bg: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  circleTopRight: { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)' },
  circleBottomLeft: { position: 'absolute', bottom: 200, left: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.05)' },
  content: { alignItems: 'center', paddingHorizontal: 24 },
  logoContainer: { marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 36, fontWeight: '900', color: COLORS.primary, letterSpacing: -2 },
  title: { fontSize: 40, fontWeight: '800', color: COLORS.white, letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 4 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 40 },
  dotsContainer: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white },
  loadingText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  bottomSection: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  featureGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  featureItem: { alignItems: 'center', gap: 6 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 11, fontWeight: '600', color: '#1F2937' },
  bottomTagline: { fontSize: 10, color: '#9CA3AF', textAlign: 'center' },
});
