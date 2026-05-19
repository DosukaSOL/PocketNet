import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gamepad2,
  Image as ImageIcon,
  Link2,
  MonitorSmartphone,
  Pencil,
  Sparkles
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ChipPicker } from '@/components/ChipPicker';
import { DeviceProfileCard } from '@/components/social/DeviceProfileCard';
import {
  AppText,
  Badge,
  Button,
  GlowCard,
  Row,
  Screen,
  Stack,
  TextArea,
  TextField
} from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import { FRONTENDS, HANDHELDS, SAMPLE_GAMES, SYSTEMS } from '@/lib/catalog';
import { pickImage, uploadImage } from '@/lib/media';
import { requestPushPermission, savePushToken } from '@/lib/push';
import { awardBadge, claimOgBadge } from '@/lib/badgeClaim';
import { markTourPending } from '@/components/tour/AppTour';

type StepKey = 'avatar' | 'banner' | 'about' | 'device' | 'systems' | 'socials' | 'preview';

const STEPS: { key: StepKey; title: string; subtitle: string }[] = [
  { key: 'avatar', title: 'Profile photo', subtitle: 'Pick an avatar so friends recognise you.' },
  { key: 'banner', title: 'Banner', subtitle: 'Set a banner — just like Twitter or Facebook.' },
  { key: 'about', title: 'About you', subtitle: 'Short bio. Skip if you prefer.' },
  { key: 'device', title: 'Your handheld', subtitle: 'Pick your daily driver and frontend.' },
  { key: 'systems', title: 'Favorites', subtitle: 'Systems and games you love.' },
  { key: 'socials', title: 'Social links', subtitle: 'Optional places to find you elsewhere.' },
  { key: 'preview', title: 'Looking good?', subtitle: 'Review and finish setup.' }
];

export default function OnboardingScreen() {
  const { profile, patchProfile } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const [avatarUri, setAvatarUri] = useState<string | undefined>(profile?.avatarUrl);
  const [bannerUri, setBannerUri] = useState<string | undefined>(profile?.bannerUrl);
  const [bio, setBio] = useState(profile?.bio ?? '');
  const initialHandhelds = profile?.favoriteHandhelds?.length
    ? profile.favoriteHandhelds
    : profile?.favoriteHandheld
      ? [profile.favoriteHandheld]
      : ['AYN Thor'];
  const [favoriteHandhelds, setFavoriteHandhelds] = useState<string[]>(initialHandhelds);
  const [customHandhelds, setCustomHandhelds] = useState(
    profile?.customHandhelds?.join(', ') ?? ''
  );
  const [favoriteFrontend, setFavoriteFrontend] = useState(profile?.favoriteFrontend ?? 'Cocoon');
  const [customFrontends, setCustomFrontends] = useState(
    profile?.customFrontends?.join(', ') ?? ''
  );
  const [favoriteSystems, setFavoriteSystems] = useState<string[]>(profile?.favoriteSystems ?? []);
  const [customSystems, setCustomSystems] = useState(profile?.customSystems?.join(', ') ?? '');
  const [favoriteGames, setFavoriteGames] = useState<string[]>(profile?.favoriteGames ?? []);
  const [customGames, setCustomGames] = useState(profile?.customGames?.join(', ') ?? '');
  const [setupNotes, setSetupNotes] = useState(profile?.setupNotes ?? '');
  const [twitter, setTwitter] = useState(profile?.socialLinks.twitter ?? '');
  const [discord, setDiscord] = useState(profile?.socialLinks.discord ?? '');
  const [twitch, setTwitch] = useState(profile?.socialLinks.twitch ?? '');
  const [youtube, setYoutube] = useState(profile?.socialLinks.youtube ?? '');
  const [github, setGithub] = useState(profile?.socialLinks.github ?? '');
  const [website, setWebsite] = useState(profile?.socialLinks.website ?? '');

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const isFirst = stepIndex === 0;

  function next() {
    setStepIndex((index) => Math.min(STEPS.length - 1, index + 1));
  }

  function back() {
    setStepIndex((index) => Math.max(0, index - 1));
  }

  async function chooseAvatar() {
    try {
      const image = await pickImage();
      if (image) setAvatarUri(image.uri);
    } catch (error) {
      Alert.alert('Could not pick photo', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function chooseBanner() {
    try {
      const image = await pickImage();
      if (image) setBannerUri(image.uri);
    } catch (error) {
      Alert.alert('Could not pick photo', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function finish() {
    if (!profile) return;
    setSaving(true);
    try {
      const isLocalAvatar = avatarUri && avatarUri !== profile.avatarUrl;
      const isLocalBanner = bannerUri && bannerUri !== profile.bannerUrl;

      const uploadedAvatar = isLocalAvatar
        ? await uploadImage({ bucket: 'avatars', userId: profile.id, uri: avatarUri! })
        : avatarUri;
      const uploadedBanner = isLocalBanner
        ? await uploadImage({ bucket: 'banners', userId: profile.id, uri: bannerUri! })
        : bannerUri;

      const handheldList = favoriteHandhelds.filter((item) => item !== 'Other');
      const customHandheldList = parseCustomList(customHandhelds);
      const customFrontendList = favoriteFrontend === 'Other' ? parseCustomList(customFrontends) : [];
      const customSystemList = favoriteSystems.includes('Other') ? parseCustomList(customSystems) : [];
      const customGameList = favoriteGames.includes('Other') ? parseCustomList(customGames) : [];
      const primaryHandheld = handheldList[0] ?? customHandheldList[0];

      await patchProfile({
        avatarUri: uploadedAvatar,
        bannerUri: uploadedBanner,
        bio: bio.trim() || undefined,
        favoriteHandheld: primaryHandheld,
        favoriteHandhelds: [...handheldList, ...customHandheldList],
        favoriteFrontend: favoriteFrontend === 'Other' ? customFrontendList[0] : favoriteFrontend,
        favoriteSystems: [
          ...favoriteSystems.filter((item) => item !== 'Other'),
          ...customSystemList
        ],
        favoriteGames: [
          ...favoriteGames.filter((item) => item !== 'Other'),
          ...customGameList
        ],
        customHandhelds: customHandheldList,
        customFrontends: customFrontendList,
        customSystems: customSystemList,
        customGames: customGameList,
        setupNotes: setupNotes.trim() || undefined,
        socialLinks: {
          ...(twitter.trim() ? { twitter: twitter.trim() } : {}),
          ...(discord.trim() ? { discord: discord.trim() } : {}),
          ...(twitch.trim() ? { twitch: twitch.trim() } : {}),
          ...(youtube.trim() ? { youtube: youtube.trim() } : {}),
          ...(github.trim() ? { github: github.trim() } : {}),
          ...(website.trim() ? { website: website.trim() } : {})
        }
      });
      // Best-effort: ask for push permission once they finish onboarding so new
      // accounts opt in by default. Failures are intentionally swallowed — push
      // is enhancement-only.
      try {
        const result = await requestPushPermission();
        if (result.status === 'granted' && profile?.id) {
          await savePushToken(profile.id, result.token, true);
        }
      } catch {
        // ignore — push is optional
      }
      // Best-effort: claim launch + completion badges. All failures swallowed.
      void claimOgBadge();
      void awardBadge('verified');
      void awardBadge('completionist');
      void awardBadge('pioneer');
      await markTourPending();
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Could not save onboarding', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  const progress = useMemo(() => ((stepIndex + 1) / STEPS.length) * 100, [stepIndex]);

  return (
    <Screen scroll>
      <Stack gap={spacing.xs}>
        <Badge label={`Step ${stepIndex + 1} of ${STEPS.length}`} tone="cyan" icon={Sparkles} align="center" />
        <AppText variant="display">{step.title}</AppText>
        <AppText color={colors.textSecondary}>{step.subtitle}</AppText>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </Stack>

      {step.key === 'avatar' ? (
        <GlowCard tone="cyan">
          <Stack gap={spacing.md} style={{ alignItems: 'center' }}>
            <Pressable onPress={() => void chooseAvatar()} style={styles.avatarPicker}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <ImageIcon color={colors.textMuted} size={48} />
              )}
            </Pressable>
            <AppText variant="metadata" color={colors.textMuted}>
              Tap to choose a photo from your library.
            </AppText>
            <Row style={{ gap: spacing.sm }}>
              <Button label="Choose photo" icon={ImageIcon} onPress={() => void chooseAvatar()} />
              {avatarUri ? (
                <Button label="Remove" variant="ghost" compact onPress={() => setAvatarUri(undefined)} />
              ) : null}
            </Row>
          </Stack>
        </GlowCard>
      ) : null}

      {step.key === 'banner' ? (
        <GlowCard tone="purple">
          <Stack gap={spacing.md}>
            <Pressable onPress={() => void chooseBanner()} style={styles.bannerPicker}>
              {bannerUri ? (
                <Image source={{ uri: bannerUri }} style={styles.bannerImage} contentFit="cover" />
              ) : (
                <Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <ImageIcon color={colors.textMuted} size={36} />
                  <AppText variant="metadata" color={colors.textMuted}>
                    Tap to choose a banner image
                  </AppText>
                </Stack>
              )}
            </Pressable>
            <Row style={{ gap: spacing.sm }}>
              <Button label="Choose banner" icon={ImageIcon} onPress={() => void chooseBanner()} />
              {bannerUri ? (
                <Button label="Remove" variant="ghost" compact onPress={() => setBannerUri(undefined)} />
              ) : null}
            </Row>
          </Stack>
        </GlowCard>
      ) : null}

      {step.key === 'about' ? (
        <GlowCard tone="focus">
          <Stack gap={spacing.sm}>
            <Row>
              <Pencil color={colors.focus} size={18} />
              <AppText variant="sectionTitle">About you</AppText>
            </Row>
            <TextArea
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="A line or two about your handheld life. (You can skip this.)"
            />
          </Stack>
        </GlowCard>
      ) : null}

      {step.key === 'device' ? (
        <Stack gap={spacing.md}>
          <GlowCard tone="cyan">
            <Row>
              <Gamepad2 color={colors.accentCyan} size={20} />
              <Stack gap={2}>
                <AppText variant="sectionTitle">Your handhelds</AppText>
                <AppText variant="metadata" color={colors.textMuted}>
                  Pick every device you play on — PocketNet tunes the feed for all of them.
                </AppText>
              </Stack>
            </Row>
            <ChipPicker
              options={HANDHELDS}
              value={favoriteHandhelds}
              multi
              onChange={(value) => setFavoriteHandhelds(value as string[])}
            />
            {favoriteHandhelds.includes('Other') ? (
              <TextField
                label="Other handhelds"
                value={customHandhelds}
                onChangeText={setCustomHandhelds}
                placeholder="Comma-separated names"
                autoCapitalize="words"
              />
            ) : null}
            {favoriteHandhelds.filter((item) => item !== 'Other')[0] ? (
              <DeviceProfileCard
                deviceName={favoriteHandhelds.filter((item) => item !== 'Other')[0]}
              />
            ) : null}
          </GlowCard>
          <GlowCard tone="purple">
            <Row>
              <MonitorSmartphone color={colors.accentPurple} size={20} />
              <AppText variant="sectionTitle">Favorite frontend</AppText>
            </Row>
            <ChipPicker
              options={FRONTENDS}
              value={favoriteFrontend}
              onChange={(value) => setFavoriteFrontend(String(value))}
            />
            {favoriteFrontend === 'Other' ? (
              <TextField
                label="Other frontend"
                value={customFrontends}
                onChangeText={setCustomFrontends}
                placeholder="Frontend name"
                autoCapitalize="words"
              />
            ) : null}
          </GlowCard>
        </Stack>
      ) : null}

      {step.key === 'systems' ? (
        <Stack gap={spacing.md}>
          <GlowCard tone="cyan">
            <AppText variant="sectionTitle">Favorite systems</AppText>
            <ChipPicker
              options={SYSTEMS}
              value={favoriteSystems}
              multi
              onChange={(value) => setFavoriteSystems(value as string[])}
            />
            {favoriteSystems.includes('Other') ? (
              <TextField
                label="Other systems"
                value={customSystems}
                onChangeText={setCustomSystems}
                placeholder="Comma-separated systems"
                autoCapitalize="words"
              />
            ) : null}
          </GlowCard>
          <GlowCard tone="purple">
            <AppText variant="sectionTitle">Favorite games</AppText>
            <ChipPicker
              options={SAMPLE_GAMES}
              value={favoriteGames}
              multi
              onChange={(value) => setFavoriteGames(value as string[])}
            />
            {favoriteGames.includes('Other') ? (
              <TextField
                label="Other games"
                value={customGames}
                onChangeText={setCustomGames}
                placeholder="Comma-separated games"
                autoCapitalize="words"
              />
            ) : null}
          </GlowCard>
          <GlowCard tone="focus">
            <TextArea
              label="Setup notes (optional)"
              value={setupNotes}
              onChangeText={setSetupNotes}
              placeholder="Controls, shaders, dock, capture workflow…"
            />
          </GlowCard>
        </Stack>
      ) : null}

      {step.key === 'socials' ? (
        <GlowCard tone="cyan">
          <Stack gap={spacing.sm}>
            <Row>
              <Link2 color={colors.accentCyan} size={18} />
              <AppText variant="sectionTitle">Social links (optional)</AppText>
            </Row>
            <TextField label="Twitter / X" value={twitter} onChangeText={setTwitter} placeholder="@handle" autoCapitalize="none" />
            <TextField label="Discord" value={discord} onChangeText={setDiscord} placeholder="username" autoCapitalize="none" />
            <TextField label="Twitch" value={twitch} onChangeText={setTwitch} placeholder="channel" autoCapitalize="none" />
            <TextField label="YouTube" value={youtube} onChangeText={setYoutube} placeholder="@channel" autoCapitalize="none" />
            <TextField label="GitHub" value={github} onChangeText={setGithub} placeholder="username" autoCapitalize="none" />
            <TextField label="Website" value={website} onChangeText={setWebsite} placeholder="https://" autoCapitalize="none" keyboardType="url" />
          </Stack>
        </GlowCard>
      ) : null}

      {step.key === 'preview' ? (
        <GlowCard tone="cyan">
          <Stack gap={spacing.md}>
            {bannerUri ? (
              <Image source={{ uri: bannerUri }} style={styles.previewBanner} contentFit="cover" />
            ) : (
              <View style={[styles.previewBanner, styles.previewBannerEmpty]} />
            )}
            <Row style={{ gap: spacing.md, marginTop: -36, paddingLeft: spacing.sm }}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.previewAvatar} contentFit="cover" />
              ) : (
                <View style={[styles.previewAvatar, styles.previewAvatarEmpty]}>
                  <ImageIcon color={colors.textMuted} size={28} />
                </View>
              )}
              <Stack gap={2} style={{ flex: 1, marginTop: spacing.md }}>
                <AppText variant="bodyStrong">{profile?.displayName ?? 'You'}</AppText>
                <AppText variant="metadata" color={colors.textMuted}>
                  @{profile?.username ?? 'username'}
                </AppText>
              </Stack>
            </Row>
            {bio ? <AppText color={colors.textSecondary}>{bio}</AppText> : null}
            <Row style={{ flexWrap: 'wrap', gap: 6 }}>
              {favoriteHandhelds
                .filter((item) => item !== 'Other')
                .map((handheld) => (
                  <Badge key={handheld} label={handheld} tone="cyan" />
                ))}
              {parseCustomList(customHandhelds).map((handheld) => (
                <Badge key={`custom-${handheld}`} label={handheld} tone="cyan" />
              ))}
              {favoriteFrontend && favoriteFrontend !== 'Other' ? (
                <Badge label={favoriteFrontend} tone="purple" />
              ) : null}
              {favoriteFrontend === 'Other'
                ? parseCustomList(customFrontends).map((frontend) => (
                    <Badge key={`fe-${frontend}`} label={frontend} tone="purple" />
                  ))
                : null}
              {favoriteSystems
                .filter((item) => item !== 'Other')
                .slice(0, 4)
                .map((system) => (
                  <Badge key={system} label={system} tone="focus" />
                ))}
            </Row>
          </Stack>
        </GlowCard>
      ) : null}

      <Row style={styles.actions}>
        <Button
          label="Back"
          icon={ArrowLeft}
          variant="ghost"
          compact
          disabled={isFirst || saving}
          onPress={back}
        />
        <Row style={{ gap: spacing.sm }}>
          {!isLast ? <Button label="Skip" variant="ghost" compact onPress={next} /> : null}
          {isLast ? (
            <Button
              label="Finish setup"
              icon={CheckCircle2}
              loading={saving}
              onPress={() => void finish()}
            />
          ) : (
            <Button label="Next" icon={ArrowRight} onPress={next} />
          )}
        </Row>
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: spacing.sm
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentCyan
  },
  avatarPicker: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: colors.borderGlow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  bannerPicker: {
    width: '100%',
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.borderGlow,
    overflow: 'hidden'
  },
  bannerImage: {
    width: '100%',
    height: '100%'
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md
  },
  previewBanner: {
    width: '100%',
    height: 120,
    borderRadius: radius.md
  },
  previewBannerEmpty: {
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.background
  },
  previewAvatarEmpty: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

function parseCustomList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
