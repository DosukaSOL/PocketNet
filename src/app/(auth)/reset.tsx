import { router } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Button, Card, AppText, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/lib/theme';

export default function ResetScreen() {
  const { resetPassword, hasSupabaseConfig } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    try {
      setLoading(true);
      await resetPassword(email.trim());
      Alert.alert('Reset email sent', 'Follow the link from Supabase Auth to set a new password.');
      router.back();
    } catch (error) {
      Alert.alert('Could not send reset', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <AppText variant="heading">Reset Password</AppText>
      <AppText color={colors.textMuted}>Use the email attached to your PocketNet account.</AppText>
      <Card>
        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <Button
          label="Send reset link"
          icon={KeyRound}
          loading={loading}
          disabled={!hasSupabaseConfig}
          onPress={() => void handleReset()}
        />
      </Card>
      <Button label="Back" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
