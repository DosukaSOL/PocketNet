import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import { AppText, GlowCard, Row, Stack } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import { type BadgeDefinition, visibleBadges } from '@/lib/badges';

const TONE_TINT: Record<BadgeDefinition['tone'], string> = {
  cyan: colors.accentCyan,
  purple: colors.accentPurple,
  pink: colors.accentPink,
  focus: colors.focus,
  warning: colors.warning,
  lime: colors.success,
  // DEV badge uses a vivid violet that pairs with the pulsing glow below.
  dev: '#A855F7'
};

function GlowingDevBadge({
  badge,
  onPress,
  tint
}: {
  badge: BadgeDefinition;
  onPress: () => void;
  tint: string;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, useNativeDriver: false })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const shadowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.95] });
  const shadowRadius = pulse.interpolate({ inputRange: [0, 1], outputRange: [6, 14] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${badge.label} badge`}
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
    >
      <Animated.View
        style={[
          styles.chip,
          styles.devChip,
          {
            borderColor: tint,
            backgroundColor: `${tint}33`,
            shadowColor: tint,
            shadowOpacity,
            shadowRadius,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
            transform: [{ scale }]
          }
        ]}
      >
        <AppText variant="metadata" style={styles.devEmoji}>{badge.emoji}</AppText>
        <AppText variant="caption" style={styles.devLabel}>DEV</AppText>
      </Animated.View>
    </Pressable>
  );
}

export function ProfileBadgeStrip({ badges }: { badges?: string[] }) {
  const entries = visibleBadges(badges);
  const [open, setOpen] = useState<BadgeDefinition | null>(null);

  if (entries.length === 0) return null;

  return (
    <View>
      <Row style={styles.row}>
        {entries.map((badge) => {
          if (badge.glow) {
            return (
              <GlowingDevBadge
                key={badge.id}
                badge={badge}
                tint={TONE_TINT[badge.tone]}
                onPress={() => setOpen((prev) => (prev?.id === badge.id ? null : badge))}
              />
            );
          }
          return (
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
          );
        })}
      </Row>
      {open ? (
        <View style={styles.tooltipWrap}>
          <GlowCard tone={open.tone === 'lime' || open.tone === 'warning' || open.tone === 'dev' ? 'purple' : open.tone}>
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
  devChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1.5
  },
  devEmoji: {
    fontSize: 14
  },
  devLabel: {
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#F3E8FF'
  },
  tooltipWrap: {
    marginTop: spacing.xs
  }
});
