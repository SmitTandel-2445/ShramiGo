import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: {
    outer: 44,
    inner: 32,
    icon: 18,
    outerRadius: 13,
    innerRadius: 9,
  },
  md: {
    outer: 56,
    inner: 42,
    icon: 23,
    outerRadius: 17,
    innerRadius: 12,
  },
  lg: {
    outer: 76,
    inner: 56,
    icon: 32,
    outerRadius: 22,
    innerRadius: 16,
  },
};

export function BrandLogo({ size = 'md' }: BrandLogoProps) {
  const s = sizes[size];
  return (
    <View
      style={[
        styles.outerContainer,
        {
          width: s.outer,
          height: s.outer,
          borderRadius: s.outerRadius,
        },
      ]}
    >
      <View
        style={[
          styles.innerContainer,
          {
            width: s.inner,
            height: s.inner,
            borderRadius: s.innerRadius,
          },
        ]}
      >
        <FontAwesome5 name="handshake" size={s.icon} color="#FFFFFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  innerContainer: {
    backgroundColor: '#FF5A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

