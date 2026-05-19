import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MessageCircle, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { ProfileHeader, type ProfileTab } from '@/components/ProfileHeader';
import { ProfileTabContent } from '@/components/social/ProfileTabContent';
import { Button, EmptyState, Row, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMessaging } from '@/features/messaging/MessagingProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { useRetroAchievements } from '@/hooks/useRetroAchievements';

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const {
    getProfile,
    getProfilePosts,
    getProfileReplies,
    getFriendsOf,
    getFollowersOf,
    getCommunitiesOf,
    getIncomingRequests,
    getOutgoingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    blockUser,
    report,
    joinCommunity,
    leaveCommunity,
    canViewProfile,
    isFollowing
  } = usePocketData();
  const { openThreadWith } = useMessaging();
  const [tab, setTab] = useState<ProfileTab>('posts');
  const [openingDm, setOpeningDm] = useState(false);
  const target = getProfile(id);
  const ra = useRetroAchievements(target?.raUsername);

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

  const isCurrentUser = target.id === profile?.id;
  const canView = canViewProfile(target.id);
  const posts = canView ? getProfilePosts(target.id) : [];
  const replies = canView ? getProfileReplies(target.id) : [];
  const friends = canView ? getFriendsOf(target.id) : [];
  const followers = canView ? getFollowersOf(target.id) : [];
  const memberCommunities = canView ? getCommunitiesOf(target.id) : [];
  const incoming = getIncomingRequests().find((request) => request.fromUserId === target.id);
  const outgoing = getOutgoingRequests().some((request) => request.toUserId === target.id);
  const myFriends = getFriendsOf(profile?.id ?? '');
  const isFriend = myFriends.some((friend) => friend.id === target.id);
  const isFollower = isFollowing(target.id);

  function handleReport() {
    Alert.alert('Report user', 'Send this profile to moderation review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => void report('user', target!.id, 'User report')
      }
    ]);
  }

  function handleBlock() {
    Alert.alert('Block user', 'This hides their content and removes social connections.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: () => void blockUser(target!.id) }
    ]);
  }

  async function handleMessage() {
    if (openingDm) return;
    setOpeningDm(true);
    try {
      const threadId = await openThreadWith(target!.id);
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
        {!isCurrentUser ? (
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
        profile={target}
        isCurrentUser={isCurrentUser}
        isFriend={isFriend}
        hasIncomingRequest={Boolean(incoming)}
        hasOutgoingRequest={outgoing}
        postCount={posts.length}
        replyCount={replies.length}
        friendCount={friends.length}
        followerCount={followers.length}
        communityCount={memberCommunities.length}
        achievementCount={ra.achievements.length}
        achievementPoints={ra.points}
        activeTab={tab}
        onTabChange={setTab}
        onFriend={() => void sendFriendRequest(target.id)}
        onAccept={() => incoming && void acceptFriendRequest(incoming.id)}
        onBlock={handleBlock}
        onReport={handleReport}
      />
      <ProfileTabContent
        profile={target}
        activeTab={tab}
        isCurrentUser={isCurrentUser}
        posts={posts}
        replies={replies}
        friends={friends}
        followers={followers}
        communities={memberCommunities}
        canView={canView}
        isFriend={isFriend}
        isFollower={isFollower}
        onJoinCommunity={(id) => void joinCommunity(id)}
        onLeaveCommunity={(id) => void leaveCommunity(id)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topActions: {
    justifyContent: 'space-between'
  }
});
