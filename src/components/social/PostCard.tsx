import { Image } from 'expo-image';
import { Flag, Heart, MessageCircle, MoreHorizontal, Pin, Send, Trash2 } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Button, GlowCard, IconButton, Reveal, Row, Stack, TextField } from '@/components/ui';
import { DeviceBadge, FrontendBadge } from '@/components/device';
import { CommentCard } from '@/components/social/CommentCard';
import { colors, radius, shadows, spacing } from '@/design/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { isDualScreenDevice } from '@/lib/devices';
import { canDeleteCommunityPost } from '@/lib/moderation';
import type { Post } from '@/types/domain';

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const { profile } = useAuth();
  const { getProfile, getCommunity, toggleLike, addComment, deletePost, report } = usePocketData();
  const [comment, setComment] = useState('');
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
    <Reveal>
      <GlowCard tone={hasLiked ? 'pink' : dualScreenAuthor ? 'focus' : 'cyan'} style={[styles.card, compact && styles.compactCard]}>
      <Row style={styles.header}>
        <Avatar
          label={author?.displayName ?? 'PocketNet user'}
          uri={author?.avatarUrl}
          size={compact ? 42 : 50}
          status={author?.currentGame ? 'online' : 'offline'}
          focus={dualScreenAuthor}
        />
        <Stack gap={2} style={styles.authorBlock}>
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
          {post.comments.slice(-2).map((item) => {
            const commentAuthor = getProfile(item.authorId);
            return (
              <CommentCard key={item.id} comment={item} authorName={commentAuthor?.displayName ?? 'Player'} />
            );
          })}
          <Row style={styles.commentComposer}>
            <View style={styles.commentInput}>
              <TextField
                placeholder="Write a reply"
                value={comment}
                onChangeText={setComment}
                returnKeyType="send"
                onSubmitEditing={() => void handleAddComment()}
              />
            </View>
            <Button label="Send" compact icon={Send} variant="secondary" onPress={() => void handleAddComment()} />
          </Row>
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
  }
});
