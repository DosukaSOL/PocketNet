import { RadioTower, UserPlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, GlowCard, PressableScale, Row, Stack } from '@/components/ui';
import { DeviceBadge, FrontendBadge } from '@/components/device';
import { colors, spacing } from '@/design/tokens';
import { isDualScreenDevice } from '@/lib/devices';
import { isOnline } from '@/lib/presence';
import type { Profile } from '@/types/domain';

export function UserCard({
  profile,
  actionLabel = 'Add',
  actionDisabled = false,
  onAction,
  onOpen,
  secondaryAction
}: {
  profile: Profile;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  onOpen?: () => void;
  secondaryAction?: React.ReactNode;
}) {
  const dualScreen = isDualScreenDevice(profile.favoriteHandheld);
  return (
    <PressableScale onPress={onOpen}>
      <GlowCard tone={dualScreen ? 'focus' : 'cyan'} style={styles.card}>
        <Row style={styles.mainRow}>
          <Avatar
            label={profile.displayName}
            uri={profile.avatarUrl}
            status={isOnline(profile.lastSeenAt) ? 'online' : 'offline'}
            focus={dualScreen}
          />
          <Stack gap={spacing.xs} style={styles.meta}>
            <Stack gap={1}>
              <AppText variant="bodyStrong">{profile.displayName}</AppText>
              <AppText variant="metadata" color={colors.textMuted}>
                @{profile.username}
              </AppText>
            </Stack>
            <Row style={styles.badges}>
              {profile.favoriteHandheld ? <DeviceBadge deviceName={profile.favoriteHandheld} compact /> : null}
              <FrontendBadge frontend={profile.favoriteFrontend} compact />
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
            {onAction || actionDisabled ? (
              <Button
                label={actionLabel}
                icon={UserPlus}
                compact
                disabled={actionDisabled}
                variant={actionLabel === 'Add' ? 'primary' : 'secondary'}
                onPress={onAction}
              />
            ) : null}
            {secondaryAction}
          </View>
        </Row>
      </GlowCard>
    </PressableScale>
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
