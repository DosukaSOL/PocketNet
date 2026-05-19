import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText, GlowCard, Row, Stack } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import { type BadgeDefinition, visibleBadges } from '@/lib/badges';

const TONE_TINT: Record<BadgeDefinition['tone'], string> = {
  cyan: colors.accentCyan,
  purple: colors.accentPurple,
  pink: colors.accentPink,
  focus: colors.focus,
  warning: colors.warning,
  lime: colors.success
};

export function ProfileBadgeStrip({ badges }: { badges?: string[] }) {
  const entries = visibleBadges(badges);
  const [open, setOpen] = useState<BadgeDefinition | null>(null);

  if (entries.length === 0) return null;

  return (
    <View>
      <Row style={styles.row}>
        {entries.map((badge) => (
          <Pressable
            key={badge.id}
            onPress={() => setOpen((prev) => (prev?.id === badge.id ? null : badge))}
            accessibilityRole="button"
            accessibilityLabel={`${badge.label} badge`}
            style={({ pressed }) => [
              styles.chip,
              { borderColor: `${TONE_TINT[badge.tone]}66`, backgroundColor: `${TONE_TINT[badge.tone]}1A` },
              pressed && { opacity: 0.7 }
            ]}
          >
            <AppText variant="metadata">{badge.emoji}</AppText>
          </Pressable>
        ))}
      </Row>
      {open ? (
        <View style={styles.tooltipWrap}>
          <GlowCard tone={open.tone === 'lime' || open.tone === 'warning' ? 'focus' : open.tone}>
            <Stack gap={spacing.xs}>
              <Row>
                <AppText variant="sectionTitle">{open.emoji} {open.label}</AppText>
              </Row>
              <AppText color={colors.textSecondary}>{open.description}</AppText>
              <AppText variant="caption" color={colors.textMuted}>How to earn: {open.howTo}</AppText>
            </Stack>
          </GlowCard>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  chip: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  tooltipWrap: {
    marginTop: spacing.xs
  }
});
