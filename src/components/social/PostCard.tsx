import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Flag, Heart, ImagePlus, MessageCircle, MoreHorizontal, Pin, Send, Trash2, X } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Button, GlowCard, IconButton, Reveal, Row, Stack, TextField } from '@/components/ui';
import { DeviceBadge, FrontendBadge } from '@/components/device';
import { CommentCard } from '@/components/social/CommentCard';
import { GifPicker } from '@/components/social/GifPicker';
import { colors, radius, shadows, spacing } from '@/design/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { isDualScreenDevice } from '@/lib/devices';
import { canDeleteCommunityPost } from '@/lib/moderation';
import type { Post } from '@/types/domain';

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const { profile } = useAuth();
  const { getProfile, getCommunity, toggleLike, addComment, deletePost, deleteComment, report } = usePocketData();
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);
  const [gifVisible, setGifVisible] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;
  const author = getProfile(post.authorId);
  const community = getCommunity(post.communityId);
  const dualScreenAuthor = isDualScreenDevice(author?.favoriteHandheld);
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

  async function handleLike() {
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.18, useNativeDriver: true, speed: 42, bounciness: 8 }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, speed: 34, bounciness: 4 })
    ]).start();
    await toggleLike(post.id);
  }

  async function handleAddComment() {
    await addComment(post.id, comment, replyingTo?.commentId);
    setComment('');
    setReplyingTo(null);
  }

  function handleReplyTo(commentId: string, username: string) {
    setReplyingTo({ commentId, username });
    setComment((current) => (current.startsWith(`@${username} `) ? current : `@${username} `));
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

  function openAuthor() {
    if (!author) return;
    if (author.id === profile?.id) {
      router.push('/(tabs)/profile' as never);
    } else {
      router.push(`/user/${author.id}` as never);
    }
  }

  return (
    <Reveal>
      <GlowCard tone={hasLiked ? 'pink' : dualScreenAuthor ? 'focus' : 'cyan'} style={[styles.card, compact && styles.compactCard]}>
      <Row style={styles.header}>
        <Pressable onPress={openAuthor} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Open ${author?.displayName ?? 'user'} profile`}>
          <Avatar
            label={author?.displayName ?? 'PocketNet user'}
            uri={author?.avatarUrl}
            size={compact ? 42 : 50}
            status={author?.currentGame ? 'online' : 'offline'}
            focus={dualScreenAuthor}
          />
        </Pressable>
        <Pressable onPress={openAuthor} style={styles.authorBlock} hitSlop={6} accessibilityRole="button">
          <Stack gap={2}>
            <Row style={styles.authorLine}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {author?.displayName ?? 'PocketNet user'}
              </AppText>
              {post.isPinned ? <Pin color={colors.warning} size={14} /> : null}
            </Row>
            <AppText variant="metadata" color={colors.textMuted} numberOfLines={1}>
              @{author?.username ?? 'unknown'} · {timestamp}
            </AppText>
          </Stack>
        </Pressable>
        <IconButton icon={MoreHorizontal} label="Post actions" onPress={handleReport} />
      </Row>

      <Row style={styles.badges}>
        {community ? <Badge label={community.name} tone="blue" compact /> : null}
        {author?.favoriteHandheld ? <DeviceBadge deviceName={author.favoriteHandheld} compact /> : null}
        <FrontendBadge frontend={author?.favoriteFrontend} compact />
      </Row>

      {post.body ? <AppText style={styles.bodyText}>{post.body}</AppText> : null}

      {post.imageUrls[0] ? (
        <Image source={{ uri: post.imageUrls[0] }} style={styles.postImage} contentFit="cover" />
      ) : null}

      <Row style={styles.actions}>
        <Button
          label={`${post.likeIds.length}`}
          icon={() => (
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Heart
                color={hasLiked ? colors.accentPink : colors.textSecondary}
                fill={hasLiked ? colors.accentPink : 'transparent'}
                size={18}
              />
            </Animated.View>
          )}
          compact
          variant={hasLiked ? 'secondary' : 'ghost'}
          onPress={() => void handleLike()}
        />
        <Button
          label={`${post.comments.length}`}
          icon={MessageCircle}
          compact
          variant="ghost"
        />
        <View style={styles.actionSpacer} />
        <IconButton icon={Flag} label="Report post" tone="warning" onPress={handleReport} />
        {canDelete ? <IconButton icon={Trash2} label="Delete post" danger onPress={handleDelete} /> : null}
      </Row>

      {!compact ? (
        <Stack gap={spacing.sm}>
          {post.comments.slice(-4).map((item) => {
            const commentAuthor = getProfile(item.authorId);
            const parent = item.parentCommentId
              ? post.comments.find((c) => c.id === item.parentCommentId)
              : undefined;
            const parentAuthor = parent ? getProfile(parent.authorId) : undefined;
            return (
              <CommentCard
                key={item.id}
                comment={item}
                authorName={commentAuthor?.displayName ?? 'Player'}
                parentAuthorName={parentAuthor?.username}
                onReply={() =>
                  handleReplyTo(item.id, commentAuthor?.username ?? 'player')
                }
                canDelete={item.authorId === profile?.id}
                onDelete={() => void deleteComment(post.id, item.id)}
              />
            );
          })}
          {replyingTo ? (
            <Row style={styles.replyingPill}>
              <AppText variant="metadata" color={colors.accentCyan}>
                Replying to @{replyingTo.username}
              </AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setReplyingTo(null);
                  setComment('');
                }}
                hitSlop={8}
              >
                <X size={14} color={colors.textMuted} />
              </Pressable>
            </Row>
          ) : null}
          <Row style={styles.commentComposer}>
            <View style={styles.commentInput}>
              <TextField
                placeholder={replyingTo ? 'Write your reply' : 'Write a reply'}
                value={comment}
                onChangeText={setComment}
                returnKeyType="send"
                onSubmitEditing={() => void handleAddComment()}
              />
            </View>
            <IconButton icon={ImagePlus} label="Add GIF" onPress={() => setGifVisible(true)} />
            <Button label="Send" compact icon={Send} variant="secondary" onPress={() => void handleAddComment()} />
          </Row>
          <GifPicker
            visible={gifVisible}
            onClose={() => setGifVisible(false)}
            onPick={(url) => {
              setComment((current) => (current.trim() ? `${current.trim()} ${url}` : url));
            }}
          />
        </Stack>
      ) : null}
      </GlowCard>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.card
  },
  compactCard: {
    padding: spacing.sm,
    borderRadius: radius.lg
  },
  header: {
    alignItems: 'center'
  },
  authorBlock: {
    flex: 1,
    minWidth: 0
  },
  authorLine: {
    gap: spacing.xs
  },
  badges: {
    flexWrap: 'wrap'
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 23
  },
  postImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border
  },
  actions: {
    minHeight: 42
  },
  actionSpacer: {
    flex: 1
  },
  commentComposer: {
    alignItems: 'flex-start'
  },
  commentInput: {
    flex: 1
  },
  replyingPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: `${colors.accentCyan}55`,
    backgroundColor: `${colors.accentCyan}11`,
    alignSelf: 'flex-start'
  }
});
