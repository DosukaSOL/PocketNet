import { router } from 'expo-router';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText, Badge, Button, Card, ErrorBanner, Row, Screen, Stack, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, spacing } from '@/design/tokens';

export default function ResetScreen() {
  const { resetPassword, hasSupabaseConfig } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  async function handleReset() {
    try {
      setError(undefined);
      setNotice(undefined);
      setLoading(true);
      await resetPassword(email.trim());
      setNotice('Reset email sent. Follow the secure link from Supabase Auth to set a new password.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <Stack gap={spacing.xs}>
        <Badge label="Account recovery" tone="purple" icon={KeyRound} />
        <AppText variant="display">Reset password</AppText>
        <AppText color={colors.textSecondary}>Use the email attached to your PocketNet account.</AppText>
      </Stack>

      {error ? <ErrorBanner body={error} /> : null}
      {notice ? (
        <Card gradient="pocket">
          <Row>
            <ShieldCheck color={colors.success} size={20} />
            <AppText color={colors.textSecondary} style={styles.noticeCopy}>{notice}</AppText>
          </Row>
        </Card>
      ) : null}

      <Card elevated>
        <TextField
          label="Email"
          leftIcon={Mail}
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
        {!hasSupabaseConfig ? (
          <AppText variant="caption" color={colors.textMuted}>
            Password reset needs Supabase Auth configured.
          </AppText>
        ) : null}
      </Card>
      <Button label="Back" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  noticeCopy: {
    flex: 1
  }
});
