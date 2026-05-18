import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StartupIntro } from '@/components/StartupIntro';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { SocialProvider } from '@/features/social/SocialProvider';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  const [introVisible, setIntroVisible] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthProvider>
        <SocialProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background }
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="community/[id]" />
            <Stack.Screen name="user/[id]" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="notifications" />
          </Stack>
          {introVisible ? <StartupIntro onDone={() => setIntroVisible(false)} /> : null}
        </SocialProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
