import { AtSign, Award, Bell, CheckCircle2, Heart, MessageCircle, MessageSquare, ShieldAlert, Sparkles, UserPlus, Users } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, Card, Row, Stack } from '@/components/ui';
import { colors, spacing } from '@/design/tokens';
import { usePocketData } from '@/features/social/SocialProvider';
import type { Notification } from '@/types/domain';

const iconByType: Partial<Record<Notification['type'], typeof Bell>> = {
  friend_request: UserPlus,
  friend_accept: CheckCircle2,
  follow: Heart,
  post_like: Heart,
  post_comment: MessageCircle,
  comment_reply: MessageSquare,
  mention: AtSign,
  community_join: Users,
  achievement: Award,
  level_up: Sparkles,
  moderation: ShieldAlert
};

export function NotificationCard({
  notification,
  onPrimary
}: {
  notification: Notification;
  onPrimary?: () => void;
}) {
  const { getProfile } = usePocketData();
  const actor = getProfile(notification.actorId);
  const Icon = iconByType[notification.type] ?? Bell;
  const unread = !notification.readAt;

  return (
    <Card style={[styles.card, unread && styles.unread]}>
      <Row>
        <View style={[styles.iconWrap, unread && styles.iconUnread]}>
          <Icon color={unread ? colors.accentCyan : colors.textSecondary} size={18} />
        </View>
        <Stack gap={2} style={styles.copy}>
          <AppText variant="cardTitle">{notification.title}</AppText>
          <AppText color={colors.textSecondary}>{notification.body}</AppText>
        </Stack>
        {actor ? <Avatar label={actor.displayName} uri={actor.avatarUrl} size={40} status="online" /> : null}
      </Row>
      {notification.type === 'friend_request' && onPrimary ? (
        <Button label="Review request" compact variant="secondary" onPress={onPrimary} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm
  },
  unread: {
    borderColor: `${colors.accentCyan}66`
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border
  },
  iconUnread: {
    backgroundColor: `${colors.accentCyan}14`,
    borderColor: `${colors.accentCyan}55`
  },
  copy: {
    flex: 1
  }
});
