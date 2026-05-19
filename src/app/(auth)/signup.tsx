import { router } from 'expo-router';
import { AtSign, Mail, ShieldCheck, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText, Badge, Button, ErrorBanner, GlowCard, Row, Screen, Stack, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { colors, spacing } from '@/design/tokens';

export default function SignupScreen() {
  const { signUp, hasSupabaseConfig } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  async function handleSignup() {
    try {
      setError(undefined);
      setNotice(undefined);
      setLoading(true);
      const desiredUsername = username.trim().toLowerCase();
      if (supabase && desiredUsername) {
        const { data: available, error: rpcError } = await supabase.rpc('is_username_available', {
          p_username: desiredUsername
        });
        if (rpcError) {
          throw new Error(rpcError.message);
        }
        if (available === false) {
          throw new Error('Username already taken, try a different name');
        }
      }
      await signUp(email.trim(), password, desiredUsername);
      setNotice('Check your email, confirm your account, then log in to finish setup.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <Stack gap={spacing.xs}>
        <Badge label="Create identity" tone="cyan" icon={UserPlus} align="center" />
        <AppText variant="display">Claim your PocketNet handle</AppText>
        <AppText color={colors.textSecondary}>
          Choose a username that looks good on profiles, posts, comments, and community member lists.
        </AppText>
      </Stack>

      {error ? <ErrorBanner body={error} /> : null}
      {notice ? (
        <GlowCard tone="focus">
          <Row>
            <ShieldCheck color={colors.success} size={20} />
            <AppText color={colors.textSecondary} style={styles.noticeCopy}>{notice}</AppText>
          </Row>
        </GlowCard>
      ) : null}

      <GlowCard tone="cyan">
        <TextField
          label="Email"
          leftIcon={Mail}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <TextField
          label="Username"
          leftIcon={AtSign}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          placeholder="pocketpilot"
        />
        <TextField
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
        />
        <Button
          label="Create account"
          icon={UserPlus}
          onPress={() => void handleSignup()}
          loading={loading}
          disabled={!hasSupabaseConfig}
        />
        {!hasSupabaseConfig ? (
          <AppText variant="caption" color={colors.textMuted}>
            Add Supabase public env values before creating production accounts.
          </AppText>
        ) : null}
      </GlowCard>
      <Button label="Back to login" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  noticeCopy: {
    flex: 1
  }
});
