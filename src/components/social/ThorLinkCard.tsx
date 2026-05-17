import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, Row, Stack } from '@/components/ui';
import { colors, gradients, radius } from '@/design/tokens';

export function ThorLinkCard({
  title,
  body,
  icon: Icon,
  metric,
  children
}: {
  title: string;
  body: string;
  icon: LucideIcon;
  metric?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card gradient="thor" style={styles.card}>
      <LinearGradient colors={gradients.aurora} style={styles.glow} />
      <Row>
        <View style={styles.iconWrap}>
          <Icon color={colors.accentCyan} size={20} />
        </View>
        <Stack gap={2} style={styles.copy}>
          <Row>
            <AppText variant="cardTitle">{title}</AppText>
            {metric ? <Badge label={metric} tone="thor" compact /> : null}
          </Row>
          <AppText variant="caption" color={colors.textSecondary}>
            {body}
          </AppText>
        </Stack>
      </Row>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 140,
    position: 'relative'
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.card
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.accentCyan}66`,
    backgroundColor: 'rgba(36, 215, 255, 0.13)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  copy: {
    flex: 1
  }
});
