import { router } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppText, Button, Card, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/lib/theme';

export default function SignupScreen() {
  const { signUp, hasSupabaseConfig } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    try {
      setLoading(true);
      await signUp(email.trim(), password, username.trim().toLowerCase());
      Alert.alert('Check your email', 'Confirm your account, then log in to finish setup.');
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Could not create account', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <AppText variant="heading">Create Account</AppText>
      <AppText color={colors.textMuted}>
        Choose a handle that feels at home in handheld communities.
      </AppText>
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
          label="Username"
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
          label="Sign up"
          icon={UserPlus}
          onPress={() => void handleSignup()}
          loading={loading}
          disabled={!hasSupabaseConfig}
        />
        {!hasSupabaseConfig ? (
          <AppText variant="small" color={colors.textMuted}>
            Add Supabase public env values before creating production accounts.
          </AppText>
        ) : null}
      </Card>
      <Button label="Back to login" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
