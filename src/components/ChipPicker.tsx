import { StyleSheet, Text, View } from 'react-native';

import { PressableScale, TextField } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';

type OtherProps =
  | { allowOther?: false; otherValue?: undefined; onOtherChange?: undefined; otherPlaceholder?: undefined }
  | {
      allowOther: true;
      otherValue: string;
      onOtherChange: (next: string) => void;
      otherPlaceholder?: string;
    };

type ChipPickerProps = {
  options: string[];
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multi?: boolean;
} & OtherProps;

export function ChipPicker({
  options,
  value,
  onChange,
  multi = false,
  allowOther,
  otherValue,
  onOtherChange,
  otherPlaceholder
}: ChipPickerProps) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const otherSelected = allowOther && values.includes('Other');

  return (
    <View style={styles.column}>
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
      {otherSelected ? (
        <TextField
          label="Type your own"
          value={otherValue ?? ''}
          onChangeText={(next) => onOtherChange?.(next)}
          placeholder={otherPlaceholder ?? 'Tell us what you actually use'}
          autoCapitalize="words"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: spacing.sm
  },
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
