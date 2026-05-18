import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { AtSign, Gamepad2, LogIn, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText, Badge, Button, ErrorBanner, GlowCard, Row, Screen, Stack, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, gradients, radius, spacing } from '@/design/tokens';

export default function LoginScreen() {
  const { signIn, enterPreview, hasSupabaseConfig } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleLogin() {
    try {
      setError(undefined);
      setLoading(true);
      await signIn(identifier.trim(), password);
      router.replace('/(tabs)/home');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handlePreview() {
    enterPreview();
    router.replace('/(auth)/onboarding');
  }

  return (
    <Screen scroll>
      <GlowCard tone="purple" style={styles.hero}>
        <LinearGradient colors={gradients.aurora} style={styles.heroGlow} />
        <Image source={require('@/assets/images/pocketnet-logo.png')} style={styles.logo} contentFit="contain" />
        <Stack gap={spacing.sm} style={styles.heroStack}>
          <Badge label="PocketNet public beta" tone="cyan" icon={Gamepad2} align="center" />
          <AppText variant="display" style={styles.center}>Handheld-first social</AppText>
          <AppText color={colors.textSecondary} style={styles.center}>
            Profiles, screenshots, friends, and communities for Android gaming handhelds.
          </AppText>
        </Stack>
      </GlowCard>

      {error ? <ErrorBanner body={error} /> : null}

      <GlowCard tone="cyan">
        <Stack gap={spacing.xs}>
          <AppText variant="sectionTitle">Welcome back</AppText>
          <AppText color={colors.textSecondary}>
            Sign in to sync your PocketCard, feed, communities, and device-tuned dashboard.
          </AppText>
        </Stack>
        <TextField
          label="Email or username"
          leftIcon={AtSign}
          autoCapitalize="none"
          autoCorrect={false}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="you@example.com or your_handle"
        />
        <TextField
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
        />
        <Button label="Log in" icon={LogIn} onPress={() => void handleLogin()} loading={loading} />
        <Row style={styles.linkRow}>
          <Button label="Create account" compact variant="ghost" onPress={() => router.push('/(auth)/signup')} />
          <Button label="Reset password" compact variant="ghost" onPress={() => router.push('/(auth)/reset')} />
        </Row>
      </GlowCard>

      <GlowCard tone="focus">
        <Row>
          <ShieldCheck color={hasSupabaseConfig ? colors.success : colors.warning} size={20} />
          <Stack gap={2} style={styles.previewCopy}>
            <AppText variant="cardTitle">Local preview mode</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {hasSupabaseConfig
                ? 'Preview remains available for UI QA without touching production data.'
                : 'Supabase is not configured yet, so preview mode is enabled for local QA.'}
            </AppText>
          </Stack>
        </Row>
        <Button label="Preview beta" icon={Sparkles} variant="secondary" onPress={handlePreview} />
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.card
  },
  logo: {
    width: 150,
    height: 150
  },
  center: {
    textAlign: 'center'
  },
  heroStack: {
    alignItems: 'center'
  },
  linkRow: {
    flexWrap: 'wrap'
  },
  previewCopy: {
    flex: 1
  }
});
