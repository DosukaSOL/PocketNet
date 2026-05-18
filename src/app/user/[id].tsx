import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MessageCircle, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { CommunityCard } from '@/components/CommunityCard';
import { PostCard } from '@/components/PostCard';
import { ProfileHeader, type ProfileTab } from '@/components/ProfileHeader';
import { SetupCard } from '@/components/social/SetupCard';
import { Button, EmptyState, Row, Screen, Stack } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMessaging } from '@/features/messaging/MessagingProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { spacing } from '@/design/tokens';

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const {
    communities,
    getProfile,
    getProfilePosts,
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    blockUser,
    report,
    joinCommunity,
    leaveCommunity
  } = usePocketData();
  const { openThreadWith } = useMessaging();
  const [tab, setTab] = useState<ProfileTab>('posts');
  const [openingDm, setOpeningDm] = useState(false);
  const target = getProfile(id);

  if (!target) {
    return (
      <Screen>
        <EmptyState
          title="Player not found"
          body="This profile may no longer be public."
          icon={UserRound}
          action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const activeTarget = target;
  const posts = getProfilePosts(activeTarget.id);
  const friends = getFriends();
  const incoming = getIncomingRequests().find((request) => request.fromUserId === activeTarget.id);
  const outgoing = getOutgoingRequests().some((request) => request.toUserId === activeTarget.id);
  const isFriend = friends.some((friend) => friend.id === activeTarget.id);
  const memberCommunities = communities.filter((community) => community.memberIds.includes(activeTarget.id));

  function handleReport() {
    Alert.alert('Report user', 'Send this profile to moderation review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => void report('user', activeTarget.id, 'User report')
      }
    ]);
  }

  function handleBlock() {
    Alert.alert('Block user', 'This hides their content and removes social connections.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: () => void blockUser(activeTarget.id) }
    ]);
  }

  async function handleMessage() {
    if (openingDm) return;
    setOpeningDm(true);
    try {
      const threadId = await openThreadWith(activeTarget.id);
      if (threadId) {
        router.push(`/messages/${threadId}` as never);
      } else {
        Alert.alert('Could not open chat', 'Try again in a moment.');
      }
    } catch (error) {
      Alert.alert('Could not open chat', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setOpeningDm(false);
    }
  }

  return (
    <Screen scroll>
      <Row style={styles.topActions}>
        <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />
        {activeTarget.id !== profile?.id ? (
          <Button
            label="Message"
            icon={MessageCircle}
            compact
            variant="secondary"
            onPress={() => void handleMessage()}
            loading={openingDm}
          />
        ) : null}
      </Row>
      <ProfileHeader
        profile={activeTarget}
        isCurrentUser={activeTarget.id === profile?.id}
        isFriend={isFriend}
        hasIncomingRequest={Boolean(incoming)}
        hasOutgoingRequest={outgoing}
        postCount={posts.length}
        friendCount={isFriend ? friends.length : 0}
        communityCount={memberCommunities.length}
        activeTab={tab}
        onTabChange={setTab}
        onFriend={() => void sendFriendRequest(activeTarget.id)}
        onAccept={() => incoming && void acceptFriendRequest(incoming.id)}
        onBlock={handleBlock}
        onReport={handleReport}
      />

      {tab === 'posts' ? (
        posts.length ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <EmptyState
            title="No public posts yet"
            body={`${activeTarget.displayName} has not shared a PocketNet update yet.`}
            icon={MessageCircle}
          />
        )
      ) : null}

      {tab === 'setup' ? <SetupCard profile={activeTarget} /> : null}

      {tab === 'communities' ? (
        <Stack gap={spacing.md}>
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
              title="No communities shown"
              body="This player has not joined any public PocketNet communities yet."
            />
          )}
        </Stack>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topActions: {
    justifyContent: 'space-between'
  }
});
