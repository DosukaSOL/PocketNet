import { router, useFocusEffect } from 'expo-router';
import { MessageCircle, UserPlus } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

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
import { useAuth } from '@/features/auth/AuthProvider';
import { useMessaging } from '@/features/messaging/MessagingProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { isOnline } from '@/lib/presence';

export default function MessagesTab() {
  const { profile } = useAuth();
  const { threads, refreshThreads, isLoading } = useMessaging();
  const { getProfile } = usePocketData();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshThreads();
    }, [refreshThreads])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshThreads();
    } finally {
      setRefreshing(false);
    }
  }, [refreshThreads]);

  const enriched = useMemo(() => {
    if (!profile) return [];
    return threads.map((thread) => {
      const otherId = thread.participantAId === profile.id ? thread.participantBId : thread.participantAId;
      const other = getProfile(otherId);
      return { thread, other };
    });
  }, [getProfile, profile, threads]);

  return (
    <Screen scroll refreshing={refreshing || isLoading} onRefresh={() => void onRefresh()}>
      <Stack gap={spacing.lg}>
        <GlowCard tone="cyan">
          <Stack gap={spacing.xs}>
            <Badge label="Private" tone="cyan" />
            <AppText variant="display">Direct messages</AppText>
            <AppText color={colors.textSecondary}>
              End-to-end private threads with the players you follow. Only the two of you can read these.
            </AppText>
            <Row style={{ marginTop: spacing.sm, gap: spacing.sm }}>
              <Button
                label="Find a friend"
                icon={UserPlus}
                variant="secondary"
                compact
                onPress={() => router.push('/friends' as never)}
              />
            </Row>
          </Stack>
        </GlowCard>

        {enriched.length ? (
          <FlatList
            data={enriched}
            keyExtractor={(item) => item.thread.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            renderItem={({ item }) => {
              const { thread, other } = item;
              const online = isOnline(other?.lastSeenAt);
              const last = thread.lastMessage;
              const preview = last ? last.body : 'Say hi 👋';
              return (
                <Pressable
                  onPress={() => router.push(`/messages/${thread.id}` as never)}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                >
                  <View style={{ position: 'relative' }}>
                    <Avatar uri={other?.avatarUrl} size={48} label={other?.displayName ?? '?'} />
                    {online ? <View style={styles.onlineDot} /> : null}
                  </View>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <AppText variant="body" style={{ fontWeight: '800' }} numberOfLines={1}>
                        {other?.displayName ?? 'PocketNet player'}
                      </AppText>
                      {thread.unreadCount > 0 ? (
                        <View style={styles.badge}>
                          <AppText variant="tiny" style={{ color: colors.textPrimary, fontWeight: '900' }}>
                            {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                          </AppText>
                        </View>
                      ) : null}
                    </Row>
                    <AppText
                      variant="caption"
                      color={thread.unreadCount > 0 ? colors.textPrimary : colors.textSecondary}
                      numberOfLines={1}
                    >
                      {preview}
                    </AppText>
                  </Stack>
                </Pressable>
              );
            }}
          />
        ) : (
          <EmptyState
            title="No conversations yet"
            body="Find a player on Discover or open your friends list to start a private chat."
            icon={MessageCircle}
            action={<Button label="Open friends" onPress={() => router.push('/friends' as never)} />}
          />
        )}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.accentPink,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
