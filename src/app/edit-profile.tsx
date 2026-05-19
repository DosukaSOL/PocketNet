import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, ImagePlus, Link as LinkIcon, Save, Sparkles, Upload, Wand2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ChipPicker } from '@/components/ChipPicker';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ANIMATED_BORDERS, BORDER_MOTIONS, STATIC_BORDERS, decodeCardBorder, encodeCardBorder, isAnimatedBorder, type BorderMotion } from '@/components/social/AnimatedCardBorder';
import { DeviceProfileCard, DeviceSelect } from '@/components/social/DeviceProfileCard';
import { AppText, Badge, Button, Card, Row, Screen, Stack, TextArea, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { FRONTENDS, REGIONS, SAMPLE_GAMES, SYSTEMS } from '@/lib/catalog';
import { pickGif, pickImage, uploadImage } from '@/lib/media';
import { colors, radius, spacing } from '@/design/tokens';

export default function EditProfileScreen() {
  const { profile, patchProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [region, setRegion] = useState(profile?.region ?? '');
  const [favoriteHandheld, setFavoriteHandheld] = useState(profile?.favoriteHandheld ?? '');
  const [customHandheld, setCustomHandheld] = useState(profile?.customHandhelds?.[0] ?? '');
  const [favoriteFrontend, setFavoriteFrontend] = useState(profile?.favoriteFrontend ?? '');
  const [customFrontend, setCustomFrontend] = useState(profile?.customFrontends?.[0] ?? '');
  const [favoriteSystems, setFavoriteSystems] = useState(profile?.favoriteSystems ?? []);
  const [customSystem, setCustomSystem] = useState(profile?.customSystems?.[0] ?? '');
  const [favoriteGames, setFavoriteGames] = useState(profile?.favoriteGames ?? []);
  const [customGame, setCustomGame] = useState(profile?.customGames?.[0] ?? '');
  const [setupNotes, setSetupNotes] = useState(profile?.setupNotes ?? '');
  const [currentGame, setCurrentGame] = useState(profile?.currentGame ?? '');
  const [currentStatus, setCurrentStatus] = useState(profile?.currentStatus ?? '');
  const [twitter, setTwitter] = useState(profile?.socialLinks.twitter ?? '');
  const [discord, setDiscord] = useState(profile?.socialLinks.discord ?? '');
  const [twitch, setTwitch] = useState(profile?.socialLinks.twitch ?? '');
  const [youtube, setYoutube] = useState(profile?.socialLinks.youtube ?? '');
  const [github, setGithub] = useState(profile?.socialLinks.github ?? '');
  const [website, setWebsite] = useState(profile?.socialLinks.website ?? '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [bannerUri, setBannerUri] = useState<string | undefined>();
  const initialBorder = decodeCardBorder(profile?.cardBorder ?? 'classic');
  const [borderPreset, setBorderPreset] = useState<string>(initialBorder.preset);
  const [borderMotion, setBorderMotion] = useState<BorderMotion>(initialBorder.motion);
  const cardBorder = encodeCardBorder(borderPreset, borderMotion);
  const [customBorderUrl, setCustomBorderUrl] = useState(profile?.customBorderUrl ?? '');
  const [saving, setSaving] = useState(false);

  if (!profile) {
    return (
      <Screen>
        <AppText>No active profile.</AppText>
      </Screen>
    );
  }

  const activeProfile = profile;

  async function chooseAvatar() {
    const image = await pickImage({ aspect: [1, 1] });
    if (image) {
      setAvatarUri(image.uri);
    }
  }

  async function chooseAvatarGif() {
    try {
      const image = await pickGif();
      if (image) setAvatarUri(image.uri);
    } catch (error) {
      Alert.alert('Could not pick GIF', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function chooseBanner() {
    const image = await pickImage({ aspect: [3, 1] });
    if (image) {
      setBannerUri(image.uri);
    }
  }

  async function chooseBannerGif() {
    try {
      const image = await pickGif();
      if (image) setBannerUri(image.uri);
    } catch (error) {
      Alert.alert('Could not pick GIF', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function uploadBorderGif() {
    try {
      const gif = await pickGif();
      if (!gif) return;
      const url = await uploadImage({
        bucket: 'border-images',
        userId: activeProfile.id,
        uri: gif.uri
      });
      setCustomBorderUrl(url);
    } catch (error) {
      Alert.alert('Could not upload border GIF', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function save() {
    try {
      setSaving(true);
      const avatarUrl = avatarUri
        ? await uploadImage({ bucket: 'avatars', userId: activeProfile.id, uri: avatarUri })
        : activeProfile.avatarUrl;
      const bannerUrl = bannerUri
        ? await uploadImage({ bucket: 'banners', userId: activeProfile.id, uri: bannerUri })
        : activeProfile.bannerUrl;

      await patchProfile({
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        bio,
        region,
        favoriteHandheld: customHandheld.trim() || favoriteHandheld,
        favoriteFrontend: favoriteFrontend === 'Other' && customFrontend.trim() ? customFrontend.trim() : favoriteFrontend,
        favoriteSystems: favoriteSystems.map((item) =>
          item === 'Other' && customSystem.trim() ? customSystem.trim() : item
        ),
        favoriteGames: favoriteGames.map((item) =>
          item === 'Other' && customGame.trim() ? customGame.trim() : item
        ),
        customHandhelds: customHandheld.trim() ? [customHandheld.trim()] : [],
        customFrontends: customFrontend.trim() ? [customFrontend.trim()] : [],
        customSystems: customSystem.trim() ? [customSystem.trim()] : [],
        customGames: customGame.trim() ? [customGame.trim()] : [],
        cardBorder,
        customBorderUrl: customBorderUrl.trim() || undefined,
        setupNotes,
        currentGame,
        currentStatus,
        socialLinks: {
          twitter,
          discord,
          twitch,
          youtube,
          github,
          website
        },
        avatarUri: avatarUrl,
        bannerUri: bannerUrl
      });
      router.back();
    } catch (error) {
      Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <Row style={styles.topActions}>
        <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />
        <Button label="Save" icon={Save} compact loading={saving} onPress={() => void save()} />
      </Row>

      <Stack gap={spacing.xs}>
        <Badge label="Profile studio" tone="cyan" icon={Sparkles} />
        <AppText variant="display">Tune your PocketCard</AppText>
        <AppText color={colors.textSecondary}>
          Make the public version of your handheld setup feel useful, personal, and screenshot-worthy.
        </AppText>
      </Stack>

      <PreviewBlock
        profile={activeProfile}
        displayName={displayName}
        username={username}
        bio={bio}
        avatarUri={avatarUri}
        bannerUri={bannerUri}
        cardBorder={cardBorder}
        customBorderUrl={customBorderUrl}
      />

      <Card elevated>
        <View style={styles.previewBanner}>
          {bannerUri || activeProfile.bannerUrl ? (
            <Image source={{ uri: bannerUri ?? activeProfile.bannerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.bannerFallback} />
          )}
        </View>
        <Row style={styles.mediaActions}>
          <View style={styles.avatarPreview}>
            {avatarUri || activeProfile.avatarUrl ? (
              <Image source={{ uri: avatarUri ?? activeProfile.avatarUrl }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <AppText variant="sectionTitle">{displayName.slice(0, 2).toUpperCase() || 'PN'}</AppText>
            )}
          </View>
          <Stack gap={spacing.xs} style={styles.mediaCopy}>
            <AppText variant="sectionTitle">Profile media</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Banners should read clearly behind text; avatars should work at small sizes.
            </AppText>
          </Stack>
        </Row>
        <Row style={styles.mediaButtons}>
          <Button label="Avatar" icon={ImagePlus} variant="secondary" onPress={() => void chooseAvatar()} />
          <Button label="Avatar GIF" icon={Wand2} variant="ghost" onPress={() => void chooseAvatarGif()} />
          <Button label="Banner" icon={ImagePlus} variant="secondary" onPress={() => void chooseBanner()} />
          <Button label="Banner GIF" icon={Wand2} variant="ghost" onPress={() => void chooseBannerGif()} />
        </Row>
      </Card>

      <Card>
        <AppText variant="sectionTitle">Public Identity</AppText>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
        <TextField label="Username" value={username} autoCapitalize="none" onChangeText={setUsername} />
        <TextArea label="Bio" value={bio} onChangeText={setBio} placeholder="What should other handheld players know?" />
      </Card>

      <Card>
        <AppText variant="sectionTitle">Region</AppText>
        <ChipPicker options={REGIONS} value={region} onChange={(value) => setRegion(String(value))} />
      </Card>
      <Card>
        <AppText variant="sectionTitle">Handheld</AppText>
        <DeviceSelect
          value={favoriteHandheld}
          onChange={setFavoriteHandheld}
          customValue={customHandheld}
          onCustomChange={setCustomHandheld}
        />
        <DeviceProfileCard deviceName={favoriteHandheld} />
      </Card>
      <Card>
        <AppText variant="sectionTitle">Frontend</AppText>
        <ChipPicker
          options={FRONTENDS}
          value={favoriteFrontend}
          onChange={(value) => setFavoriteFrontend(String(value))}
          allowOther
          otherValue={customFrontend}
          onOtherChange={setCustomFrontend}
          otherPlaceholder="Type your frontend"
        />
      </Card>
      <Card>
        <AppText variant="sectionTitle">Systems</AppText>
        <ChipPicker
          options={SYSTEMS}
          value={favoriteSystems}
          multi
          onChange={(value) => setFavoriteSystems(value as string[])}
          allowOther
          otherValue={customSystem}
          onOtherChange={setCustomSystem}
          otherPlaceholder="Type a system you love"
        />
      </Card>
      <Card>
        <AppText variant="sectionTitle">Favorite Games</AppText>
        <ChipPicker
          options={SAMPLE_GAMES}
          value={favoriteGames}
          multi
          onChange={(value) => setFavoriteGames(value as string[])}
          allowOther
          otherValue={customGame}
          onOtherChange={setCustomGame}
          otherPlaceholder="Type a favorite game"
        />
      </Card>

      <Card>
        <AppText variant="sectionTitle">Profile Border</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Pick a static look, an animated preset, or upload your own GIF border.
        </AppText>

        <AppText variant="metadata" color={colors.textMuted}>Static</AppText>
        <ChipPicker
          options={STATIC_BORDERS as unknown as string[]}
          value={STATIC_BORDERS.includes(borderPreset as never) ? borderPreset : ''}
          onChange={(value) => {
            setBorderPreset(String(value));
            setCustomBorderUrl('');
          }}
        />

        <AppText variant="metadata" color={colors.textMuted}>Animated</AppText>
        <ChipPicker
          options={ANIMATED_BORDERS as unknown as string[]}
          value={ANIMATED_BORDERS.includes(borderPreset as never) ? borderPreset : ''}
          onChange={(value) => {
            setBorderPreset(String(value));
            setCustomBorderUrl('');
          }}
        />

        {isAnimatedBorder(borderPreset) ? (
          <>
            <AppText variant="metadata" color={colors.textMuted}>Motion</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Pick how the animated border moves. Lightning, fire and glitch have their own bespoke effect.
            </AppText>
            <ChipPicker
              options={BORDER_MOTIONS as unknown as string[]}
              value={borderMotion}
              onChange={(value) => setBorderMotion(String(value) as BorderMotion)}
            />
          </>
        ) : null}

        <AppText variant="sectionTitle">Custom GIF border</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Recommended: 600 × 600 square GIF, under 4 MB. The frame is rotated
          around your card so a seamless tileable pattern looks best. Animated
          GIF / PNG / JPG / WEBP. HTTPS only.
        </AppText>
        <Row style={{ flexWrap: 'wrap' }}>
          <Button label="Upload GIF border" icon={Upload} variant="secondary" onPress={() => void uploadBorderGif()} />
          {customBorderUrl ? (
            <Button label="Clear" variant="ghost" onPress={() => setCustomBorderUrl('')} />
          ) : null}
        </Row>
        <TextField
          label="Or paste an image URL"
          value={customBorderUrl}
          onChangeText={setCustomBorderUrl}
          placeholder="https://your-cdn.com/border.gif"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <AppText variant="metadata" color={colors.textMuted}>
          Custom borders override the preset. Keep it tasteful — PocketNet may remove
          borders that violate the community guidelines.
        </AppText>
      </Card>

      <Card>
        <AppText variant="sectionTitle">Current Status</AppText>
        <TextField label="Currently playing" value={currentGame} onChangeText={setCurrentGame} />
        <TextField label="Status line" value={currentStatus} onChangeText={setCurrentStatus} />
        <TextArea label="Setup / about" value={setupNotes} onChangeText={setSetupNotes} />
      </Card>

      <Card>
        <Row>
          <LinkIcon color={colors.accentPurple} size={20} />
          <AppText variant="sectionTitle">Social Links</AppText>
        </Row>
        <AppText variant="metadata" color={colors.textSecondary}>
          Paste a full link (https://…) to make the icon clickable, or just your handle to show it next to the icon.
        </AppText>
        <TextField label="X / Twitter" value={twitter} onChangeText={setTwitter} autoCapitalize="none" placeholder="@handle or https://x.com/handle" />
        <TextField label="Discord" value={discord} onChangeText={setDiscord} autoCapitalize="none" placeholder="username#0000 or full link" />
        <TextField label="Twitch" value={twitch} onChangeText={setTwitch} autoCapitalize="none" placeholder="handle or https://twitch.tv/handle" />
        <TextField label="YouTube" value={youtube} onChangeText={setYoutube} autoCapitalize="none" placeholder="@handle or https://youtube.com/@handle" />
        <TextField label="GitHub" value={github} onChangeText={setGithub} autoCapitalize="none" placeholder="username or https://github.com/username" />
        <TextField label="Website" value={website} onChangeText={setWebsite} autoCapitalize="none" placeholder="https://yoursite.com" />
      </Card>

      <Button label="Save profile" icon={Save} loading={saving} onPress={() => void save()} />
      <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

function PreviewBlock({
  profile,
  displayName,
  username,
  bio,
  avatarUri,
  bannerUri,
  cardBorder,
  customBorderUrl
}: {
  profile: import('@/types/domain').Profile;
  displayName: string;
  username: string;
  bio: string;
  avatarUri?: string;
  bannerUri?: string;
  cardBorder: string;
  customBorderUrl?: string;
}) {
  const draft = useMemo(
    () => ({
      ...profile,
      displayName: displayName || profile.displayName,
      username: username || profile.username,
      bio,
      avatarUrl: avatarUri ?? profile.avatarUrl,
      bannerUrl: bannerUri ?? profile.bannerUrl,
      cardBorder,
      customBorderUrl: customBorderUrl || undefined
    }),
    [profile, displayName, username, bio, avatarUri, bannerUri, cardBorder, customBorderUrl]
  );
  return (
    <Card>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="sectionTitle">Live preview</AppText>
        <Badge label="Unsaved" tone="warning" compact />
      </Row>
      <AppText variant="caption" color={colors.textSecondary}>
        This is how your profile will look right after you tap Save.
      </AppText>
      <ProfileHeader profile={draft} isCurrentUser activeTab="posts" />
    </Card>
  );
}

const styles = StyleSheet.create({
  topActions: {
    justifyContent: 'space-between'
  },
  previewBanner: {
    height: 144,
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    backgroundColor: colors.surfaceStrong
  },
  bannerFallback: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    borderBottomColor: `${colors.accentCyan}44`,
    borderBottomWidth: 1
  },
  mediaActions: {
    alignItems: 'flex-end',
    marginTop: -spacing.xl
  },
  avatarPreview: {
    width: 82,
    height: 82,
    borderRadius: radius.avatar,
    borderWidth: 3,
    borderColor: colors.accentCyan,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  mediaCopy: {
    flex: 1,
    paddingBottom: spacing.xs
  },
  mediaButtons: {
    flexWrap: 'wrap'
  }
});
