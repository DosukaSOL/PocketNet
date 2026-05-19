import { CornerDownRight, Reply, Trash2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import type { Comment } from '@/types/domain';

const GIF_RE = /(https:\/\/[A-Za-z0-9.\-/_%?=&:#~+]+?\.(?:gif|webp))(?:\?[A-Za-z0-9.\-/_%?=&:#~+]*)?/i;

function extractGif(body: string): { text: string; gifUrl?: string } {
  const match = body.match(GIF_RE);
  if (!match) return { text: body };
  const gifUrl = match[0];
  const text = body.replace(gifUrl, '').trim();
  return { text, gifUrl };
}

export function CommentCard({
  comment,
  authorName = 'Player',
  parentAuthorName,
  onReply,
  onDelete,
  canDelete = false
}: {
  comment: Comment;
  authorName?: string;
  parentAuthorName?: string;
  onReply?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}) {
  const isReply = Boolean(comment.parentCommentId);
  const { text, gifUrl } = extractGif(comment.body);

  function confirmDelete() {
    Alert.alert('Delete reply', 'Remove your reply from this thread?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete?.() }
    ]);
  }

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
      <AppText variant="caption">{text || (gifUrl ? '' : comment.body)}</AppText>
      {gifUrl ? (
        <Image
          source={{ uri: gifUrl }}
          style={styles.gif}
          contentFit="cover"
          cachePolicy="memory-disk"
          accessibilityIgnoresInvertColors
        />
      ) : null}
      <View style={styles.actionsRow}>
        {onReply ? (
          <Pressable accessibilityRole="button" onPress={onReply} style={styles.actionButton} hitSlop={8}>
            <Reply size={12} color={colors.accentCyan} />
            <AppText variant="metadata" color={colors.accentCyan}>
              Reply
            </AppText>
          </Pressable>
        ) : null}
        {canDelete && onDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete reply"
            onPress={confirmDelete}
            style={styles.actionButton}
            hitSlop={8}
          >
            <Trash2 size={12} color={colors.danger} />
            <AppText variant="metadata" color={colors.danger}>
              Delete
            </AppText>
          </Pressable>
        ) : null}
      </View>
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  gif: {
    marginTop: 4,
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceGlass
  }
});
