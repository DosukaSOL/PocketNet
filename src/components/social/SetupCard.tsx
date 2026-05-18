import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, GlowCard, Row, Stack } from '@/components/ui';
import { DeviceBadge, FrontendBadge } from '@/components/device';
import { colors, radius, spacing } from '@/design/tokens';
import { isDualScreenDevice } from '@/lib/devices';
import type { Profile } from '@/types/domain';

export function SetupCard({ profile, compact = false }: { profile: Profile; compact?: boolean }) {
  const dualScreen = isDualScreenDevice(profile.favoriteHandheld);
  return (
    <GlowCard tone={dualScreen ? 'focus' : 'purple'} style={compact ? styles.compact : undefined}>
      <Row style={styles.header}>
        <View style={styles.iconBox}>
          <Sparkles color={colors.accentCyan} size={20} />
        </View>
        <Stack gap={2} style={styles.headerText}>
          <AppText variant="cardTitle">PocketCard</AppText>
          <AppText variant="metadata" color={colors.textMuted}>
            {`${profile.displayName}'s handheld setup`}
          </AppText>
        </Stack>
      </Row>

      <Row style={styles.badges}>
        {profile.favoriteHandheld ? <DeviceBadge deviceName={profile.favoriteHandheld} /> : null}
        <FrontendBadge frontend={profile.favoriteFrontend} />
      </Row>

      {profile.setupNotes ? (
        <AppText color={colors.textSecondary}>{profile.setupNotes}</AppText>
      ) : (
        <AppText color={colors.textMuted}>No setup notes yet.</AppText>
      )}

      <Row style={styles.badges}>
        {profile.favoriteSystems.slice(0, compact ? 3 : 6).map((system) => (
          <Badge key={system} label={system} tone="neutral" compact />
        ))}
      </Row>
    </GlowCard>
  );
}

const styles = StyleSheet.create({
  compact: {
    padding: spacing.sm
  },
  header: {
    alignItems: 'center'
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: `${colors.accentCyan}18`,
    borderWidth: 1,
    borderColor: `${colors.accentCyan}55`,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    flex: 1
  },
  badges: {
    flexWrap: 'wrap'
  }
});
