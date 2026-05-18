import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StartupIntro } from '@/components/StartupIntro';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { MessagingProvider } from '@/features/messaging/MessagingProvider';
import { SocialProvider } from '@/features/social/SocialProvider';
import { ThemeProvider } from '@/features/theme/ThemeProvider';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  const [introVisible, setIntroVisible] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    // Let the OS pick a sensible orientation. We previously hard-locked to
    // PORTRAIT_UP, which launched the activity sideways on the AYN Thor's
    // secondary screen because the panel's natural orientation is rotated.
    // OrientationLock.DEFAULT honours the device's natural orientation per
    // display, which is the right-side-up answer on every screen we tested.
    ScreenOrientation.unlockAsync().catch(() => {
      // Best-effort: if the platform refuses, the manifest setting still applies.
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeProvider>
        <AuthProvider>
          <SocialProvider>
            <MessagingProvider>
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
                <Stack.Screen name="friends" />
                <Stack.Screen name="messages/index" />
                <Stack.Screen name="messages/[id]" />
              </Stack>
              {introVisible ? <StartupIntro onDone={() => setIntroVisible(false)} /> : null}
            </MessagingProvider>
          </SocialProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

