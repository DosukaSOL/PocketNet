import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';

export function xpToLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(xp, 0) / 50)) + 1);
}

export function xpForLevel(level: number): number {
  const l = Math.max(1, level);
  return Math.pow(l - 1, 2) * 50;
}

export function xpProgress(xp: number): { level: number; current: number; next: number; pct: number } {
  const level = xpToLevel(xp);
  const current = xp - xpForLevel(level);
  const span = xpForLevel(level + 1) - xpForLevel(level);
  return {
    level,
    current,
    next: span,
    pct: Math.max(0, Math.min(1, span > 0 ? current / span : 0))
  };
}

export function LevelChip({ level }: { level: number }) {
  return (
    <View style={styles.chip}>
      <Sparkles size={11} color={colors.warning} />
      <AppText variant="metadata" color={colors.warning}>
        Lv {level}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: `${colors.warning}66`,
    backgroundColor: `${colors.warning}18`
  }
});
