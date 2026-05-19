import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import {
  ArrowLeft,
  Bell,
  Eye,
  ImageDown,
  LayoutPanelTop,
  Lock,
  LogOut,
  Palette,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText, Badge, Button, GlowCard, Row, Screen, Stack, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useThemeChoice, type LayoutPreference } from '@/features/theme/ThemeProvider';
import { RELEASES } from '@/lib/releases';
import { getPushEnabled, requestPushPermission, savePushToken, setPushEnabled } from '@/lib/push';
import { loginRa, verifyRaAccount } from '@/lib/retroachievements';
import { awardBadge } from '@/lib/badgeClaim';
import { supabase } from '@/lib/supabase';
import { colors, radius, spacing, themeOptions, type ThemeName } from '@/design/tokens';

const layoutOptions: { value: LayoutPreference; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'Single-screen layout. Default for all handhelds.' },
  { value: 'split-input-bottom', label: 'Split · Input bottom', description: 'Feed on top, composer + keyboard pinned to the bottom half.' },
  { value: 'split-input-top', label: 'Split · Input top', description: 'Composer on top, feed below. Best for dual-screen Thor when typing.' },
  { value: 'compact', label: 'Compact', description: 'Denser spacing for tiny 4–5" handheld screens.' }
];

export default function SettingsScreen() {
  const { signOut, isPreviewMode, hasSupabaseConfig, profile, patchProfile } = useAuth();
  const { theme, setTheme, layout, setLayout, pendingRestart } = useThemeChoice();

  const [raUsername, setRaUsername] = useState(profile?.raUsername ?? '');
  const [raPassword, setRaPassword] = useState('');
  const [raKey, setRaKey] = useState('');
  const [raAdvancedOpen, setRaAdvancedOpen] = useState(false);
  const [raSaving, setRaSaving] = useState(false);
  const [raError, setRaError] = useState<string>();
  const [raMessage, setRaMessage] = useState<string>();

  const [pushStatus, setPushStatus] = useState<'unknown' | 'on' | 'off' | 'denied' | 'unsupported'>('unknown');
  const [pushBusy, setPushBusy] = useState(false);

  const [privacyBusy, setPrivacyBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!profile?.id) return;
      const enabled = await getPushEnabled(profile.id);
      if (!cancelled) setPushStatus(enabled ? 'on' : 'off');
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Could not sign out', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function handleLoginRa() {
    if (!profile?.id) return;
    const trimmedUser = raUsername.trim();
    if (!trimmedUser || !raPassword) {
      setRaError('Enter your RetroAchievements username and password.');
      return;
    }
    setRaSaving(true);
    setRaError(undefined);
    setRaMessage(undefined);
    try {
      const result = await loginRa(trimmedUser, raPassword);
      if (!supabase) {
        throw new Error('Supabase is not configured on this build.');
      }
      const { error: secretError } = await supabase.from('user_secrets').upsert(
        {
          user_id: profile.id,
          ra_username: result.username,
          ra_token: result.token,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );
      if (secretError) throw secretError;
      await patchProfile({
        raUsername: result.username,
        raPoints: result.score,
        raSoftcorePoints: result.softcoreScore,
        raSyncedAt: new Date().toISOString()
      });
      // Best-effort: claim the retro-linked badge.
      void awardBadge('retro-linked');
      setRaMessage(
        `Logged in as @${result.username} · ${result.score.toLocaleString()} points (hardcore) · ${result.softcoreScore.toLocaleString()} (softcore).`
      );
      setRaPassword('');
    } catch (error) {
      setRaError(error instanceof Error ? error.message : 'Could not log in to RetroAchievements.');
    } finally {
      setRaSaving(false);
    }
  }

  async function handleSaveRa() {
    if (!profile?.id) return;
    const trimmedUser = raUsername.trim();
    const trimmedKey = raKey.trim();
    if (!trimmedUser || !trimmedKey) {
      setRaError('Enter your RetroAchievements username and Web API key.');
      return;
    }
    setRaSaving(true);
    setRaError(undefined);
    setRaMessage(undefined);
    try {
      const summary = await verifyRaAccount({ kind: 'apiKey', username: trimmedUser, apiKey: trimmedKey });
      if (!supabase) {
        throw new Error('Supabase is not configured on this build.');
      }
      const { error: secretError } = await supabase.from('user_secrets').upsert(
        {
          user_id: profile.id,
          ra_username: trimmedUser,
          ra_web_api_key: trimmedKey,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );
      if (secretError) throw secretError;
      await patchProfile({ raUsername: trimmedUser });
      void awardBadge('retro-linked');
      setRaMessage(
        `Linked @${summary.user} · ${summary.totalPoints.toLocaleString()} points · rank #${summary.rank ?? '—'}.`
      );
      setRaKey('');
    } catch (error) {
      setRaError(error instanceof Error ? error.message : 'Could not link RetroAchievements account.');
    } finally {
      setRaSaving(false);
    }
  }

  async function handleUnlinkRa() {
    if (!profile?.id) return;
    setRaSaving(true);
    setRaError(undefined);
    setRaMessage(undefined);
    try {
      if (supabase) {
        await supabase.from('user_secrets').delete().eq('user_id', profile.id);
      }
      await patchProfile({ raUsername: undefined });
      setRaUsername('');
      setRaKey('');
      setRaPassword('');
      setRaMessage('RetroAchievements unlinked.');
    } catch (error) {
      setRaError(error instanceof Error ? error.message : 'Could not unlink account.');
    } finally {
      setRaSaving(false);
    }
  }

  async function handleTogglePush(value: boolean) {
    if (!profile?.id || pushBusy) return;
    setPushBusy(true);
    try {
      if (value) {
        const result = await requestPushPermission();
        if (result.status === 'granted') {
          await savePushToken(profile.id, result.token, true);
          setPushStatus('on');
        } else if (result.status === 'denied') {
          setPushStatus('denied');
          Alert.alert(
            'Notifications blocked',
            'Enable PocketNet notifications in your device settings to receive pings.'
          );
        } else {
          setPushStatus('unsupported');
        }
      } else {
        await setPushEnabled(profile.id, false);
        setPushStatus('off');
      }
    } catch (error) {
      Alert.alert('Push error', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setPushBusy(false);
    }
  }

  async function handleTogglePrivacy(value: boolean) {
    if (!profile?.id || privacyBusy) return;
    setPrivacyBusy(true);
    try {
      await patchProfile({ isPrivate: value });
    } catch (error) {
      Alert.alert('Privacy', error instanceof Error ? error.message : 'Could not update privacy.');
    } finally {
      setPrivacyBusy(false);
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

      <GlowCard tone="focus">
        <Row>
          <Trophy color={colors.warning} size={22} />
          <Stack gap={2} style={styles.groupCopy}>
            <AppText variant="sectionTitle">RetroAchievements</AppText>
            <AppText color={colors.textSecondary}>
              Sign in with your RetroAchievements username and password to link your account. PocketNet
              hands the password to RA once over HTTPS and never stores it — only the username and
              session token are saved, owner-only.
            </AppText>
            {profile?.raUsername ? (
              <AppText variant="metadata" color={colors.textMuted}>Linked as @{profile.raUsername}</AppText>
            ) : null}
          </Stack>
        </Row>
        <Stack gap={spacing.xs}>
          <TextField
            label="RA username"
            value={raUsername}
            onChangeText={setRaUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="RetroAchievements username"
          />
          <TextField
            label="RA password"
            value={raPassword}
            onChangeText={setRaPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="Your RetroAchievements password"
          />
          {raError ? <AppText variant="caption" color={colors.danger}>{raError}</AppText> : null}
          {raMessage ? <AppText variant="caption" color={colors.success}>{raMessage}</AppText> : null}
          <Row>
            <Button
              label={profile?.raUsername ? 'Re-link with password' : 'Sign in to RetroAchievements'}
              loading={raSaving}
              onPress={() => void handleLoginRa()}
            />
            {profile?.raUsername ? (
              <Button label="Unlink" variant="ghost" compact onPress={() => void handleUnlinkRa()} />
            ) : null}
          </Row>

          <Pressable onPress={() => setRaAdvancedOpen((v) => !v)} hitSlop={8}>
            <AppText variant="metadata" color={colors.textMuted}>
              {raAdvancedOpen ? 'Hide advanced (Web API key) ▾' : 'Advanced: use a Web API key instead ▸'}
            </AppText>
          </Pressable>
          {raAdvancedOpen ? (
            <Stack gap={spacing.xs}>
              <TextField
                label="RA Web API key"
                value={raKey}
                onChangeText={setRaKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                placeholder="Paste your Web API key"
              />
              <Row>
                <Button
                  label="Link with API key"
                  variant="secondary"
                  loading={raSaving}
                  onPress={() => void handleSaveRa()}
                />
                <Button
                  label="Get a key"
                  variant="ghost"
                  compact
                  onPress={() =>
                    void Linking.openURL('https://retroachievements.org/controlpanel.php')
                  }
                />
              </Row>
              <AppText variant="metadata" color={colors.textMuted}>
                A Web API key unlocks the full achievement feed. Get yours from
                retroachievements.org → Settings → Keys.
              </AppText>
            </Stack>
          ) : null}
        </Stack>
      </GlowCard>

      <GlowCard tone="purple">
        <Row>
          <Lock color={colors.accentPurple} size={22} />
          <Stack gap={2} style={styles.groupCopy}>
            <AppText variant="sectionTitle">Privacy lock</AppText>
            <AppText color={colors.textSecondary}>
              When locked, only friends and followers can see your posts, replies, friends, followers,
              communities, and achievements.
            </AppText>
          </Stack>
          <Switch
            value={Boolean(profile?.isPrivate)}
            onValueChange={(value) => void handleTogglePrivacy(value)}
            trackColor={{ true: colors.accentPurple, false: colors.border }}
            thumbColor={colors.surfaceStrong}
          />
        </Row>
      </GlowCard>

      <GlowCard tone="cyan">
        <Row>
          <ImageDown color={colors.accentCyan} size={22} />
          <Stack gap={2} style={styles.groupCopy}>
            <AppText variant="sectionTitle">Export profile card</AppText>
            <AppText color={colors.textSecondary}>
              Save a shareable PNG. Compact card 1080 × 1620 px · full card 1080 × 2400 px · 48 px border.
            </AppText>
          </Stack>
        </Row>
        <Button label="Open card exporter" variant="secondary" onPress={() => router.push('/export-card' as never)} />
      </GlowCard>

      <GlowCard tone="pink">
        <Row>
          <Bell color={colors.accentPink} size={22} />
          <Stack gap={2} style={styles.groupCopy}>
            <AppText variant="sectionTitle">Push notifications</AppText>
            <AppText color={colors.textSecondary}>
              Receive a ping when someone follows you, accepts your friend request, or replies to you.
            </AppText>
            <AppText variant="metadata" color={colors.textMuted}>
              Status: {pushStatus === 'on' ? 'on' : pushStatus === 'denied' ? 'blocked by device' : pushStatus === 'unsupported' ? 'unavailable on this device' : 'off'}
            </AppText>
          </Stack>
          <Switch
            value={pushStatus === 'on'}
            onValueChange={(value) => void handleTogglePush(value)}
            disabled={pushBusy || pushStatus === 'unsupported'}
            trackColor={{ true: colors.accentPink, false: colors.border }}
            thumbColor={colors.surfaceStrong}
          />
        </Row>
        <AppText variant="metadata" color={colors.textMuted}>
          Tokens are stored in PocketNet&apos;s push_tokens table. Server-side delivery rolls out in a follow-up build.
        </AppText>
      </GlowCard>

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
        title="In-app notifications"
        body="Friend requests, follows, replies, and community pings live in your in-app notifications tray. Push delivery is configured above."
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

      <GlowCard tone="focus">
        <Row>
          <Sparkles color={colors.focus} size={22} />
          <Stack gap={2} style={styles.groupCopy}>
            <AppText variant="sectionTitle">Updates</AppText>
            <AppText color={colors.textSecondary}>What changed in the latest PocketNet builds.</AppText>
          </Stack>
        </Row>
        <Stack gap={spacing.sm}>
          {RELEASES.map((release) => (
            <View key={release.version} style={styles.releaseCard}>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="cardTitle">v{release.version} · {release.title}</AppText>
                <AppText variant="metadata" color={colors.textMuted}>{release.date}</AppText>
              </Row>
              <Stack gap={4} style={{ marginTop: spacing.xs }}>
                {release.highlights.map((line) => (
                  <AppText key={line} variant="caption" color={colors.textSecondary}>
                    · {line}
                  </AppText>
                ))}
              </Stack>
            </View>
          ))}
        </Stack>
      </GlowCard>

      <AppText variant="metadata" color={colors.textMuted} style={styles.version}>
        PocketNet · Device-adaptive Android handheld social app · Standalone project, not affiliated with AYN or frontend projects.
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
  },
  releaseCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
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
