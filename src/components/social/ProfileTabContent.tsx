import { router } from 'expo-router';
import { Image as ImageIcon, Lock, Trophy } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { AchievementsHelpButton } from '@/components/social/AchievementsHelpPopover';
import { CommunityCard } from '@/components/CommunityCard';
import { PostCard } from '@/components/PostCard';
import { UserCard } from '@/components/social/UserCard';
import { AppText, EmptyState, GlowCard, Row, Stack } from '@/components/ui';
import { useRetroAchievements } from '@/hooks/useRetroAchievements';
import { colors, radius, spacing } from '@/design/tokens';
import type { Community, Post, Profile } from '@/types/domain';
import type { ProfileTab } from '@/components/social/ProfileHeader';

type ReplyEntry = { comment: Post['comments'][number]; post: Post };

export function ProfileTabContent({
  profile,
  activeTab,
  isCurrentUser,
  posts,
  replies,
  friends,
  followers,
  communities,
  canView,
  isFriend,
  isFollower,
  onJoinCommunity,
  onLeaveCommunity
}: {
  profile: Profile;
  activeTab: ProfileTab;
  isCurrentUser: boolean;
  posts: Post[];
  replies: ReplyEntry[];
  friends: Profile[];
  followers: Profile[];
  communities: Community[];
  canView: boolean;
  isFriend: boolean;
  isFollower: boolean;
  onJoinCommunity?: (id: string) => void;
  onLeaveCommunity?: (id: string) => void;
}) {
  const ra = useRetroAchievements(activeTab === 'achievements' ? profile.raUsername : undefined);

  if (!canView) {
    return (
      <GlowCard tone="focus">
        <Stack gap={spacing.xs} style={{ alignItems: 'center' }}>
          <Lock color={colors.warning} size={28} />
          <AppText variant="sectionTitle">This profile is private</AppText>
          <AppText color={colors.textSecondary} style={{ textAlign: 'center' }}>
            Only @{profile.username}&apos;s friends and followers can see their posts,
            replies, friends, followers, communities, and achievements.
          </AppText>
        </Stack>
      </GlowCard>
    );
  }

  if (activeTab === 'posts') {
    return posts.length ? (
      <>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </>
    ) : (
      <EmptyState
        title={isCurrentUser ? 'No posts yet' : 'No public posts yet'}
        body={
          isCurrentUser
            ? 'Share your setup, a status update, or a screenshot from the Post tab.'
            : `${profile.displayName} has not shared a PocketNet update yet.`
        }
      />
    );
  }

  if (activeTab === 'replies') {
    return replies.length ? (
      <Stack gap={spacing.md}>
        {replies.map(({ comment, post }) => (
          <GlowCard key={comment.id} tone="cyan">
            <Stack gap={spacing.xs}>
              <AppText variant="metadata" color={colors.textMuted}>
                Reply to @{post.authorId === profile.id ? profile.username : 'a player'}&apos;s post
              </AppText>
              <AppText color={colors.textSecondary} numberOfLines={3}>
                {post.body || '[image post]'}
              </AppText>
              <AppText style={styles.replyBody}>{comment.body}</AppText>
            </Stack>
          </GlowCard>
        ))}
      </Stack>
    ) : (
      <EmptyState
        title="No replies yet"
        body={isCurrentUser ? 'Comments you leave on posts show up here.' : `${profile.displayName} has not commented on anything yet.`}
      />
    );
  }

  if (activeTab === 'friends') {
    return friends.length ? (
      <Stack gap={spacing.sm}>
        {friends.map((friend) => (
          <UserCard
            key={friend.id}
            profile={friend}
            actionLabel="View"
            onOpen={() => router.push(`/user/${friend.id}` as never)}
            onAction={() => router.push(`/user/${friend.id}` as never)}
          />
        ))}
      </Stack>
    ) : (
      <EmptyState title="No friends yet" body={isCurrentUser ? 'Find players in Discover.' : 'No accepted friendships yet.'} />
    );
  }

  if (activeTab === 'followers') {
    return followers.length ? (
      <Stack gap={spacing.sm}>
        {followers.map((follower) => (
          <UserCard
            key={follower.id}
            profile={follower}
            actionLabel="View"
            onOpen={() => router.push(`/user/${follower.id}` as never)}
            onAction={() => router.push(`/user/${follower.id}` as never)}
          />
        ))}
      </Stack>
    ) : (
      <EmptyState title="No followers yet" body="Followers show up here as players follow this profile." />
    );
  }

  if (activeTab === 'communities') {
    return communities.length ? (
      <Stack gap={spacing.md}>
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onOpen={() => router.push(`/community/${community.id}` as never)}
            onJoin={onJoinCommunity ? () => onJoinCommunity(community.id) : undefined}
            onLeave={onLeaveCommunity ? () => onLeaveCommunity(community.id) : undefined}
          />
        ))}
      </Stack>
    ) : (
      <EmptyState title="No communities yet" body="Communities this player has joined will show here." />
    );
  }

  // achievements
  if (!profile.raUsername) {
    return (
      <Stack gap={spacing.sm}>
        <Row style={{ justifyContent: 'flex-end' }}>
          <AchievementsHelpButton />
        </Row>
        <EmptyState
          title="No RetroAchievements account linked"
          body={
            isCurrentUser
              ? 'Link your RetroAchievements account in Settings → Account → RetroAchievements.'
              : `${profile.displayName} has not linked a RetroAchievements account yet.`
          }
          icon={Trophy}
        />
      </Stack>
    );
  }
  if (ra.error) {
    return (
      <Stack gap={spacing.sm}>
        <Row style={{ justifyContent: 'flex-end' }}>
          <AchievementsHelpButton />
        </Row>
        <EmptyState title="Achievements unavailable" body={ra.error} icon={Trophy} />
      </Stack>
    );
  }
  if (ra.loading) {
    return <EmptyState title="Loading achievements…" body={`Pulling latest unlocks for ${profile.raUsername}.`} icon={Trophy} />;
  }
  if (!ra.achievements.length) {
    return (
      <EmptyState
        title="No recent unlocks"
        body={`${profile.displayName} has no recent RetroAchievements activity.`}
        icon={Trophy}
      />
    );
  }
  return (
    <Stack gap={spacing.sm}>
      <GlowCard tone="focus">
        <Row>
          <Trophy color={colors.warning} size={20} />
          <Stack gap={2} style={{ flex: 1 }}>
            <AppText variant="sectionTitle">{ra.points.toLocaleString()} points</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Recent unlocks for @{profile.raUsername} on RetroAchievements.
            </AppText>
          </Stack>
        </Row>
      </GlowCard>
      {ra.achievements.map((item) => (
        <Row key={item.achievementId} style={styles.achievement}>
          <View style={styles.badge}>
            {item.badgeUrl ? (
              <Image source={{ uri: item.badgeUrl }} style={{ width: 48, height: 48, borderRadius: 8 }} />
            ) : (
              <ImageIcon color={colors.textMuted} />
            )}
          </View>
          <Stack gap={2} style={{ flex: 1 }}>
            <AppText variant="bodyStrong" numberOfLines={1}>{item.title}</AppText>
            <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
              {item.gameTitle ? `${item.gameTitle} · ` : ''}{item.points} pts
            </AppText>
            {item.dateEarned ? (
              <AppText variant="metadata" color={colors.textMuted}>{item.dateEarned}</AppText>
            ) : null}
          </Stack>
        </Row>
      ))}
    </Stack>
  );
}

const styles = StyleSheet.create({
  replyBody: { fontSize: 15, lineHeight: 22 },
  achievement: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center'
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

// silence unused warning if isFollower toggles a future feature
export const __isFollower = (v: boolean) => v;
