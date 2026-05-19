import { Switch, View } from 'react-native';

import { AppText, GlowCard, Row, Stack } from '@/components/ui';
import { colors, spacing } from '@/design/tokens';
import {
  type NotificationPrefKey,
  useNotificationPreferences
} from '@/hooks/useNotificationPreferences';

const TOGGLES: { key: NotificationPrefKey; label: string; helper: string }[] = [
  { key: 'notify_posts', label: 'Posts', helper: 'When they share something new' },
  { key: 'notify_achievements', label: 'Achievements', helper: 'New RetroAchievements trophies' },
  { key: 'notify_comments', label: 'Comments', helper: 'When they reply to others' },
  { key: 'notify_friends', label: 'New friends', helper: 'When they connect with someone new' }
];

export function NotificationPreferencesCard({
  targetId,
  targetName
}: {
  targetId: string | undefined;
  targetName?: string;
}) {
  const { prefs, setPref } = useNotificationPreferences(targetId);

  if (!targetId) return null;

  return (
    <GlowCard tone="purple">
      <Stack gap={spacing.sm}>
        <Stack gap={2}>
          <AppText variant="sectionTitle">Notifications</AppText>
          <AppText color={colors.textSecondary}>
            {targetName ? `Pick what you want pings for from ${targetName}.` : 'Pick what you want pings for.'}
          </AppText>
        </Stack>
        <View>
          {TOGGLES.map((toggle) => (
            <Row key={toggle.key} style={{ justifyContent: 'space-between', paddingVertical: spacing.xs }}>
              <Stack gap={2} style={{ flex: 1, paddingRight: spacing.sm }}>
                <AppText>{toggle.label}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {toggle.helper}
                </AppText>
              </Stack>
              <Switch
                value={prefs[toggle.key]}
                onValueChange={(v) => void setPref(toggle.key, v)}
                trackColor={{ false: colors.surfaceStrong, true: colors.accentPurple }}
                thumbColor={prefs[toggle.key] ? '#F3E8FF' : '#94A3B8'}
              />
            </Row>
          ))}
        </View>
      </Stack>
    </GlowCard>
  );
}
