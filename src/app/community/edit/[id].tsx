import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ImagePlus, Save, Sparkles, Upload, Wand2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ChipPicker } from '@/components/ChipPicker';
import { AnimatedCardBorder, ANIMATED_BORDERS, STATIC_BORDERS } from '@/components/social/AnimatedCardBorder';
import { AppText, Avatar, Badge, Button, Card, EmptyState, GlowCard, Row, Screen, Stack, TextArea, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { pickGif, pickImage, uploadImage } from '@/lib/media';
import { colors, spacing } from '@/design/tokens';

export default function EditCommunityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { getCommunity, updateCommunity } = usePocketData();
  const community = getCommunity(id);

  const [name, setName] = useState(community?.name ?? '');
  const [description, setDescription] = useState(community?.description ?? '');
  const [bio, setBio] = useState(community?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [bannerUri, setBannerUri] = useState<string | undefined>();
  const [cardBorder, setCardBorder] = useState(community?.cardBorder ?? 'classic');
  const [customBorderUrl, setCustomBorderUrl] = useState(community?.customBorderUrl ?? '');
  const social = community?.socialLinks ?? {};
  const [twitter, setTwitter] = useState((social as Record<string, string>).twitter ?? '');
  const [discord, setDiscord] = useState((social as Record<string, string>).discord ?? '');
  const [twitch, setTwitch] = useState((social as Record<string, string>).twitch ?? '');
  const [youtube, setYoutube] = useState((social as Record<string, string>).youtube ?? '');
  const [github, setGithub] = useState((social as Record<string, string>).github ?? '');
  const [website, setWebsite] = useState((social as Record<string, string>).website ?? '');
  const [saving, setSaving] = useState(false);

  const isOwner = community && profile && community.creatorId === profile.id;

  if (!community) {
    return (
      <Screen>
        <EmptyState title="Community not found" body="This community may have been removed." />
      </Screen>
    );
  }

  if (!isOwner) {
    return (
      <Screen>
        <EmptyState
          title="Owner only"
          body="Only the community creator can edit community settings."
          action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  async function chooseAvatar() {
    try {
      const image = await pickImage({ aspect: [1, 1] });
      if (image) setAvatarUri(image.uri);
    } catch (error) {
      Alert.alert('Could not pick image', error instanceof Error ? error.message : 'Try again.');
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
    try {
      const image = await pickImage({ aspect: [3, 1] });
      if (image) setBannerUri(image.uri);
    } catch (error) {
      Alert.alert('Could not pick image', error instanceof Error ? error.message : 'Try again.');
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
      if (!gif || !profile) return;
      const url = await uploadImage({ bucket: 'border-images', userId: profile.id, uri: gif.uri });
      setCustomBorderUrl(url);
    } catch (error) {
      Alert.alert('Could not upload border GIF', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function save() {
    try {
      setSaving(true);
      const socialLinks: Record<string, string> = {};
      if (twitter.trim()) socialLinks.twitter = twitter.trim();
      if (discord.trim()) socialLinks.discord = discord.trim();
      if (twitch.trim()) socialLinks.twitch = twitch.trim();
      if (youtube.trim()) socialLinks.youtube = youtube.trim();
      if (github.trim()) socialLinks.github = github.trim();
      if (website.trim()) socialLinks.website = website.trim();
      await updateCommunity(community!.id, {
        name: name.trim() || undefined,
        description: description.trim(),
        bio: bio.trim(),
        cardBorder,
        customBorderUrl: customBorderUrl.trim(),
        socialLinks,
        avatarUri,
        bannerUri
      });
      router.back();
    } catch (error) {
      Alert.alert('Could not save community', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  const previewBorder = customBorderUrl ? undefined : cardBorder;

  return (
    <Screen scroll>
      <Row style={{ justifyContent: 'space-between' }}>
        <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />
        <Button label="Save" icon={Save} compact loading={saving} onPress={() => void save()} />
      </Row>

      <Stack gap={spacing.xs}>
        <Badge label="Community studio" tone="purple" icon={Sparkles} />
        <AppText variant="display">Edit {community.name}</AppText>
        <AppText color={colors.textSecondary}>
          Only you (the creator) can change these settings. Moderators can still pin posts and moderate members.
        </AppText>
      </Stack>

      <Card>
        <AppText variant="sectionTitle">Live preview</AppText>
        <AnimatedCardBorder preset={previewBorder} customBorderUrl={customBorderUrl || undefined}>
          <GlowCard tone="purple">
            <Row>
              <Avatar label={name || community.name} uri={avatarUri ?? community.avatarUrl} size={56} focus />
              <Stack gap={2} style={{ flex: 1 }}>
                <AppText variant="sectionTitle">{name || community.name}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {description || community.description}
                </AppText>
                {bio ? <AppText variant="metadata" color={colors.textMuted}>{bio}</AppText> : null}
              </Stack>
            </Row>
          </GlowCard>
        </AnimatedCardBorder>
      </Card>

      <Card>
        <AppText variant="sectionTitle">Identity</AppText>
        <TextField label="Name" value={name} onChangeText={setName} />
        <TextArea label="Description" value={description} onChangeText={setDescription} />
        <TextArea label="Bio" value={bio} onChangeText={setBio} placeholder="A longer tagline shown on your community page." />
      </Card>

      <Card>
        <AppText variant="sectionTitle">Avatar & Banner</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Avatars crop to a square (1:1). Banners crop to a wide aspect (3:1). GIF uploads keep their animation.
        </AppText>
        <Row style={{ flexWrap: 'wrap' }}>
          <Button label="Avatar" icon={ImagePlus} variant="secondary" onPress={() => void chooseAvatar()} />
          <Button label="Avatar GIF" icon={Wand2} variant="ghost" onPress={() => void chooseAvatarGif()} />
          <Button label="Banner" icon={ImagePlus} variant="secondary" onPress={() => void chooseBanner()} />
          <Button label="Banner GIF" icon={Wand2} variant="ghost" onPress={() => void chooseBannerGif()} />
        </Row>
      </Card>

      <Card>
        <AppText variant="sectionTitle">Community Border</AppText>
        <AppText variant="metadata" color={colors.textMuted}>Static</AppText>
        <ChipPicker
          options={STATIC_BORDERS as unknown as string[]}
          value={STATIC_BORDERS.includes(cardBorder as never) ? cardBorder : ''}
          onChange={(value) => {
            setCardBorder(String(value));
            setCustomBorderUrl('');
          }}
        />
        <AppText variant="metadata" color={colors.textMuted}>Animated</AppText>
        <ChipPicker
          options={ANIMATED_BORDERS as unknown as string[]}
          value={ANIMATED_BORDERS.includes(cardBorder as never) ? cardBorder : ''}
          onChange={(value) => {
            setCardBorder(String(value));
            setCustomBorderUrl('');
          }}
        />
        <AppText variant="sectionTitle">Custom GIF border</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Recommended: 600 × 600 GIF, under 4 MB. HTTPS only.
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
      </Card>

      <Card>
        <AppText variant="sectionTitle">Social links</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Only the creator can change these. They appear on the community page header.
        </AppText>
        <TextField label="Twitter / X" value={twitter} onChangeText={setTwitter} autoCapitalize="none" autoCorrect={false} />
        <TextField label="Discord" value={discord} onChangeText={setDiscord} autoCapitalize="none" autoCorrect={false} />
        <TextField label="Twitch" value={twitch} onChangeText={setTwitch} autoCapitalize="none" autoCorrect={false} />
        <TextField label="YouTube" value={youtube} onChangeText={setYoutube} autoCapitalize="none" autoCorrect={false} />
        <TextField label="GitHub" value={github} onChangeText={setGithub} autoCapitalize="none" autoCorrect={false} />
        <TextField label="Website" value={website} onChangeText={setWebsite} autoCapitalize="none" autoCorrect={false} />
      </Card>

      <Button label="Save community" icon={Save} loading={saving} onPress={() => void save()} />
      <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
