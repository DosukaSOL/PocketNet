import { ImagePlus, Send } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppText, Button, Card, Row, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { pickImage } from '@/lib/media';
import { colors, radius, spacing } from '@/lib/theme';

export default function CreateScreen() {
  const { profile } = useAuth();
  const { communities, createPost } = usePocketData();
  const [body, setBody] = useState('');
  const [communityId, setCommunityId] = useState<string | undefined>();
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
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

  async function publish() {
    try {
      setLoading(true);
      await createPost({ body, communityId, imageUri });
      setBody('');
      setImageUri(undefined);
      setCommunityId(undefined);
      Alert.alert('Posted', 'Your update is live.');
    } catch (error) {
      Alert.alert('Could not post', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <AppText variant="heading">New Post</AppText>
      <Card elevated>
        <TextField
          label="Status"
          multiline
          value={body}
          onChangeText={setBody}
          placeholder="Share a setup tweak, screenshot note, or what you are playing."
        />
        <View style={styles.communityWrap}>
          <AppText variant="small" color={colors.textMuted}>Community</AppText>
          <Row style={styles.chips}>
            <Pressable
              onPress={() => setCommunityId(undefined)}
              style={[styles.chip, !communityId && styles.activeChip]}
            >
              <Text style={[styles.chipText, !communityId && styles.activeText]}>Profile</Text>
            </Pressable>
            {joinedCommunities.map((community) => (
              <Pressable
                key={community.id}
                onPress={() => setCommunityId(community.id)}
                style={[styles.chip, communityId === community.id && styles.activeChip]}
              >
                <Text style={[styles.chipText, communityId === community.id && styles.activeText]}>
                  {community.name}
                </Text>
              </Pressable>
            ))}
          </Row>
        </View>
        {imageUri ? <AppText color={colors.lime}>Image selected</AppText> : null}
        <Row>
          <Button label="Image" icon={ImagePlus} variant="secondary" onPress={() => void chooseImage()} />
          <Button label="Publish" icon={Send} loading={loading} onPress={() => void publish()} />
        </Row>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  communityWrap: {
    gap: spacing.sm
  },
  chips: {
    flexWrap: 'wrap'
  },
  chip: {
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeChip: {
    borderColor: colors.cyan,
    backgroundColor: `${colors.cyan}18`
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '800'
  },
  activeText: {
    color: colors.cyan
  },
  chipsText: {}
});
