import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/AuthProvider';
import { AppText, Screen } from '@/components/ui';

export default function Index() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Screen>
        <AppText>Loading PocketNet...</AppText>
      </Screen>
    );
  }

  return <Redirect href={profile ? '/(tabs)/home' : '/(auth)/login'} />;
}
