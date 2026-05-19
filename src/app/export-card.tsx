import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { ArrowLeft, Download, ImageDown, Trophy } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { ChipPicker } from '@/components/ChipPicker';
import { ProfileCardCanvas } from '@/components/social/ProfileCardCanvas';
import { AppText, Badge, Button, EmptyState, GlowCard, Row, Screen, Stack } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRetroAchievements } from '@/hooks/useRetroAchievements';
import { usePocketData } from '@/features/social/SocialProvider';
import { colors, radius, spacing } from '@/design/tokens';
import { captureAnimatedGif } from '@/lib/gifExport';
import {
  PROFILE_CARD_BORDERS,
  PROFILE_CARD_GEOMETRY,
  type ProfileCardVariant
} from '@/lib/profileCard';

export default function ExportCardScreen() {
  const { profile, patchProfile } = useAuth();
  const { getProfilePosts, getFriendsOf, getFollowersOf, getCommunitiesOf } = usePocketData();
  const [borderId, setBorderId] = useState(profile?.cardBorder ?? 'classic');
  const [fullCard, setFullCard] = useState(false);
  const [format, setFormat] = useState<'jpeg' | 'gif'>('jpeg');
  const [saving, setSaving] = useState(false);
  const [gifProgress, setGifProgress] = useState<{ frame: number; total: number } | null>(null);
  const canvasRef = useRef<View>(null);

  const ra = useRetroAchievements(fullCard ? profile?.raUsername : undefined);

  const variant: ProfileCardVariant = fullCard ? 'full' : 'compact';
  const geom = PROFILE_CARD_GEOMETRY[variant];

  const posts = useMemo(() => (profile ? getProfilePosts(profile.id) : []), [getProfilePosts, profile]);
  const friends = useMemo(() => (profile ? getFriendsOf(profile.id) : []), [getFriendsOf, profile]);
  const followers = useMemo(() => (profile ? getFollowersOf(profile.id) : []), [getFollowersOf, profile]);
  const communities = useMemo(
    () => (profile ? getCommunitiesOf(profile.id) : []),
    [getCommunitiesOf, profile]
  );

  if (!profile) {
    return (
      <Screen>
        <EmptyState title="No profile" body="Sign in to export your profile card." />
      </Screen>
    );
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'PocketNet needs photo-library access to save your profile card.'
        );
        return;
      }
      // Persist the chosen border on the profile so the next export remembers it.
      if (profile && profile.cardBorder !== borderId) {
        try {
          await patchProfile({ cardBorder: borderId });
        } catch {
          // non-fatal — the export still works.
        }
      }
      let uri: string;
      if (format === 'gif') {
        // GIF: capture at half resolution so JS encoding stays responsive.
        setGifProgress({ frame: 0, total: 8 });
        uri = await captureAnimatedGif(canvasRef, {
          width: Math.round(geom.width / 2),
          height: Math.round(geom.height / 2),
          frames: 8,
          intervalMs: 240,
          frameDelayMs: 220,
          onProgress: (frame, total) => setGifProgress({ frame, total })
        });
      } else {
        uri = await captureRef(canvasRef as unknown as React.RefObject<View>, {
          format: 'jpg',
          quality: 0.95,
          width: geom.width,
          height: geom.height
        });
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert(
        'Saved',
        format === 'gif'
          ? `Animated card saved to your gallery (${Math.round(geom.width / 2)} × ${Math.round(geom.height / 2)} px GIF).`
          : `Profile card saved to your gallery (${geom.width} × ${geom.height} px JPEG).`
      );
    } catch (error) {
      Alert.alert('Could not save', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSaving(false);
      setGifProgress(null);
    }
  }

  return (
    <Screen scroll>
      <Row style={{ justifyContent: 'space-between' }}>
        <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />
        <Badge label={fullCard ? 'Full card' : 'Compact card'} tone="cyan" />
      </Row>

      <Stack gap={spacing.xs}>
        <AppText variant="display">Profile card</AppText>
        <AppText color={colors.textSecondary}>
          Export a shareable PocketNet card with your avatar, banner, and bio. Toggle the full card to
          include posts, friends, followers, communities, and achievements.
        </AppText>
      </Stack>

      <GlowCard tone="cyan">
        <Stack gap={spacing.xs}>
          <AppText variant="sectionTitle">Format</AppText>
          <ChipPicker
            options={['JPEG (still)', 'GIF (animated)']}
            value={format === 'gif' ? 'GIF (animated)' : 'JPEG (still)'}
            onChange={(value) => setFormat(value === 'GIF (animated)' ? 'gif' : 'jpeg')}
          />
          <AppText variant="metadata" color={colors.textMuted}>
            {format === 'gif'
              ? 'Captures 8 frames at half resolution so animated borders move on the card. Takes a few seconds to encode.'
              : 'High-quality JPEG at full resolution. Best for sharing.'}
          </AppText>
        </Stack>
      </GlowCard>

      <GlowCard tone="cyan">
        <Stack gap={spacing.xs}>
          <AppText variant="sectionTitle">Dimensions</AppText>
          <AppText color={colors.textSecondary}>
            Compact card · 1080 × 1620 px (inner 984 × 1524 px)
          </AppText>
          <AppText color={colors.textSecondary}>
            Full card · 1080 × 2400 px (inner 984 × 2304 px)
          </AppText>
          <AppText variant="metadata" color={colors.textMuted}>
            48 px border on every side · exported as PNG.
          </AppText>
        </Stack>
      </GlowCard>

      <GlowCard tone="purple">
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack gap={2} style={{ flex: 1 }}>
            <AppText variant="sectionTitle">Full profile card</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Includes your posts, friends, followers, communities, and achievements. Off by default.
            </AppText>
          </Stack>
          <Switch
            value={fullCard}
            onValueChange={setFullCard}
            trackColor={{ true: colors.accentPurple, false: colors.border }}
            thumbColor={colors.surfaceStrong}
          />
        </Row>
      </GlowCard>

      <Stack gap={spacing.sm}>
        <AppText variant="sectionTitle">Border</AppText>
        <View style={styles.borderGrid}>
          {PROFILE_CARD_BORDERS.map((border) => {
            const active = borderId === border.id;
            return (
              <Pressable
                key={border.id}
                onPress={() => setBorderId(border.id)}
                style={[styles.borderTile, active && styles.borderTileActive]}
              >
                <View style={[styles.swatch, { backgroundColor: border.gradient[0] }]}>
                  <View style={[styles.swatchInner, { backgroundColor: border.gradient[border.gradient.length - 1] }]} />
                </View>
                <AppText variant="bodyStrong">{border.label}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {border.description}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Stack>

      {fullCard && !profile.raUsername ? (
        <Row style={styles.note}>
          <Trophy color={colors.warning} size={18} />
          <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>
            Link RetroAchievements in Settings to include your achievement count on the full card.
          </AppText>
        </Row>
      ) : null}

      <Button
        label={
          saving
            ? gifProgress
              ? `Encoding… ${gifProgress.frame}/${gifProgress.total}`
              : 'Saving…'
            : 'Save to gallery'
        }
        icon={Download}
        loading={saving}
        onPress={() => void handleSave()}
      />

      <ProfileCardCanvas
        ref={canvasRef}
        profile={profile}
        variant={variant}
        borderId={borderId}
        posts={posts}
        friends={friends}
        communities={communities}
        followers={followers.length}
        achievements={ra.achievements.length}
      />

      <AppText variant="metadata" color={colors.textMuted} style={{ textAlign: 'center' }}>
        Only the card is exported — surrounding UI is never captured.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  borderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  borderTile: {
    width: '47%',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 6
  },
  borderTileActive: {
    borderColor: colors.accentCyan,
    backgroundColor: colors.surfaceStrong
  },
  swatch: {
    width: '100%',
    height: 56,
    borderRadius: radius.sm,
    overflow: 'hidden',
    padding: 6
  },
  swatchInner: {
    flex: 1,
    borderRadius: radius.sm,
    opacity: 0.6
  },
  note: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.warning}55`,
    backgroundColor: `${colors.warning}10`,
    alignItems: 'flex-start'
  }
});

// silence unused import lint
void ImageDown;
