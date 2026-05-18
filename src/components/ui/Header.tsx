import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/design/tokens';

import { AppText, Row, Stack } from './index';

export function Header({
  eyebrow,
  title,
  body,
  action
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <Row style={styles.wrap}>
      <Stack gap={spacing.xs} style={styles.copy}>
        {eyebrow ? <AppText variant="metadata" color={colors.textMuted}>{eyebrow}</AppText> : null}
        <AppText variant="screenTitle">{title}</AppText>
        {body ? <AppText color={colors.textSecondary}>{body}</AppText> : null}
      </Stack>
      {action}
    </Row>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start'
  },
  copy: {
    flex: 1,
    minWidth: 0
  }
});
