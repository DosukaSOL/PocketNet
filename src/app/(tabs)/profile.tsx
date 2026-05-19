import { router } from 'expo-router';
import { Settings, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { ProfileHeader, type ProfileTab } from '@/components/ProfileHeader';
import { ProfileTabContent } from '@/components/social/ProfileTabContent';
import { AppText, Button, EmptyState, Row, Screen, Stack } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRetroAchievements } from '@/hooks/useRetroAchievements';
import { usePocketData } from '@/features/social/SocialProvider';
import { colors } from '@/design/tokens';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const {
    getProfilePosts,
    getProfileReplies,
    getFriendsOf,
    getFollowersOf,
    getCommunitiesOf,
    joinCommunity,
    leaveCommunity
  } = usePocketData();
  const [tab, setTab] = useState<ProfileTab>('posts');
  const ra = useRetroAchievements(profile?.raUsername);

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
  const replies = getProfileReplies(profile.id);
  const friends = getFriendsOf(profile.id);
  const followers = getFollowersOf(profile.id);
  const memberCommunities = getCommunitiesOf(profile.id);

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

      <ProfileHeader
        profile={profile}
        isCurrentUser
        postCount={posts.length}
        replyCount={replies.length}
        friendCount={friends.length}
        followerCount={followers.length}
        communityCount={memberCommunities.length}
        achievementCount={ra.achievements.length}
        achievementPoints={ra.points}
        activeTab={tab}
        onTabChange={setTab}
        onEdit={() => router.push('/edit-profile')}
      />

      <ProfileTabContent
        profile={profile}
        activeTab={tab}
        isCurrentUser
        posts={posts}
        replies={replies}
        friends={friends}
        followers={followers}
        communities={memberCommunities}
        canView
        isFriend
        isFollower
        onJoinCommunity={(id) => void joinCommunity(id)}
        onLeaveCommunity={(id) => void leaveCommunity(id)}
      />
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
  }
});
