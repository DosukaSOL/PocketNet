import { CornerDownRight, Reply } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import type { Comment } from '@/types/domain';

export function CommentCard({
  comment,
  authorName = 'Player',
  parentAuthorName,
  onReply
}: {
  comment: Comment;
  authorName?: string;
  parentAuthorName?: string;
  onReply?: () => void;
}) {
  const isReply = Boolean(comment.parentCommentId);
  return (
    <View style={[styles.card, isReply && styles.replyCard]}>
      <View style={styles.headerRow}>
        <AppText variant="metadata" color={colors.textMuted}>
          {authorName}
        </AppText>
        {parentAuthorName ? (
          <View style={styles.replyTo}>
            <CornerDownRight size={12} color={colors.accentCyan} />
            <AppText variant="metadata" color={colors.accentCyan}>
              @{parentAuthorName}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption">{comment.body}</AppText>
      {onReply ? (
        <Pressable accessibilityRole="button" onPress={onReply} style={styles.replyButton} hitSlop={8}>
          <Reply size={12} color={colors.accentCyan} />
          <AppText variant="metadata" color={colors.accentCyan}>
            Reply
          </AppText>
        </Pressable>
      ) : null}
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
  },
  replyCard: {
    marginLeft: spacing.lg,
    borderColor: `${colors.accentCyan}55`
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap'
  },
  replyTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start'
  }
});
