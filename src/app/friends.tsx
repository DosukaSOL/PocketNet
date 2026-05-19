import { router } from 'expo-router';
import { ArrowLeft, MessageCircle, UserPlus, Users } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Avatar,
  Badge,
  Button,
  EmptyState,
  GlowCard,
  Row,
  Screen,
  Stack
} from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import { useMessaging } from '@/features/messaging/MessagingProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { isOnline, presenceLabel } from '@/lib/presence';

export default function FriendsScreen() {
  const { getFriends, getIncomingRequests, acceptFriendRequest, rejectFriendRequest, refresh, isLoading } = usePocketData();
  const { openThreadWith } = useMessaging();
  const friends = getFriends();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);
  const incoming = getIncomingRequests();
  const [opening, setOpening] = useState<string | null>(null);

  async function openDm(userId: string) {
    setOpening(userId);
    try {
      const threadId = await openThreadWith(userId);
      if (threadId) {
        router.push(`/messages/${threadId}` as never);
      }
    } finally {
      setOpening(null);
    }
  }

  return (
    <Screen scroll refreshing={refreshing || isLoading} onRefresh={() => void onRefresh()}>
      <Row style={styles.topActions}>
        <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />
      </Row>

      <GlowCard tone="purple">
        <Stack gap={spacing.xs}>
          <Badge label="Network" tone="purple" />
          <AppText variant="display">Friends</AppText>
          <AppText color={colors.textSecondary}>
            {friends.length
              ? `${friends.length} player${friends.length === 1 ? '' : 's'} in your circle.`
              : 'No friends yet — find players on Discover and send a request.'}
          </AppText>
        </Stack>
      </GlowCard>

      {incoming.length ? (
        <Stack gap={spacing.sm}>
          <AppText variant="title">Incoming requests</AppText>
          {incoming.map((request) => {
            const sender = friends.find((friend) => friend.id === request.fromUserId);
            return (
              <Row key={request.id} style={styles.row}>
                <Avatar uri={sender?.avatarUrl} size={44} label={sender?.displayName ?? request.fromUserId} />
                <Stack gap={2} style={{ flex: 1 }}>
                  <AppText variant="bodyStrong">{sender?.displayName ?? 'New player'}</AppText>
                  <AppText variant="metadata" color={colors.textMuted}>
                    Wants to connect
                  </AppText>
                </Stack>
                <Row style={{ gap: spacing.xs }}>
                  <Button
                    label="Accept"
                    compact
                    onPress={() => void acceptFriendRequest(request.id)}
                  />
                  <Button
                    label="Decline"
                    variant="ghost"
                    compact
                    onPress={() => void rejectFriendRequest(request.id)}
                  />
                </Row>
              </Row>
            );
          })}
        </Stack>
      ) : null}

      <Stack gap={spacing.sm}>
        <AppText variant="title">Your friends</AppText>
        {friends.length ? (
          friends.map((friend) => {
            const online = isOnline(friend.lastSeenAt);
            return (
              <Pressable
                key={friend.id}
                onPress={() => router.push(`/user/${friend.id}`)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
              >
                <View style={{ position: 'relative' }}>
                  <Avatar uri={friend.avatarUrl} size={48} label={friend.displayName} />
                  {online ? <View style={styles.onlineDot} /> : null}
                </View>
                <Stack gap={2} style={{ flex: 1 }}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {friend.displayName}
                  </AppText>
                  <AppText variant="metadata" color={online ? colors.success : colors.textMuted}>
                    {presenceLabel(friend.lastSeenAt)}
                  </AppText>
                </Stack>
                <Button
                  label="Message"
                  icon={MessageCircle}
                  compact
                  variant="secondary"
                  disabled={opening === friend.id}
                  onPress={() => void openDm(friend.id)}
                />
              </Pressable>
            );
          })
        ) : (
          <EmptyState
            title="No friends yet"
            body="Discover players, send a request, and they'll appear here when accepted."
            icon={Users}
            action={
              <Button
                label="Find players"
                icon={UserPlus}
                onPress={() => router.push('/(tabs)/discover')}
              />
            }
          />
        )}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topActions: {
    justifyContent: 'flex-start'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(13, 21, 36, 0.72)',
    borderWidth: 1,
    borderColor: colors.borderGlow
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background
  }
});
