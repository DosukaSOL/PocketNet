import { Image } from 'expo-image';
import type { LucideIcon } from 'lucide-react-native';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, font, radius, shadow, spacing } from '@/lib/theme';

export function Screen({
  children,
  padded = true,
  scroll = false
}: PropsWithChildren<{ padded?: boolean; scroll?: boolean }>) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollScreen, padded && styles.padded]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

export function AppText({
  children,
  variant = 'body',
  color = colors.text,
  style
}: PropsWithChildren<{
  variant?: 'tiny' | 'small' | 'body' | 'title' | 'heading';
  color?: string;
  style?: TextStyle | TextStyle[];
}>) {
  return <Text style={[styles.text, styles[variant], { color }, style]}>{children}</Text>;
}

export function Card({
  children,
  style,
  elevated = false
}: PropsWithChildren<{ style?: ViewStyle | ViewStyle[]; elevated?: boolean }>) {
  return <View style={[styles.card, elevated && shadow, style]}>{children}</View>;
}

export function Row({
  children,
  style
}: PropsWithChildren<{ style?: ViewStyle | ViewStyle[] }>) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  icon: Icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  compact = false
}: {
  label: string;
  onPress?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
}) {
  const color = variant === 'primary' ? colors.background : colors.text;
  const variantStyle = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    ghost: styles.ghostButton,
    danger: styles.dangerButton
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        compact && styles.compactButton,
        (pressed || disabled) && styles.pressed
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <>
          {Icon ? <Icon color={color} size={compact ? 16 : 18} strokeWidth={2.4} /> : null}
          <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon: Icon,
  onPress,
  label,
  danger = false
}: {
  icon: LucideIcon;
  onPress?: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Icon color={danger ? colors.danger : colors.textMuted} size={20} />
    </Pressable>
  );
}

export function TextField(props: TextInputProps & { label?: string }) {
  return (
    <View style={styles.fieldWrap}>
      {props.label ? <AppText variant="small" color={colors.textMuted}>{props.label}</AppText> : null}
      <TextInput
        {...props}
        placeholderTextColor={colors.textDim}
        style={[styles.field, props.multiline && styles.multilineField, props.style]}
      />
    </View>
  );
}

export function Badge({
  label,
  tone = 'cyan',
  icon: Icon
}: {
  label: string;
  tone?: 'cyan' | 'lime' | 'coral' | 'violet' | 'blue' | 'neutral';
  icon?: LucideIcon;
}) {
  const toneColor =
    tone === 'lime'
      ? colors.lime
      : tone === 'coral'
        ? colors.coral
        : tone === 'violet'
          ? colors.violet
          : tone === 'blue'
            ? colors.blue
            : tone === 'neutral'
              ? colors.textMuted
              : colors.cyan;

  return (
    <View style={[styles.badge, { borderColor: `${toneColor}55`, backgroundColor: `${toneColor}16` }]}>
      {Icon ? <Icon color={toneColor} size={13} /> : null}
      <Text style={[styles.badgeText, { color: toneColor }]}>{label}</Text>
    </View>
  );
}

export function Avatar({
  uri,
  label,
  size = 44
}: {
  uri?: string;
  label: string;
  size?: number;
}) {
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  if (uri) {
    return <Image source={{ uri }} style={[styles.avatar, { width: size, height: size }]} />;
  }

  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.avatarText}>{initials || '?'}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  body,
  action
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card style={styles.emptyState}>
      <AppText variant="title">{title}</AppText>
      <AppText color={colors.textMuted}>{body}</AppText>
      {action}
    </Card>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollScreen: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl
  },
  padded: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  text: {
    letterSpacing: 0,
    fontWeight: '500'
  },
  tiny: {
    fontSize: font.tiny
  },
  small: {
    fontSize: font.small
  },
  body: {
    fontSize: font.body,
    lineHeight: 21
  },
  title: {
    fontSize: font.title,
    lineHeight: 26,
    fontWeight: '800'
  },
  heading: {
    fontSize: font.heading,
    lineHeight: 34,
    fontWeight: '900'
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  button: {
    minHeight: 46,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1
  },
  compactButton: {
    minHeight: 36,
    paddingHorizontal: spacing.md
  },
  primaryButton: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan
  },
  secondaryButton: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderColor: colors.border
  },
  dangerButton: {
    backgroundColor: `${colors.danger}18`,
    borderColor: `${colors.danger}55`
  },
  pressed: {
    opacity: 0.68
  },
  buttonLabel: {
    fontWeight: '800',
    fontSize: font.small
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt
  },
  fieldWrap: {
    gap: spacing.xs
  },
  field: {
    minHeight: 48,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    fontSize: font.body
  },
  multilineField: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.md
  },
  badge: {
    minHeight: 26,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    borderWidth: 1
  },
  badgeText: {
    fontSize: font.tiny,
    fontWeight: '900'
  },
  avatar: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border
  },
  avatarText: {
    color: colors.cyan,
    fontWeight: '900'
  },
  emptyState: {
    alignItems: 'flex-start'
  },
  divider: {
    height: 1,
    backgroundColor: colors.border
  }
});
