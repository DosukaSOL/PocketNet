import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Bell, Compass, RefreshCw, Sparkles, UserX } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { NotificationCard } from '@/components/social/NotificationCard';
import { UserCard } from '@/components/social/UserCard';
import { AppText, Badge, Button, Card, EmptyState, Row, Screen, Skeleton, Stack, StatPill } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { colors, gradients, radius, spacing } from '@/design/tokens';

export default function HomeScreen() {
  const { profile } = useAuth();
  const {
    getHomeFeed,
    getProfile,
    getIncomingRequests,
    getFriends,
    acceptFriendRequest,
    rejectFriendRequest,
    notifications,
    markNotificationsRead,
    refresh,
    isLoading
  } = usePocketData();
  const feed = getHomeFeed();
  const requests = getIncomingRequests();
  const friends = getFriends();
  const unread = notifications.filter((notification) => !notification.readAt);
  const activeFriends = useMemo(
    () => friends.filter((friend) => friend.currentGame || friend.currentStatus).slice(0, 3),
    [friends]
  );

  return (
    <Screen scroll refreshing={isLoading} onRefresh={() => void refresh()}>
      <Card gradient="pocket" elevated style={styles.hero}>
        <LinearGradient colors={gradients.aurora} style={styles.heroGlow} />
        <Row style={styles.heroTop}>
          <Stack gap={spacing.xs} style={styles.heroCopy}>
            <Badge label="PocketNet beta" tone="cyan" icon={Sparkles} />
            <AppText variant="display">Your handheld social layer</AppText>
            <AppText color={colors.textSecondary}>
              Setups, screenshots, friends, and communities built for Android gaming handhelds.
            </AppText>
          </Stack>
          <Button label="Sync" icon={RefreshCw} compact variant="secondary" onPress={() => void refresh()} />
        </Row>
        <Row style={styles.stats}>
          <StatPill label="Feed" value={feed.length} />
          <StatPill label="Friends" value={friends.length} />
          <StatPill label="Unread" value={unread.length} />
        </Row>
      </Card>

      {unread.length ? (
        <Stack gap={spacing.sm}>
          <Row style={styles.sectionHeader}>
            <Row>
              <Bell color={colors.warning} size={18} />
              <AppText variant="sectionTitle">Notifications</AppText>
            </Row>
            <Button label="Mark read" compact variant="ghost" onPress={() => void markNotificationsRead()} />
          </Row>
          {unread.slice(0, 3).map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </Stack>
      ) : null}

      {requests.length ? (
        <Stack gap={spacing.sm}>
          <AppText variant="sectionTitle">Friend Requests</AppText>
          {requests.map((request) => {
            const from = getProfile(request.fromUserId);
            return from ? (
              <UserCard
                key={request.id}
                profile={from}
                actionLabel="Accept"
                onOpen={() => router.push(`/user/${from.id}`)}
                onAction={() => void acceptFriendRequest(request.id)}
                secondaryAction={
                  <Button
                    label="Reject"
                    icon={UserX}
                    compact
                    variant="ghost"
                    onPress={() => void rejectFriendRequest(request.id)}
                  />
                }
              />
            ) : null;
          })}
        </Stack>
      ) : null}

      {activeFriends.length ? (
        <Stack gap={spacing.sm}>
          <Row style={styles.sectionHeader}>
            <AppText variant="sectionTitle">Now Playing</AppText>
            <Badge label="Live manual status" tone="lime" />
          </Row>
          {activeFriends.map((friend) => (
            <UserCard
              key={friend.id}
              profile={friend}
              actionLabel="View"
              onOpen={() => router.push(`/user/${friend.id}`)}
              onAction={() => router.push(`/user/${friend.id}`)}
            />
          ))}
        </Stack>
      ) : null}

      <Row style={styles.sectionHeader}>
        <Stack gap={2}>
          <AppText variant="sectionTitle">Home Feed</AppText>
          <AppText variant="metadata" color={colors.textMuted}>
            Friends and joined communities, newest first.
          </AppText>
        </Stack>
        <Button label="Post" compact onPress={() => router.push('/(tabs)/create')} />
      </Row>

      {isLoading && !feed.length ? (
        <Stack>
          {[0, 1, 2].map((item) => (
            <Card key={item}>
              <Row>
                <Skeleton width={50} height={50} radius={25} />
                <Stack gap={spacing.xs} style={styles.skeletonCopy}>
                  <Skeleton width="48%" height={16} />
                  <Skeleton width="30%" height={12} />
                </Stack>
              </Row>
              <Skeleton height={88} radius={radius.lg} />
            </Card>
          ))}
        </Stack>
      ) : feed.length ? (
        feed.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <EmptyState
          title={profile ? 'Your feed is waiting for a first spark' : 'PocketNet is ready when you are'}
          body="Add friends, join communities, or share a setup note to turn this into your handheld activity stream."
          icon={Compass}
          action={
            <Row style={styles.emptyActions}>
              <Button label="Discover" variant="secondary" onPress={() => router.push('/(tabs)/discover')} />
              <Button label="Create post" onPress={() => router.push('/(tabs)/create')} />
            </Row>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 220,
    position: 'relative'
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.card
  },
  heroTop: {
    alignItems: 'flex-start'
  },
  heroCopy: {
    flex: 1,
    minWidth: 0
  },
  stats: {
    marginTop: spacing.sm
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  skeletonCopy: {
    flex: 1
  },
  emptyActions: {
    flexWrap: 'wrap'
  }
});
