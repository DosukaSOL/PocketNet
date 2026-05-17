import { Image } from 'expo-image';
import { Flag, Heart, MessageCircle, Pin, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { canDeleteCommunityPost } from '@/lib/moderation';
import { colors, radius, spacing } from '@/lib/theme';
import type { Post } from '@/types/domain';

import { AppText, Avatar, Badge, Button, Card, IconButton, Row, TextField } from './ui';

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const { profile } = useAuth();
  const {
    getProfile,
    getCommunity,
    toggleLike,
    addComment,
    deletePost,
    report
  } = usePocketData();
  const [comment, setComment] = useState('');
  const author = getProfile(post.authorId);
  const community = getCommunity(post.communityId);
  const hasLiked = profile ? post.likeIds.includes(profile.id) : false;
  const canDelete = canDeleteCommunityPost({
    community,
    userId: profile?.id,
    postAuthorId: post.authorId
  });

  const timestamp = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(post.createdAt)),
    [post.createdAt]
  );

  async function handleAddComment() {
    await addComment(post.id, comment);
    setComment('');
  }

  function handleReport() {
    Alert.alert('Report post', 'Send this post to moderation review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => void report('post', post.id, 'User report')
      }
    ]);
  }

  function handleDelete() {
    Alert.alert('Delete post', 'This removes the post from PocketNet.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void deletePost(post.id) }
    ]);
  }

  return (
    <Card style={compact ? styles.compactCard : undefined}>
      <Row style={styles.header}>
        <Avatar label={author?.displayName ?? 'PocketNet user'} uri={author?.avatarUrl} />
        <View style={styles.authorBlock}>
          <Row style={styles.authorLine}>
            <AppText variant="body" style={styles.authorName}>
              {author?.displayName ?? 'PocketNet user'}
            </AppText>
            {post.isPinned ? <Pin color={colors.yellow} size={14} /> : null}
          </Row>
          <AppText variant="small" color={colors.textMuted}>
            @{author?.username ?? 'unknown'} · {timestamp}
          </AppText>
        </View>
      </Row>

      {community ? <Badge label={community.name} tone="blue" /> : null}

      {post.body ? <AppText>{post.body}</AppText> : null}

      {post.imageUrls[0] ? (
        <Image source={{ uri: post.imageUrls[0] }} style={styles.postImage} contentFit="cover" />
      ) : null}

      <Row style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => void toggleLike(post.id)}
          style={({ pressed }) => [styles.metric, pressed && styles.pressed]}
        >
          <Heart
            color={hasLiked ? colors.coral : colors.textMuted}
            fill={hasLiked ? colors.coral : 'transparent'}
            size={18}
          />
          <AppText variant="small" color={hasLiked ? colors.coral : colors.textMuted}>
            {post.likeIds.length}
          </AppText>
        </Pressable>
        <View style={styles.metric}>
          <MessageCircle color={colors.textMuted} size={18} />
          <AppText variant="small" color={colors.textMuted}>
            {post.comments.length}
          </AppText>
        </View>
        <View style={styles.actionSpacer} />
        <IconButton icon={Flag} label="Report post" onPress={handleReport} />
        {canDelete ? <IconButton icon={Trash2} label="Delete post" danger onPress={handleDelete} /> : null}
      </Row>

      {!compact ? (
        <View style={styles.comments}>
          {post.comments.slice(-2).map((item) => {
            const commentAuthor = getProfile(item.authorId);
            return (
              <View key={item.id} style={styles.comment}>
                <AppText variant="small" color={colors.textMuted}>
                  {commentAuthor?.displayName ?? 'Player'}
                </AppText>
                <AppText variant="small">{item.body}</AppText>
              </View>
            );
          })}
          <Row style={styles.commentComposer}>
            <View style={styles.commentInput}>
              <TextField
                placeholder="Add a comment"
                value={comment}
                onChangeText={setComment}
                returnKeyType="send"
                onSubmitEditing={() => void handleAddComment()}
              />
            </View>
            <Button label="Send" compact variant="secondary" onPress={() => void handleAddComment()} />
          </Row>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    padding: spacing.md
  },
  header: {
    alignItems: 'center'
  },
  authorBlock: {
    flex: 1
  },
  authorLine: {
    gap: spacing.xs
  },
  authorName: {
    fontWeight: '900'
  },
  postImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised
  },
  actions: {
    minHeight: 42
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 46
  },
  actionSpacer: {
    flex: 1
  },
  comments: {
    gap: spacing.sm
  },
  comment: {
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: spacing.sm,
    gap: 2
  },
  commentComposer: {
    alignItems: 'flex-start'
  },
  commentInput: {
    flex: 1
  },
  pressed: {
    opacity: 0.6
  }
});
