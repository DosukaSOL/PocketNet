import { router } from 'expo-router';
import { RadioTower, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { GifPicker } from '@/components/social/GifPicker';
import { StatusComposer } from '@/components/social/StatusComposer';
import { AppText, Badge, Button, GlowCard, PressableScale, Row, Screen, Stack } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { useThemeChoice } from '@/features/theme/ThemeProvider';
import { pickGif, pickImage } from '@/lib/media';
import { colors, radius, spacing } from '@/design/tokens';

export default function CreateScreen() {
  const { profile } = useAuth();
  const { communities, createPost, refresh, isLoading } = usePocketData();
  const { layout } = useThemeChoice();
  const { showToast } = useToast();
  const [body, setBody] = useState('');
  const [communityId, setCommunityId] = useState<string | undefined>();
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [tenorVisible, setTenorVisible] = useState(false);
  const joinedCommunities = communities.filter((community) =>
    profile ? community.memberIds.includes(profile.id) : false
  );

  async function chooseImage() {
    try {
      const image = await pickImage();
      if (image) {
        setImageUri(image.uri);
      }
    } catch (error) {
      Alert.alert('Could not choose image', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function chooseGif() {
    try {
      const gif = await pickGif();
      if (gif) {
        setImageUri(gif.uri);
      }
    } catch (error) {
      Alert.alert('Could not choose GIF', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function publish() {
    try {
      setLoading(true);
      await createPost({ body, communityId, imageUri });
      setBody('');
      setImageUri(undefined);
      setCommunityId(undefined);
      showToast('Posted');
      router.push('/(tabs)/home');
    } catch (error) {
      Alert.alert('Could not post', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  const composer = (
    <StatusComposer
      profile={profile}
      value={body}
      onChangeText={setBody}
      imageUri={imageUri}
      onChooseImage={() => void chooseImage()}
      onChooseGif={() => void chooseGif()}
      onChooseTenor={() => setTenorVisible(true)}
      onRemoveImage={() => setImageUri(undefined)}
      onSubmit={() => void publish()}
      loading={loading}
      title={communityId ? 'Community post' : 'Profile post'}
    />
  );

  const destination = (
    <GlowCard tone="purple">
      <Row style={styles.sectionHeader}>
        <Stack gap={2}>
          <AppText variant="sectionTitle">Destination</AppText>
          <AppText variant="metadata" color={colors.textMuted}>
            Pick where this update should live.
          </AppText>
        </Stack>
        <Badge label={communityId ? 'Community' : 'Profile'} tone={communityId ? 'purple' : 'cyan'} />
      </Row>
      <Row style={styles.chips}>
        <DestinationChip label="Profile" active={!communityId} onPress={() => setCommunityId(undefined)} />
        {joinedCommunities.map((community) => (
          <DestinationChip
            key={community.id}
            label={community.name}
            active={communityId === community.id}
            onPress={() => setCommunityId(community.id)}
          />
        ))}
      </Row>
      {!joinedCommunities.length ? (
        <View style={styles.inlineEmpty}>
          <Users color={colors.accentPurple} size={20} />
          <Stack gap={2} style={styles.inlineEmptyCopy}>
            <AppText variant="cardTitle">No joined communities yet</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              You can still post to your profile, or discover a community first.
            </AppText>
          </Stack>
          <Button label="Discover" compact variant="secondary" onPress={() => router.push('/(tabs)/discover')} />
        </View>
      ) : null}
    </GlowCard>
  );

  const composerFirst = layout === 'split-input-top';

  return (
    <Screen scroll refreshing={isLoading} onRefresh={() => void refresh()}>
      <Row style={styles.heroHeader}>
        <BrandMark size={38} />
        <Stack gap={spacing.xs} style={styles.heroCopy}>
          <Badge label="Composer" tone="pink" icon={RadioTower} />
          <AppText variant="display">Share the moment</AppText>
          <AppText color={colors.textSecondary}>
            Post to your profile or drop a screenshot note into one of your communities.
          </AppText>
        </Stack>
      </Row>

      {composerFirst ? composer : destination}
      {composerFirst ? destination : composer}
      <GifPicker
        visible={tenorVisible}
        onClose={() => setTenorVisible(false)}
        onPick={(url) => setImageUri(url)}
      />
    </Screen>
  );
}

function DestinationChip({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} style={[styles.chip, active && styles.activeChip]}>
      <Text style={[styles.chipLabel, active && styles.activeChipLabel]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroHeader: {
    alignItems: 'flex-start'
  },
  heroCopy: {
    flex: 1,
    minWidth: 0
  },
  chips: {
    flexWrap: 'wrap'
  },
  chip: {
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.control,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeChip: {
    borderColor: `${colors.accentCyan}AA`,
    backgroundColor: `${colors.accentCyan}18`
  },
  chipLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900'
  },
  activeChipLabel: {
    color: colors.accentCyan
  },
  inlineEmpty: {
    minHeight: 76,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  inlineEmptyCopy: {
    flex: 1
  }
});
