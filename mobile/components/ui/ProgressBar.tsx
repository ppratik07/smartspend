import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../constants/theme';

interface ProgressBarProps {
  percent: number; // 0-100
  color?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export function ProgressBar({
  percent,
  color,
  height = 6,
  style,
  animated = true,
}: ProgressBarProps) {
  const theme = useTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const barColor = color || (clampedPercent >= 100 ? theme.error : clampedPercent >= 80 ? theme.warning : theme.primary);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedPercent,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedPercent);
    }
  }, [clampedPercent, animated]);

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: theme.border, borderRadius: height / 2 },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: barColor,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', width: '100%' },
  fill: {},
});
