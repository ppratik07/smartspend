import { createContext, useContext } from 'react';
import { Colors, ColorScheme } from './colors';

export interface Theme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  inputBackground: string;
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySurface: string;
  accent: string;
  accentLight: string;
  accentSurface: string;
  income: string;
  expense: string;
  error: string;
  errorSurface: string;
  warning: string;
  isDark: boolean;
}

export function buildTheme(scheme: ColorScheme): Theme {
  const base = scheme === 'dark' ? Colors.dark : Colors.light;
  return {
    ...base,
    primary: Colors.primary,
    primaryDark: Colors.primaryDark,
    primaryLight: Colors.primaryLight,
    primarySurface: scheme === 'dark' ? '#1B3A2B' : Colors.primarySurface,
    accent: Colors.accent,
    accentLight: Colors.accentLight,
    accentSurface: scheme === 'dark' ? '#1A2E38' : Colors.accentSurface,
    income: Colors.income,
    expense: Colors.expense,
    error: Colors.error,
    errorSurface: scheme === 'dark' ? '#3D1217' : Colors.errorSurface,
    warning: Colors.warning,
    isDark: scheme === 'dark',
  };
}

export const ThemeContext = createContext<Theme>(buildTheme('light'));

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
