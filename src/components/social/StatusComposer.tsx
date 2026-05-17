import { Image } from 'expo-image';
import { ImagePlus, Send, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, Card, IconButton, Row, Stack, TextArea } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import type { Profile } from '@/types/domain';

export function StatusComposer({
  profile,
  value,
  onChangeText,
  imageUri,
  onChooseImage,
  onRemoveImage,
  onSubmit,
  loading = false,
  placeholder = 'Share a setup tweak, screenshot note, or what you are playing.',
  title = 'New post'
}: {
  profile?: Profile | null;
  value: string;
  onChangeText: (value: string) => void;
  imageUri?: string;
  onChooseImage?: () => void;
  onRemoveImage?: () => void;
  onSubmit: () => void;
  loading?: boolean;
  placeholder?: string;
  title?: string;
}) {
  const disabled = loading || (!value.trim() && !imageUri);
  return (
    <Card elevated>
      <Row style={styles.header}>
        {profile ? (
          <Avatar label={profile.displayName} uri={profile.avatarUrl} status={profile.currentGame ? 'online' : 'offline'} thor={profile.isThorUser} />
        ) : null}
        <Stack gap={2} style={styles.headerCopy}>
          <AppText variant="sectionTitle">{title}</AppText>
          <AppText variant="metadata" color={colors.textMuted}>
            {profile ? `Posting as @${profile.username}` : 'PocketNet composer'}
          </AppText>
        </Stack>
      </Row>
      <TextArea value={value} onChangeText={onChangeText} placeholder={placeholder} />
      {imageUri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
          <View style={styles.removeButton}>
            <IconButton icon={X} label="Remove image" danger onPress={onRemoveImage} />
          </View>
        </View>
      ) : null}
      <Row>
        <Button label="Image" icon={ImagePlus} variant="secondary" onPress={onChooseImage} />
        <Button label="Post" icon={Send} loading={loading} disabled={disabled} onPress={onSubmit} />
      </Row>
      <AppText variant="metadata" color={colors.textMuted}>
        {Math.max(0, 2000 - value.length)} characters left
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center'
  },
  headerCopy: {
    flex: 1
  },
  previewWrap: {
    position: 'relative'
  },
  preview: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm
  }
});
