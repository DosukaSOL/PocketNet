import { Gamepad2, MonitorSmartphone, RadioTower, UserPlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Button, Card, Row, Stack } from '@/components/ui';
import { colors, spacing } from '@/design/tokens';
import type { Profile } from '@/types/domain';

export function UserCard({
  profile,
  actionLabel = 'Add',
  onAction,
  onOpen,
  secondaryAction
}: {
  profile: Profile;
  actionLabel?: string;
  onAction?: () => void;
  onOpen?: () => void;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <Card pressable onPress={onOpen} style={styles.card}>
      <Row style={styles.mainRow}>
        <Avatar
          label={profile.displayName}
          uri={profile.avatarUrl}
          status={profile.currentGame ? 'online' : 'offline'}
          thor={profile.isThorUser}
        />
        <Stack gap={spacing.xs} style={styles.meta}>
          <Stack gap={1}>
            <AppText variant="bodyStrong">{profile.displayName}</AppText>
            <AppText variant="metadata" color={colors.textMuted}>
              @{profile.username}
            </AppText>
          </Stack>
          <Row style={styles.badges}>
            {profile.favoriteHandheld ? (
              <Badge label={profile.favoriteHandheld} tone={profile.isThorUser ? 'thor' : 'cyan'} icon={Gamepad2} compact />
            ) : null}
            {profile.favoriteFrontend ? (
              <Badge label={profile.favoriteFrontend} tone="purple" icon={MonitorSmartphone} compact />
            ) : null}
          </Row>
          {profile.currentGame || profile.currentStatus ? (
            <Row>
              <RadioTower color={colors.online} size={13} />
              <AppText variant="metadata" color={colors.textSecondary} numberOfLines={1}>
                {profile.currentGame ? `Playing ${profile.currentGame}` : profile.currentStatus}
              </AppText>
            </Row>
          ) : null}
        </Stack>
        <View style={styles.actions}>
          {onAction ? (
            <Button label={actionLabel} icon={UserPlus} compact variant={actionLabel === 'Add' ? 'primary' : 'secondary'} onPress={onAction} />
          ) : null}
          {secondaryAction}
        </View>
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm
  },
  mainRow: {
    alignItems: 'center'
  },
  meta: {
    flex: 1,
    minWidth: 0
  },
  badges: {
    flexWrap: 'wrap'
  },
  actions: {
    gap: spacing.xs,
    alignItems: 'flex-end'
  }
});
