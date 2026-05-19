import { router } from 'expo-router';
import { Settings, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { CommunityCard } from '@/components/CommunityCard';
import { PostCard } from '@/components/PostCard';
import { ProfileHeader, type ProfileTab } from '@/components/ProfileHeader';
import { SetupCard } from '@/components/social/SetupCard';
import { UserCard } from '@/components/social/UserCard';
import { AppText, Button, EmptyState, Row, Screen, Stack, StatPill } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { colors, spacing } from '@/design/tokens';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const { getProfilePosts, getFriends, communities, notifications, joinCommunity, leaveCommunity } = usePocketData();
  const [tab, setTab] = useState<ProfileTab>('posts');

  if (!profile) {
    return (
      <Screen>
        <EmptyState
          title="No profile"
          body="Log in or enter preview mode to create your PocketNet profile."
          icon={UserRound}
        />
      </Screen>
    );
  }

  const posts = getProfilePosts(profile.id);
  const friends = getFriends();
  const memberCommunities = communities.filter((community) => community.memberIds.includes(profile.id));
  const unread = notifications.filter((notification) => !notification.readAt);

  return (
    <Screen scroll>
      <Row style={styles.headerActions}>
        <BrandMark size={34} />
        <Stack gap={2} style={styles.headerTitle}>
          <AppText variant="metadata" color={colors.textMuted}>Your identity</AppText>
          <AppText variant="screenTitle">Profile</AppText>
        </Stack>
        <Button label="Settings" icon={Settings} compact variant="secondary" onPress={() => router.push('/settings')} />
      </Row>

      <Row style={styles.stats}>
        <StatPill label="Feed" value={posts.length} />
        <StatPill label="Friends" value={friends.length} />
        <StatPill label="Unread" value={unread.length} />
      </Row>

      <ProfileHeader
        profile={profile}
        isCurrentUser
        postCount={posts.length}
        friendCount={friends.length}
        communityCount={memberCommunities.length}
        activeTab={tab}
        onTabChange={setTab}
        onEdit={() => router.push('/edit-profile')}
      />

      {tab === 'posts' ? (
        <Stack gap={spacing.md}>
          <Row style={styles.sectionHeader}>
            <AppText variant="sectionTitle">Profile Posts</AppText>
            <Button label="New post" compact onPress={() => router.push('/(tabs)/create')} />
          </Row>
          {posts.length ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyState
              title="No posts yet"
              body="Share your setup, a status update, or a screenshot from the Post tab."
              action={<Button label="Create first post" onPress={() => router.push('/(tabs)/create')} />}
            />
          )}
        </Stack>
      ) : null}

      {tab === 'setup' ? (
        <Stack gap={spacing.md}>
          <SetupCard profile={profile} />
          <Stack>
            <AppText variant="sectionTitle">Friends</AppText>
            {friends.length ? (
              friends.map((friend) => (
                <UserCard
                  key={friend.id}
                  profile={friend}
                  actionLabel="View"
                  onOpen={() => router.push(`/user/${friend.id}`)}
                  onAction={() => router.push(`/user/${friend.id}`)}
                />
              ))
            ) : (
              <AppText color={colors.textMuted}>
                No friends yet. Discover players to make this profile feel lived-in.
              </AppText>
            )}
          </Stack>
        </Stack>
      ) : null}

      {tab === 'communities' ? (
        <Stack gap={spacing.md}>
          <Row style={styles.sectionHeader}>
            <AppText variant="sectionTitle">Communities</AppText>
            <Button label="Discover" compact variant="secondary" onPress={() => router.push('/(tabs)/discover')} />
          </Row>
          {memberCommunities.length ? (
            memberCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onOpen={() => router.push(`/community/${community.id}`)}
                onJoin={() => void joinCommunity(community.id)}
                onLeave={() => void leaveCommunity(community.id)}
              />
            ))
          ) : (
            <EmptyState
              title="No communities yet"
              body="Join a place for your device, favorite frontend, or current handheld obsession."
              action={<Button label="Find communities" onPress={() => router.push('/(tabs)/discover')} />}
            />
          )}
        </Stack>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    alignItems: 'flex-start'
  },
  headerTitle: {
    flex: 1,
    minWidth: 0
  },
  stats: {
    flexWrap: 'wrap'
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
