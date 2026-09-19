import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/appConstants';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 36, text: 16, border: 2 },
  md: { container: 48, text: 22, border: 2.5 },
  lg: { container: 64, text: 30, border: 3 },
};

export function BrandLogo({ size = 'md' }: BrandLogoProps) {
  const s = sizes[size];
  return (
    <View style={[styles.container, { width: s.container, height: s.container, borderRadius: s.container / 4, borderWidth: s.border }]}>
      <Text style={[styles.text, { fontSize: s.text }]}>S</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
  },
});
