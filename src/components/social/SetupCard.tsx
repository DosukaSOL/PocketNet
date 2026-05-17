import { Gamepad2, MonitorSmartphone, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, Row, Stack } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import type { Profile } from '@/types/domain';

export function SetupCard({ profile, compact = false }: { profile: Profile; compact?: boolean }) {
  return (
    <Card gradient="pocket" style={compact ? styles.compact : undefined}>
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
        {profile.favoriteHandheld ? (
          <Badge label={profile.favoriteHandheld} tone={profile.isThorUser ? 'thor' : 'cyan'} icon={Gamepad2} />
        ) : null}
        {profile.favoriteFrontend ? (
          <Badge label={profile.favoriteFrontend} tone="purple" icon={MonitorSmartphone} />
        ) : null}
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
    </Card>
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
