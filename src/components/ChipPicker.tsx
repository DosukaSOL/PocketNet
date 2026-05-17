import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/lib/theme';

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
          <Pressable
            key={option}
            accessibilityRole={multi ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: active }}
            onPress={() => {
              if (multi) {
                onChange(active ? values.filter((item) => item !== option) : [...values, option]);
              } else {
                onChange(option);
              }
            }}
            style={({ pressed }) => [
              styles.chip,
              active && styles.activeChip,
              pressed && styles.pressed
            ]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{option}</Text>
          </Pressable>
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
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeChip: {
    borderColor: colors.cyan,
    backgroundColor: `${colors.cyan}18`
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800'
  },
  activeLabel: {
    color: colors.cyan
  },
  pressed: {
    opacity: 0.72
  }
});
