import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { AppText, GlowCard, Screen, Stack } from '@/components/ui';
import { colors } from '@/design/tokens';

export default function Index() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Screen>
        <GlowCard tone="cyan">
          <Stack>
            <ActivityIndicator color={colors.accentCyan} />
            <AppText variant="sectionTitle">Loading PocketNet</AppText>
            <AppText color={colors.textSecondary}>
              Syncing your handheld profile and social feed.
            </AppText>
          </Stack>
        </GlowCard>
      </Screen>
    );
  }

  if (!profile) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href={profile.favoriteHandheld ? '/(tabs)/home' : '/(auth)/onboarding'} />;
}
