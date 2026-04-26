import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../constants/theme';

export default function AuthLayout() {
  const router = useRouter();
  const { restoreSession } = useAuthStore();
  const theme = useTheme();

  useEffect(() => {
    restoreSession().then((ok) => {
      if (ok) router.replace('/(tabs)');
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
