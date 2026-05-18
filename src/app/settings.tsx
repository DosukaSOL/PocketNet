import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import { ArrowLeft, Bell, Eye, LogOut, Palette, ShieldCheck, UserRound } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { AppText, Badge, Button, GlowCard, Row, Screen, Stack } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, spacing } from '@/design/tokens';

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
      <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />
      <Stack gap={spacing.xs}>
        <Badge label="Settings" tone="neutral" />
        <AppText variant="display">PocketNet controls</AppText>
        <AppText color={colors.textSecondary}>
          Account, profile, privacy, safety, and beta release details.
        </AppText>
      </Stack>

      <SettingsGroup
        icon={UserRound}
        title="Account"
        body="Manage your public profile, identity badges, and PocketCard details."
        action={<Button label="Edit profile" variant="secondary" onPress={() => router.push('/edit-profile')} />}
      />

      <SettingsGroup
        icon={ShieldCheck}
        title="Security"
        body="PocketNet stores sessions through Supabase Auth and only expects public mobile-safe env values in the client."
        meta={`Mode: ${isPreviewMode ? 'local preview' : 'Supabase'} · Supabase config: ${hasSupabaseConfig ? 'ready' : 'missing'}`}
      />

      <SettingsGroup
        icon={Eye}
        title="Privacy & Safety"
        body="Profile details are public by design. Manual current-game status can be cleared any time from Edit Profile. Blocks and reports are private moderation signals."
      />

      <SettingsGroup
        icon={Bell}
        title="Notifications"
        body="In-app notifications are available for friend and social activity. Push notifications are planned for a later production milestone."
        meta="Push: documented future work"
      />

      <SettingsGroup
        icon={Palette}
        title="Appearance"
        body="PocketNet currently uses an OLED-first dark interface tuned for Android handhelds. Theme switching is on the roadmap."
        meta="Theme: PocketNet OLED"
      />

      <GlowCard tone="pink">
        <AppText variant="sectionTitle">Session</AppText>
        <AppText color={colors.textSecondary}>
          Sign out of this device. Preview data remains local to the app session.
        </AppText>
        <Button label="Sign out" icon={LogOut} variant="danger" onPress={() => void handleSignOut()} />
      </GlowCard>

      <AppText variant="metadata" color={colors.textMuted} style={styles.version}>
        PocketNet beta 0.1.0 · Device-adaptive Android handheld social app · Standalone project, not affiliated with AYN or frontend projects.
      </AppText>
    </Screen>
  );
}

function SettingsGroup({
  icon: Icon,
  title,
  body,
  meta,
  action
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <GlowCard tone="cyan">
      <Row>
        <Icon color={colors.accentCyan} size={22} />
        <Stack gap={2} style={styles.groupCopy}>
          <AppText variant="sectionTitle">{title}</AppText>
          <AppText color={colors.textSecondary}>{body}</AppText>
          {meta ? <AppText variant="metadata" color={colors.textMuted}>{meta}</AppText> : null}
        </Stack>
      </Row>
      {action}
    </GlowCard>
  );
}

const styles = StyleSheet.create({
  groupCopy: {
    flex: 1
  },
  version: {
    textAlign: 'center'
  }
});
