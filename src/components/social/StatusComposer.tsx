import { ImagePlus, Send, Sparkles, Wand2 } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { ImagePreview } from '@/components/ui/ImagePreview';
import { AppText, Avatar, Button, GlowCard, Row, Stack, TextArea } from '@/components/ui';
import { colors } from '@/design/tokens';
import { isDualScreenDevice } from '@/lib/devices';
import type { Profile } from '@/types/domain';

export function StatusComposer({
  profile,
  value,
  onChangeText,
  imageUri,
  onChooseImage,
  onChooseGif,
  onChooseTenor,
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
  onChooseGif?: () => void;
  onChooseTenor?: () => void;
  onRemoveImage?: () => void;
  onSubmit: () => void;
  loading?: boolean;
  placeholder?: string;
  title?: string;
}) {
  const disabled = loading || (!value.trim() && !imageUri);
  const dualScreen = isDualScreenDevice(profile?.favoriteHandheld);
  return (
    <GlowCard tone={dualScreen ? 'focus' : 'cyan'}>
      <Row style={styles.header}>
        {profile ? (
          <Avatar label={profile.displayName} uri={profile.avatarUrl} status="online" focus={dualScreen} />
        ) : null}
        <Stack gap={2} style={styles.headerCopy}>
          <AppText variant="sectionTitle">{title}</AppText>
          <AppText variant="metadata" color={colors.textMuted}>
            {profile ? `Posting as @${profile.username}` : 'PocketNet composer'}
          </AppText>
        </Stack>
      </Row>
      <TextArea value={value} onChangeText={onChangeText} placeholder={placeholder} />
      {imageUri ? <ImagePreview uri={imageUri} onRemove={onRemoveImage} /> : null}
      <Row>
        <Button label="Image" icon={ImagePlus} variant="secondary" onPress={onChooseImage} />
        {onChooseGif ? (
          <Button label="GIF" icon={Sparkles} variant="secondary" onPress={onChooseGif} />
        ) : null}
        {onChooseTenor ? (
          <Button label="Tenor" icon={Wand2} variant="ghost" onPress={onChooseTenor} />
        ) : null}
        <Button label="Post" icon={Send} loading={loading} disabled={disabled} onPress={onSubmit} />
      </Row>
      <AppText variant="metadata" color={colors.textMuted}>
        {Math.max(0, 2000 - value.length)} characters left
      </AppText>
    </GlowCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center'
  },
  headerCopy: {
    flex: 1
  }
});
