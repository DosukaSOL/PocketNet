import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';

export function ChipPicker({
  options,
  value,
  onChange,
  multi = false
}: {
  options: string[];
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multi?: boolean;
}) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = values.includes(option);
        return (
          <PressableScale
            key={option}
            accessibilityRole="button"
            onPress={() => {
              if (multi) {
                onChange(active ? values.filter((item) => item !== option) : [...values, option]);
              } else {
                onChange(option);
              }
            }}
            style={[styles.chip, active && styles.activeChip]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{option}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  chip: {
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeChip: {
    borderColor: `${colors.accentCyan}AA`,
    backgroundColor: `${colors.accentCyan}18`
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900'
  },
  activeLabel: {
    color: colors.accentCyan
  }
});
