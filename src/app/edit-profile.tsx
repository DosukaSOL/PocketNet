import { router } from 'expo-router';
import { ImagePlus, Save } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ChipPicker } from '@/components/ChipPicker';
import { AppText, Button, Card, Row, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { FRONTENDS, HANDHELDS, REGIONS, SAMPLE_GAMES, SYSTEMS } from '@/lib/catalog';
import { pickImage, uploadImage } from '@/lib/media';
import { colors } from '@/lib/theme';

export default function EditProfileScreen() {
  const { profile, patchProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [region, setRegion] = useState(profile?.region ?? '');
  const [favoriteHandheld, setFavoriteHandheld] = useState(profile?.favoriteHandheld ?? '');
  const [favoriteFrontend, setFavoriteFrontend] = useState(profile?.favoriteFrontend ?? '');
  const [favoriteSystems, setFavoriteSystems] = useState(profile?.favoriteSystems ?? []);
  const [favoriteGames, setFavoriteGames] = useState(profile?.favoriteGames ?? []);
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
    const image = await pickImage();
    if (image) {
      setAvatarUri(image.uri);
    }
  }

  async function chooseBanner() {
    const image = await pickImage();
    if (image) {
      setBannerUri(image.uri);
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
        favoriteHandheld,
        favoriteFrontend,
        favoriteSystems,
        favoriteGames,
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
        isThorUser: favoriteHandheld === 'AYN Thor',
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
      <AppText variant="heading">Edit Profile</AppText>
      <Card>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
        <TextField label="Username" value={username} autoCapitalize="none" onChangeText={setUsername} />
        <TextField label="Bio" value={bio} onChangeText={setBio} multiline />
        <Row>
          <Button label="Avatar" icon={ImagePlus} variant="secondary" onPress={() => void chooseAvatar()} />
          <Button label="Banner" icon={ImagePlus} variant="secondary" onPress={() => void chooseBanner()} />
        </Row>
        {avatarUri ? <AppText color={colors.lime}>New avatar selected</AppText> : null}
        {bannerUri ? <AppText color={colors.lime}>New banner selected</AppText> : null}
      </Card>
      <Card>
        <AppText variant="title">Region</AppText>
        <ChipPicker options={REGIONS} value={region} onChange={(value) => setRegion(String(value))} />
      </Card>
      <Card>
        <AppText variant="title">Handheld</AppText>
        <ChipPicker options={HANDHELDS} value={favoriteHandheld} onChange={(value) => setFavoriteHandheld(String(value))} />
      </Card>
      <Card>
        <AppText variant="title">Frontend</AppText>
        <ChipPicker options={FRONTENDS} value={favoriteFrontend} onChange={(value) => setFavoriteFrontend(String(value))} />
      </Card>
      <Card>
        <AppText variant="title">Systems</AppText>
        <ChipPicker options={SYSTEMS} value={favoriteSystems} multi onChange={(value) => setFavoriteSystems(value as string[])} />
      </Card>
      <Card>
        <AppText variant="title">Favorite Games</AppText>
        <ChipPicker options={SAMPLE_GAMES} value={favoriteGames} multi onChange={(value) => setFavoriteGames(value as string[])} />
      </Card>
      <Card>
        <TextField label="Currently playing" value={currentGame} onChangeText={setCurrentGame} />
        <TextField label="Current status" value={currentStatus} onChangeText={setCurrentStatus} />
        <TextField label="Setup / about" value={setupNotes} onChangeText={setSetupNotes} multiline />
      </Card>
      <Card>
        <AppText variant="title">Social Links</AppText>
        <TextField label="X / Twitter" value={twitter} onChangeText={setTwitter} autoCapitalize="none" />
        <TextField label="Discord" value={discord} onChangeText={setDiscord} autoCapitalize="none" />
        <TextField label="Twitch" value={twitch} onChangeText={setTwitch} autoCapitalize="none" />
        <TextField label="YouTube" value={youtube} onChangeText={setYoutube} autoCapitalize="none" />
        <TextField label="GitHub" value={github} onChangeText={setGithub} autoCapitalize="none" />
        <TextField label="Website" value={website} onChangeText={setWebsite} autoCapitalize="none" />
      </Card>
      <Button label="Save profile" icon={Save} loading={saving} onPress={() => void save()} />
      <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
