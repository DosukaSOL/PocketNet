import { router } from 'expo-router';
import { ArrowLeft, BellOff, CheckCheck } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { NotificationCard } from '@/components/social/NotificationCard';
import { AppText, Badge, Button, EmptyState, GlowCard, Row, Screen, Stack } from '@/components/ui';
import { colors, spacing } from '@/design/tokens';
import { usePocketData } from '@/features/social/SocialProvider';

export default function NotificationsScreen() {
  const { notifications, markNotificationsRead } = usePocketData();
  const sorted = [...notifications].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  const unreadCount = sorted.filter((notification) => !notification.readAt).length;

  return (
    <Screen scroll>
      <Row style={styles.topActions}>
        <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />
        {unreadCount ? (
          <Button
            label="Mark all read"
            icon={CheckCheck}
            compact
            variant="secondary"
            onPress={() => void markNotificationsRead()}
          />
        ) : null}
      </Row>

      <GlowCard tone="cyan">
        <Stack gap={spacing.xs}>
          <Badge label="Activity" tone="cyan" />
          <AppText variant="display">Notifications</AppText>
          <AppText color={colors.textSecondary}>
            Friend pings, post reactions, community moves, and moderation updates.
          </AppText>
        </Stack>
      </GlowCard>

      {sorted.length ? (
        <Stack gap={spacing.sm}>
          {sorted.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </Stack>
      ) : (
        <EmptyState
          title="No notifications yet"
          body="Friend requests, likes, and comments will show up here as your PocketNet circle wakes up."
          icon={BellOff}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topActions: {
    justifyContent: 'space-between'
  }
});
