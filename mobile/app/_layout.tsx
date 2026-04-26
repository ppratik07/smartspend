import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeContext, buildTheme } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { initLocalDB } from '../services/localDB';
import { requestPermissions } from '../services/notifications';

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { user } = useAuthStore();

  useEffect(() => {
    initLocalDB().catch(console.warn);
    requestPermissions().catch(console.warn);
  }, []);
  const themePreference = user?.theme || systemScheme || 'light';
  const theme = buildTheme(themePreference as 'light' | 'dark');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeContext.Provider value={theme}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="transactions/index" options={{ headerShown: true, title: 'Transactions', presentation: 'card' }} />
          <Stack.Screen name="budgets/index" options={{ headerShown: true, title: 'Budgets', presentation: 'card' }} />
          <Stack.Screen name="goals/index" options={{ headerShown: true, title: 'Goals', presentation: 'card' }} />
          <Stack.Screen name="goals/[id]" options={{ headerShown: true, title: 'Goal Detail', presentation: 'card' }} />
          <Stack.Screen name="categories/index" options={{ headerShown: true, title: 'Categories', presentation: 'card' }} />
        </Stack>
      </ThemeContext.Provider>
    </GestureHandlerRootView>
  );
}
