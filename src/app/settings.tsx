import { router } from 'expo-router';
import { LogOut, ShieldCheck } from 'lucide-react-native';
import { Alert } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/lib/theme';

export default function SettingsScreen() {
  const { signOut, isPreviewMode, hasSupabaseConfig } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Could not sign out', error instanceof Error ? error.message : 'Try again.');
    }
  }

  return (
    <Screen scroll>
      <Button label="Back" compact variant="ghost" onPress={() => router.back()} />
      <AppText variant="heading">Settings</AppText>
      <Card>
        <ShieldCheck color={colors.lime} size={24} />
        <AppText variant="title">Security</AppText>
        <AppText color={colors.textMuted}>
          PocketNet stores sessions through Supabase Auth and only expects public mobile-safe env values in the client.
        </AppText>
        <AppText variant="small" color={colors.textMuted}>
          Mode: {isPreviewMode ? 'local preview' : 'Supabase'} · Supabase config: {hasSupabaseConfig ? 'ready' : 'missing'}
        </AppText>
      </Card>
      <Card>
        <AppText variant="title">Privacy Basics</AppText>
        <AppText color={colors.textMuted}>
          Profile details are public by design. Current game status is manual in v1 and can be cleared any time from Edit Profile.
        </AppText>
      </Card>
      <Button label="Edit profile" variant="secondary" onPress={() => router.push('/edit-profile')} />
      <Button label="Sign out" icon={LogOut} variant="danger" onPress={() => void handleSignOut()} />
    </Screen>
  );
}
