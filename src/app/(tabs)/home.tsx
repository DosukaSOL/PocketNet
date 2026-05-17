import { router } from 'expo-router';
import { Bell, RefreshCw, UserCheck, UserX } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { AppText, Avatar, Badge, Button, Card, EmptyState, Row, Screen } from '@/components/ui';
import { usePocketData } from '@/features/social/SocialProvider';
import { colors, spacing } from '@/lib/theme';

export default function HomeScreen() {
  const {
    getHomeFeed,
    getProfile,
    getIncomingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    notifications,
    markNotificationsRead,
    refresh
  } = usePocketData();
  const feed = getHomeFeed();
  const requests = getIncomingRequests();
  const unread = notifications.filter((notification) => !notification.readAt);

  return (
    <Screen scroll>
      <Row style={styles.top}>
        <View style={styles.titleBlock}>
          <AppText variant="heading">PocketNet</AppText>
          <AppText color={colors.textMuted}>Friends, setups, screenshots, and handheld communities.</AppText>
        </View>
        <Button label="Sync" icon={RefreshCw} compact variant="secondary" onPress={() => void refresh()} />
      </Row>

      {unread.length ? (
        <Card>
          <Row>
            <Bell color={colors.yellow} size={20} />
            <AppText variant="title">{unread.length} notification{unread.length === 1 ? '' : 's'}</AppText>
          </Row>
          {unread.slice(0, 2).map((notification) => (
            <AppText key={notification.id} color={colors.textMuted}>{notification.body}</AppText>
          ))}
          <Button label="Mark read" compact variant="secondary" onPress={() => void markNotificationsRead()} />
        </Card>
      ) : null}

      {requests.length ? (
        <Card>
          <AppText variant="title">Friend Requests</AppText>
          {requests.map((request) => {
            const from = getProfile(request.fromUserId);
            return (
              <Row key={request.id} style={styles.requestRow}>
                <Avatar label={from?.displayName ?? 'Player'} uri={from?.avatarUrl} />
                <View style={styles.requestText}>
                  <AppText>{from?.displayName ?? 'PocketNet user'}</AppText>
                  <AppText variant="small" color={colors.textMuted}>@{from?.username ?? 'unknown'}</AppText>
                </View>
                <Button label="Accept" icon={UserCheck} compact onPress={() => void acceptFriendRequest(request.id)} />
                <Button label="Reject" icon={UserX} compact variant="ghost" onPress={() => void rejectFriendRequest(request.id)} />
              </Row>
            );
          })}
        </Card>
      ) : null}

      <Row style={styles.feedHeader}>
        <AppText variant="title">Home Feed</AppText>
        <Badge label={`${feed.length} posts`} tone="neutral" />
      </Row>

      {feed.length ? (
        feed.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <EmptyState
          title="Your feed is quiet"
          body="Add friends, join communities, or post a setup update to wake it up."
          action={<Button label="Discover" variant="secondary" onPress={() => router.push('/(tabs)/discover')} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'flex-start'
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs
  },
  requestRow: {
    flexWrap: 'wrap'
  },
  requestText: {
    flex: 1,
    minWidth: 120
  },
  feedHeader: {
    justifyContent: 'space-between'
  }
});
