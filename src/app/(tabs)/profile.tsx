import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { ProfileHeader } from '@/components/ProfileHeader';
import { AppText, Avatar, Badge, Button, Card, EmptyState, Row, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { colors, spacing } from '@/lib/theme';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const { getProfilePosts, getFriends } = usePocketData();

  if (!profile) {
    return (
      <Screen>
        <EmptyState title="No profile" body="Log in or enter preview mode to create your PocketNet profile." />
      </Screen>
    );
  }

  const posts = getProfilePosts(profile.id);
  const friends = getFriends();

  return (
    <Screen scroll>
      <Row style={styles.headerActions}>
        <View style={styles.headerTitle}>
          <AppText variant="heading">Profile</AppText>
          <AppText color={colors.textMuted}>Your public handheld identity.</AppText>
        </View>
        <Button label="Settings" icon={Settings} compact variant="secondary" onPress={() => router.push('/settings')} />
      </Row>

      <ProfileHeader
        profile={profile}
        isCurrentUser
        onEdit={() => router.push('/edit-profile')}
      />

      <Card>
        <Row style={styles.statRow}>
          <View>
            <AppText variant="title">{posts.length}</AppText>
            <AppText variant="small" color={colors.textMuted}>Posts</AppText>
          </View>
          <View>
            <AppText variant="title">{friends.length}</AppText>
            <AppText variant="small" color={colors.textMuted}>Friends</AppText>
          </View>
          <View>
            <AppText variant="title">{profile.favoriteSystems.length}</AppText>
            <AppText variant="small" color={colors.textMuted}>Systems</AppText>
          </View>
        </Row>
      </Card>

      <Card>
        <AppText variant="title">Friends</AppText>
        {friends.length ? (
          friends.map((friend) => (
            <Row key={friend.id}>
              <Avatar label={friend.displayName} uri={friend.avatarUrl} />
              <View style={styles.friendMeta}>
                <AppText>{friend.displayName}</AppText>
                <Row style={styles.friendBadges}>
                  {friend.favoriteHandheld ? <Badge label={friend.favoriteHandheld} tone="cyan" /> : null}
                  {friend.favoriteFrontend ? <Badge label={friend.favoriteFrontend} tone="blue" /> : null}
                </Row>
              </View>
            </Row>
          ))
        ) : (
          <AppText color={colors.textMuted}>No friends yet.</AppText>
        )}
      </Card>

      <AppText variant="title">Profile Posts</AppText>
      {posts.length ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <EmptyState title="No posts yet" body="Share your setup or current game from the Post tab." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    alignItems: 'flex-start'
  },
  headerTitle: {
    flex: 1,
    gap: spacing.xs
  },
  statRow: {
    justifyContent: 'space-around'
  },
  friendMeta: {
    flex: 1,
    gap: spacing.xs
  },
  friendBadges: {
    flexWrap: 'wrap'
  }
});
