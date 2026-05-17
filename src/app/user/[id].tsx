import { useLocalSearchParams, router } from 'expo-router';
import { Alert } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { ProfileHeader } from '@/components/ProfileHeader';
import { Button, EmptyState, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const {
    getProfile,
    getProfilePosts,
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    blockUser,
    report
  } = usePocketData();
  const target = getProfile(id);

  if (!target) {
    return (
      <Screen>
        <EmptyState title="Player not found" body="This profile may no longer be public." />
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const activeTarget = target;
  const posts = getProfilePosts(activeTarget.id);
  const friends = getFriends();
  const incoming = getIncomingRequests().find((request) => request.fromUserId === activeTarget.id);
  const outgoing = getOutgoingRequests().some((request) => request.toUserId === activeTarget.id);
  const isFriend = friends.some((friend) => friend.id === activeTarget.id);

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

  return (
    <Screen scroll>
      <Button label="Back" compact variant="ghost" onPress={() => router.back()} />
      <ProfileHeader
        profile={activeTarget}
        isCurrentUser={activeTarget.id === profile?.id}
        isFriend={isFriend}
        hasIncomingRequest={Boolean(incoming)}
        hasOutgoingRequest={outgoing}
        onFriend={() => void sendFriendRequest(activeTarget.id)}
        onAccept={() => incoming && void acceptFriendRequest(incoming.id)}
        onBlock={handleBlock}
        onReport={handleReport}
      />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Screen>
  );
}
