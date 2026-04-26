import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  icon?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, icon, size = 'md' }: BadgeProps) {
  const theme = useTheme();
  const iconSize = size === 'sm' ? 12 : 16;
  const fontSize = size === 'sm' ? 11 : 13;
  const padding = size === 'sm' ? 4 : 6;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color + '20',
          padding,
          paddingHorizontal: padding + 4,
          gap: 4,
        },
      ]}
    >
      {icon && (
        <Ionicons name={icon as never} size={iconSize} color={color} />
      )}
      <Text style={[styles.label, { color, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  label: {
    fontWeight: '600',
  },
});
