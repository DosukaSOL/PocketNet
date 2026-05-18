import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import type { Comment } from '@/types/domain';

export function CommentCard({ comment, authorName = 'Player' }: { comment: Comment; authorName?: string }) {
  return (
    <View style={styles.card}>
      <AppText variant="metadata" color={colors.textMuted}>
        {authorName}
      </AppText>
      <AppText variant="caption">{comment.body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
    padding: spacing.sm,
    gap: 2
  }
});
