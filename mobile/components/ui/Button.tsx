import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../constants/theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  size = 'md',
  style,
  textStyle,
  leftIcon,
  disabled,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor:
      variant === 'primary'
        ? theme.primaryDark
        : variant === 'danger'
        ? theme.error
        : 'transparent',
    borderWidth: variant === 'outline' ? 1.5 : 0,
    borderColor: variant === 'outline' ? theme.primary : 'transparent',
    borderRadius: 14,
    paddingVertical: size === 'sm' ? 10 : size === 'lg' ? 18 : 14,
    paddingHorizontal: size === 'sm' ? 16 : size === 'lg' ? 28 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.6 : 1,
    gap: 8,
  };

  const labelColor =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'outline'
      ? theme.primary
      : theme.text;

  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.label, { color: labelColor, fontSize, fontWeight: '700' }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    letterSpacing: 0.3,
  },
});
