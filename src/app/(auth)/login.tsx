import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LogIn, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Card, AppText, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, spacing } from '@/lib/theme';

export default function LoginScreen() {
  const { signIn, enterPreview, hasSupabaseConfig } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await signIn(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Could not sign in', error instanceof Error ? error.message : 'Try again.');
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
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/pocketnet-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <AppText variant="heading">PocketNet</AppText>
        <AppText color={colors.textMuted} style={styles.center}>
          A handheld-native social layer for setups, screenshots, friends, and communities.
        </AppText>
      </View>

      <Card elevated>
        <TextField
          label="Email"
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
        <Button
          label="Preview beta"
          icon={Sparkles}
          variant="secondary"
          onPress={handlePreview}
        />
        {!hasSupabaseConfig ? (
          <AppText variant="small" color={colors.textMuted}>
            Supabase is not configured yet, so preview mode is enabled for local QA.
          </AppText>
        ) : null}
      </Card>

      <View style={styles.links}>
        <Button label="Create account" variant="ghost" onPress={() => router.push('/(auth)/signup')} />
        <Button label="Reset password" variant="ghost" onPress={() => router.push('/(auth)/reset')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xl
  },
  logo: {
    width: 152,
    height: 152
  },
  center: {
    textAlign: 'center'
  },
  links: {
    gap: spacing.sm
  }
});
