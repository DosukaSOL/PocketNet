import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/design/tokens';

export function ModalSheet({ children }: PropsWithChildren) {
  return <View style={styles.sheet}>{children}</View>;
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card
  }
});
