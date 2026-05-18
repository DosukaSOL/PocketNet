import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StartupIntro } from '@/components/StartupIntro';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { SocialProvider } from '@/features/social/SocialProvider';
import { ThemeProvider } from '@/features/theme/ThemeProvider';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  const [introVisible, setIntroVisible] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    // Lock to portrait at runtime. Some dual-screen handhelds (e.g. AYN Thor)
    // ignore the AndroidManifest orientation hint on the secondary display, so
    // we enforce it from JS as well.
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {
      // Best-effort: if the platform refuses, the manifest setting still applies.
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeProvider>
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
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

