import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/design/tokens';

import { IconButton } from './index';

export function ImagePreview({ uri, onRemove }: { uri: string; onRemove?: () => void }) {
  return (
    <View style={styles.wrap}>
      <Image source={{ uri }} style={styles.image} contentFit="cover" />
      {onRemove ? (
        <View style={styles.remove}>
          <IconButton icon={X} label="Remove image" danger onPress={onRemove} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    overflow: 'hidden',
    backgroundColor: colors.surfaceStrong
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10
  },
  remove: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm
  }
});
