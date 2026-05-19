import { CornerDownRight, Reply, Trash2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import type { Comment } from '@/types/domain';

const MEDIA_RE = /(https:\/\/[A-Za-z0-9.\-/_%?=&:#~+]+?\.(?:gif|webp|jpe?g|png))(?:\?[A-Za-z0-9.\-/_%?=&:#~+]*)?/i;

function extractMedia(body: string): { text: string; mediaUrl?: string } {
  const match = body.match(MEDIA_RE);
  if (!match) return { text: body };
  const mediaUrl = match[0];
  const text = body.replace(mediaUrl, '').trim();
  return { text, mediaUrl };
}

export function CommentCard({
  comment,
  authorName = 'Player',
  authorUsername,
  authorAvatarUrl,
  parentAuthorName,
  onReply,
  onDelete,
  canDelete = false
}: {
  comment: Comment;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  parentAuthorName?: string;
  onReply?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}) {
  const isReply = Boolean(comment.parentCommentId);
  const { text, mediaUrl } = extractMedia(comment.body);

  function openAuthor() {
    if (!comment.authorId) return;
    router.push(`/user/${comment.authorId}` as never);
  }

  function confirmDelete() {
    Alert.alert('Delete reply', 'Remove your reply from this thread?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete?.() }
    ]);
  }

  return (
    <View style={[styles.card, isReply && styles.replyCard]}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${authorName} profile`}
          onPress={openAuthor}
          hitSlop={6}
        >
          <Avatar label={authorName} uri={authorAvatarUrl} size={28} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${authorName} profile`}
          onPress={openAuthor}
          hitSlop={6}
          style={styles.authorTextWrap}
        >
          <AppText variant="metadata" color={colors.textPrimary}>
            {authorName}
          </AppText>
          {authorUsername ? (
            <AppText variant="metadata" color={colors.textMuted}>
              @{authorUsername}
            </AppText>
          ) : null}
        </Pressable>
        {parentAuthorName ? (
          <View style={styles.replyTo}>
            <CornerDownRight size={12} color={colors.accentCyan} />
            <AppText variant="metadata" color={colors.accentCyan}>
              @{parentAuthorName}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption">{text || (mediaUrl ? '' : comment.body)}</AppText>
      {mediaUrl ? (
        <Image
          source={{ uri: mediaUrl }}
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
  authorTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
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
