import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import { ArrowLeft, Bell, Eye, LayoutPanelTop, LogOut, Palette, ShieldCheck, UserRound } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Button, GlowCard, Row, Screen, Stack } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useThemeChoice, type LayoutPreference } from '@/features/theme/ThemeProvider';
import { colors, radius, spacing, themeOptions, type ThemeName } from '@/design/tokens';

const layoutOptions: { value: LayoutPreference; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'Single-screen layout. Default for all handhelds.' },
  { value: 'split-input-bottom', label: 'Split · Input bottom', description: 'Feed on top, composer + keyboard pinned to the bottom half.' },
  { value: 'split-input-top', label: 'Split · Input top', description: 'Composer on top, feed below. Best for dual-screen Thor when typing.' },
  { value: 'compact', label: 'Compact', description: 'Denser spacing for tiny 4–5" handheld screens.' }
];

export default function SettingsScreen() {
  const { signOut, isPreviewMode, hasSupabaseConfig } = useAuth();
  const { theme, setTheme, layout, setLayout, pendingRestart } = useThemeChoice();

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

      <GlowCard tone="cyan">
        <Row>
          <Palette color={colors.accentCyan} size={22} />
          <Stack gap={2} style={styles.groupCopy}>
            <AppText variant="sectionTitle">Appearance</AppText>
            <AppText color={colors.textSecondary}>
              Pick the palette you want PocketNet to use. New theme is applied on the next app launch.
            </AppText>
          </Stack>
        </Row>
        <Stack gap={spacing.xs}>
          {themeOptions.map((option) => (
            <OptionRow
              key={option.value}
              active={theme === option.value}
              label={option.label}
              description={option.description}
              onPress={() => void setTheme(option.value as ThemeName)}
            />
          ))}
        </Stack>
        {pendingRestart ? (
          <AppText variant="caption" color={colors.warning}>
            Restart the app to fully apply this theme.
          </AppText>
        ) : null}
      </GlowCard>

      <GlowCard tone="purple">
        <Row>
          <LayoutPanelTop color={colors.accentPurple} size={22} />
          <Stack gap={2} style={styles.groupCopy}>
            <AppText variant="sectionTitle">Layout</AppText>
            <AppText color={colors.textSecondary}>
              Reorganize the composer and feed for dual-screen handhelds like the AYN Thor, or shrink everything for tiny 4–5&quot; screens. Android handles which physical screen the app renders on; PocketNet adjusts its own layout inside that surface.
            </AppText>
          </Stack>
        </Row>
        <Stack gap={spacing.xs}>
          {layoutOptions.map((option) => (
            <OptionRow
              key={option.value}
              active={layout === option.value}
              label={option.label}
              description={option.description}
              onPress={() => void setLayout(option.value)}
            />
          ))}
        </Stack>
      </GlowCard>

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
  },
  optionRow: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface
  },
  optionRowActive: {
    borderColor: colors.accentCyan,
    backgroundColor: colors.surfaceStrong
  },
  optionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border
  },
  optionDotActive: {
    borderColor: colors.accentCyan,
    backgroundColor: colors.accentCyan
  }
});

function OptionRow({
  active,
  label,
  description,
  onPress
}: {
  active: boolean;
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.optionRow, active && styles.optionRowActive]}>
      <Row>
        <View style={[styles.optionDot, active && styles.optionDotActive]} />
        <Stack gap={2} style={{ flex: 1 }}>
          <AppText variant="cardTitle">{label}</AppText>
          <AppText variant="caption" color={colors.textSecondary}>{description}</AppText>
        </Stack>
      </Row>
    </Pressable>
  );
}
