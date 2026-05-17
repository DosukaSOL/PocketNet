import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Gamepad2, LogIn, Mail, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText, Badge, Button, Card, ErrorBanner, Row, Screen, Stack, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, gradients, radius, spacing } from '@/design/tokens';

export default function LoginScreen() {
  const { signIn, enterPreview, hasSupabaseConfig } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleLogin() {
    try {
      setError(undefined);
      setLoading(true);
      await signIn(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handlePreview() {
    enterPreview();
    router.replace('/(tabs)/home');
  }

  return (
    <Screen scroll>
      <Card gradient="pocket" elevated style={styles.hero}>
        <LinearGradient colors={gradients.aurora} style={styles.heroGlow} />
        <Image source={require('@/assets/images/pocketnet-logo.png')} style={styles.logo} contentFit="contain" />
        <Stack gap={spacing.sm} style={styles.heroStack}>
          <Badge label="PocketNet public beta" tone="cyan" icon={Gamepad2} />
          <AppText variant="display" style={styles.center}>Handheld-first social</AppText>
          <AppText color={colors.textSecondary} style={styles.center}>
            Profiles, screenshots, friends, and communities for Android gaming handhelds.
          </AppText>
        </Stack>
      </Card>

      {error ? <ErrorBanner body={error} /> : null}

      <Card elevated>
        <Stack gap={spacing.xs}>
          <AppText variant="sectionTitle">Welcome back</AppText>
          <AppText color={colors.textSecondary}>
            Sign in to sync your PocketCard, feed, communities, and ThorLink status.
          </AppText>
        </Stack>
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
      </Card>

      <Card>
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
      </Card>
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
