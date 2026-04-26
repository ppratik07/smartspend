import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../constants/theme';

type Period = 'weekly' | 'monthly' | 'yearly';

interface PeriodToggleProps {
  selected: Period;
  onChange: (period: Period) => void;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export function PeriodToggle({ selected, onChange }: PeriodToggleProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.border }]}>
      {PERIODS.map(({ key, label }) => {
        const isActive = selected === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.tab,
              isActive && { backgroundColor: theme.card },
            ]}
            onPress={() => onChange(key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.text : theme.textSecondary,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
  },
});
