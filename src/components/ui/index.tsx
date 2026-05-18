import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, gradients, motion, radius, shadows, spacing, typography } from '@/design/tokens';

type TextVariant = keyof typeof typography | 'tiny' | 'small' | 'title' | 'heading';
type ButtonIcon = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

type Tone =
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'lime'
  | 'coral'
  | 'neutral'
  | 'warning'
  | 'danger'
  | 'focus';

const toneMap: Record<Tone, string> = {
  cyan: colors.accentCyan,
  blue: colors.accentBlue,
  purple: colors.accentPurple,
  pink: colors.accentPink,
  lime: colors.success,
  coral: colors.accentPink,
  neutral: colors.textSecondary,
  warning: colors.warning,
  danger: colors.danger,
  focus: colors.focus
};

function textVariant(variant: TextVariant) {
  if (variant === 'tiny') return typography.badge;
  if (variant === 'small') return typography.caption;
  if (variant === 'title') return typography.sectionTitle;
  if (variant === 'heading') return typography.screenTitle;
  return typography[variant];
}

export function Screen({
  children,
  padded = true,
  scroll = false,
  contentStyle,
  refreshing = false,
  onRefresh
}: PropsWithChildren<{
  padded?: boolean;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
}>) {
  if (scroll) {
    return (
      <LinearGradient colors={gradients.app} style={styles.safeArea}>
        <LinearGradient colors={gradients.appGlow} style={styles.backgroundGlow} />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={[styles.scrollScreen, padded && styles.padded, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.accentCyan}
                  colors={[colors.accentCyan, colors.accentPurple]}
                  progressBackgroundColor={colors.surface}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradients.app} style={styles.safeArea}>
      <LinearGradient colors={gradients.appGlow} style={styles.backgroundGlow} />
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.screen, padded && styles.padded, contentStyle]}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export function AppText({
  children,
  variant = 'body',
  color = colors.textPrimary,
  numberOfLines,
  style
}: PropsWithChildren<{
  variant?: TextVariant;
  color?: string;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}>) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[styles.textBase, textVariant(variant), { color }, style]}
    >
      {children}
    </Text>
  );
}

export function Row({
  children,
  style
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Stack({
  children,
  gap = spacing.md,
  style
}: PropsWithChildren<{ gap?: number; style?: StyleProp<ViewStyle> }>) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

export function PressableScale({
  children,
  onPress,
  disabled,
  style,
  accessibilityLabel,
  accessibilityRole = 'button'
}: PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link' | 'imagebutton';
}>) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(toValue: number) {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4
    }).start();
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animate(motion.pressScale)}
      onPressOut={() => animate(1)}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale }],
            opacity: disabled ? 0.5 : 1
          }
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function Reveal({
  children,
  delay = 0,
  style
}: PropsWithChildren<{ delay?: number; style?: StyleProp<ViewStyle> }>) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.entrance,
      delay,
      useNativeDriver: true
    }).start();
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0]
              })
            }
          ]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Card({
  children,
  style,
  elevated = false,
  gradient = false,
  pressable = false,
  onPress
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  gradient?: boolean | 'focus' | 'pocket' | 'danger';
  pressable?: boolean;
  onPress?: () => void;
}>) {
  const cardBody = gradient ? (
    <LinearGradient
      colors={
        gradient === 'focus'
          ? gradients.focus
          : gradient === 'danger'
            ? gradients.danger
            : gradient === 'pocket'
              ? gradients.pocket
              : gradients.card
      }
      style={[styles.card, elevated && shadows.card, style]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.card, elevated && shadows.card, style]}>{children}</View>
  );

  if (!pressable && !onPress) {
    return cardBody;
  }

  return (
    <PressableScale onPress={onPress} style={styles.pressableWrap}>
      {cardBody}
    </PressableScale>
  );
}

export function GlassCard(props: PropsWithChildren<{ style?: StyleProp<ViewStyle>; elevated?: boolean }>) {
  return <Card {...props} gradient style={[styles.glassCard, props.style]} elevated={props.elevated} />;
}

export function GlowCard(props: PropsWithChildren<{ style?: StyleProp<ViewStyle>; tone?: 'cyan' | 'purple' | 'pink' | 'focus' }>) {
  const tone = props.tone ?? 'cyan';
  const color =
    tone === 'purple'
      ? colors.accentPurple
      : tone === 'pink'
        ? colors.accentPink
        : tone === 'focus'
          ? colors.focus
          : colors.accentCyan;
  return (
    <Card gradient="pocket" elevated style={[styles.glowCard, { borderColor: `${color}66` }, props.style]}>
      {props.children}
    </Card>
  );
}

export function Button({
  label,
  onPress,
  icon: Icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  compact = false,
  full = false
}: {
  label: string;
  onPress?: () => void;
  icon?: ButtonIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'focus';
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  full?: boolean;
}) {
  const isPrimary = variant === 'primary' || variant === 'focus';
  const labelColor = isPrimary ? colors.background : variant === 'danger' ? colors.danger : colors.textPrimary;
  const borderColor =
    variant === 'primary'
      ? colors.accentCyan
      : variant === 'focus'
        ? colors.focus
        : variant === 'danger'
          ? `${colors.danger}88`
          : colors.border;
  const content = (
    <View
      style={[
        styles.button,
        compact && styles.buttonCompact,
        full && styles.full,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'ghost' && styles.ghostButton,
        variant === 'danger' && styles.dangerButton,
        { borderColor }
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <>
          {Icon ? <Icon color={labelColor} size={compact ? 15 : 18} strokeWidth={2.4} /> : null}
          <Text style={[styles.buttonLabel, { color: labelColor }]}>{label}</Text>
        </>
      )}
    </View>
  );

  return (
    <PressableScale onPress={onPress} disabled={disabled || loading} style={full ? styles.full : undefined}>
      {variant === 'primary' ? (
        <LinearGradient colors={gradients.cyan} style={[styles.buttonGradient, compact && styles.buttonCompact]}>
          {loading ? (
            <ActivityIndicator size="small" color={labelColor} />
          ) : (
            <>
              {Icon ? <Icon color={labelColor} size={compact ? 15 : 18} strokeWidth={2.4} /> : null}
              <Text style={[styles.buttonLabel, { color: labelColor }]}>{label}</Text>
            </>
          )}
        </LinearGradient>
      ) : variant === 'focus' ? (
        <LinearGradient colors={gradients.purple} style={[styles.buttonGradient, compact && styles.buttonCompact]}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              {Icon ? <Icon color={colors.white} size={compact ? 15 : 18} strokeWidth={2.4} /> : null}
              <Text style={[styles.buttonLabel, { color: colors.white }]}>{label}</Text>
            </>
          )}
        </LinearGradient>
      ) : (
        content
      )}
    </PressableScale>
  );
}

export function IconButton({
  icon: Icon,
  onPress,
  label,
  danger = false,
  tone = 'neutral'
}: {
  icon: LucideIcon;
  onPress?: () => void;
  label: string;
  danger?: boolean;
  tone?: Tone;
}) {
  const iconColor = danger ? colors.danger : toneMap[tone];
  return (
    <PressableScale accessibilityLabel={label} onPress={onPress} style={styles.iconButton}>
      <Icon color={iconColor} size={20} strokeWidth={2.25} />
    </PressableScale>
  );
}

export function TextField(props: TextInputProps & { label?: string; error?: string; leftIcon?: LucideIcon }) {
  const LeftIcon = props.leftIcon;
  return (
    <View style={styles.fieldWrap}>
      {props.label ? (
        <AppText variant="metadata" color={colors.textSecondary} style={styles.fieldLabel}>
          {props.label}
        </AppText>
      ) : null}
      <View style={[styles.fieldShell, props.multiline && styles.textAreaShell, props.error && styles.fieldError]}>
        {LeftIcon ? <LeftIcon color={colors.textMuted} size={18} /> : null}
        <TextInput
          {...props}
          placeholderTextColor={colors.textMuted}
          style={[styles.field, props.multiline && styles.textArea, props.style]}
        />
      </View>
      {props.error ? (
        <AppText variant="metadata" color={colors.danger}>
          {props.error}
        </AppText>
      ) : null}
    </View>
  );
}

export function TextArea(props: TextInputProps & { label?: string; error?: string }) {
  return <TextField {...props} multiline />;
}

export function SearchBar(props: TextInputProps & { icon?: LucideIcon }) {
  return <TextField {...props} leftIcon={props.icon} />;
}

export function Badge({
  label,
  tone = 'cyan',
  icon: Icon,
  compact = false,
  align = 'start'
}: {
  label: string;
  tone?: Tone;
  icon?: LucideIcon;
  compact?: boolean;
  align?: 'start' | 'center';
}) {
  const toneColor = toneMap[tone];
  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        align === 'center' && { alignSelf: 'center' },
        { borderColor: `${toneColor}66`, backgroundColor: `${toneColor}18` }
      ]}
    >
      {Icon ? <Icon color={toneColor} size={compact ? 11 : 13} strokeWidth={2.4} /> : null}
      <Text style={[styles.badgeText, { color: toneColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Avatar({
  uri,
  label,
  size = 48,
  status = 'offline',
  focus = false,
  thor = false
}: {
  uri?: string;
  label: string;
  size?: number;
  status?: 'online' | 'offline' | 'pending';
  focus?: boolean;
  thor?: boolean;
}) {
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  const statusColor =
    status === 'online' ? colors.online : status === 'pending' ? colors.pending : colors.offline;

  return (
    <LinearGradient
      colors={focus || thor ? gradients.focus : gradients.cyan}
      style={[
        styles.avatarRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2
        }
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.avatarImage, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.avatarFallback,
            { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }
          ]}
        >
          <Text style={[styles.avatarText, { fontSize: Math.max(13, size * 0.32) }]}>
            {initials || '?'}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: statusColor,
            width: Math.max(10, size * 0.22),
            height: Math.max(10, size * 0.22),
            borderRadius: Math.max(10, size * 0.22) / 2
          }
        ]}
      />
    </LinearGradient>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon: Icon,
  tone = 'cyan'
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  const toneColor = toneMap[tone];
  return (
    <Card gradient style={styles.emptyState}>
      {Icon ? (
        <View style={[styles.emptyIcon, { borderColor: `${toneColor}66`, backgroundColor: `${toneColor}16` }]}>
          <Icon color={toneColor} size={24} />
        </View>
      ) : null}
      <Stack gap={spacing.xs}>
        <AppText variant="sectionTitle">{title}</AppText>
        <AppText color={colors.textSecondary}>{body}</AppText>
      </Stack>
      {action}
    </Card>
  );
}

export function ErrorBanner({
  title = 'Something needs attention',
  body,
  action
}: {
  title?: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card gradient="danger" style={styles.errorBanner}>
      <AppText variant="cardTitle">{title}</AppText>
      <AppText color={colors.textSecondary}>{body}</AppText>
      {action}
    </Card>
  );
}

export function Skeleton({ width = '100%', height = 16, radius: skeletonRadius = radius.md }: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
}) {
  const opacity = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.88, duration: 760, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.42, duration: 760, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: skeletonRadius,
          opacity
        }
      ]}
    />
  );
}

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange
}: {
  tabs: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <PressableScale
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{tab.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statPill}>
      <AppText variant="sectionTitle">{value}</AppText>
      <AppText variant="metadata" color={colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  backgroundGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 320,
    opacity: 0.86
  },
  screen: {
    flex: 1
  },
  scrollScreen: {
    paddingBottom: 112
  },
  padded: {
    padding: spacing.md,
    gap: spacing.md
  },
  textBase: {
    letterSpacing: 0
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  pressableWrap: {
    width: '100%'
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'hidden'
  },
  glassCard: {
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.borderStrong
  },
  glowCard: {
    borderWidth: 1,
    ...shadows.glowCyan
  },
  button: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    backgroundColor: colors.control
  },
  buttonGradient: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.glowCyan
  },
  buttonCompact: {
    minHeight: 38,
    paddingHorizontal: spacing.md
  },
  full: {
    width: '100%'
  },
  secondaryButton: {
    backgroundColor: colors.control
  },
  ghostButton: {
    backgroundColor: 'transparent'
  },
  dangerButton: {
    backgroundColor: `${colors.danger}16`
  },
  buttonLabel: {
    ...typography.button,
    letterSpacing: 0
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.control
  },
  fieldWrap: {
    gap: spacing.xs
  },
  fieldLabel: {
    textTransform: 'uppercase'
  },
  fieldShell: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.control,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  textAreaShell: {
    minHeight: 120,
    alignItems: 'flex-start',
    paddingTop: spacing.md
  },
  fieldError: {
    borderColor: colors.danger
  },
  field: {
    flex: 1,
    color: colors.textPrimary,
    ...typography.body,
    paddingVertical: spacing.sm
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: 'top',
    paddingTop: 0
  },
  badge: {
    minHeight: 28,
    maxWidth: '100%',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    overflow: 'hidden'
  },
  badgeCompact: {
    minHeight: 24,
    paddingHorizontal: spacing.xs
  },
  badgeText: {
    ...typography.badge,
    letterSpacing: 0
  },
  avatarRing: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.glowCyan
  },
  avatarImage: {
    backgroundColor: colors.surfaceStrong
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong
  },
  avatarText: {
    color: colors.textPrimary,
    fontWeight: '900',
    letterSpacing: 0
  },
  statusDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: colors.background
  },
  emptyState: {
    alignItems: 'flex-start'
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorBanner: {
    gap: spacing.xs
  },
  skeleton: {
    backgroundColor: colors.surfaceGlow
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xxs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.surfaceGlass
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentActive: {
    backgroundColor: colors.controlActive,
    borderWidth: 1,
    borderColor: `${colors.accentCyan}55`
  },
  segmentText: {
    ...typography.button,
    color: colors.textMuted
  },
  segmentTextActive: {
    color: colors.textPrimary
  },
  statPill: {
    flex: 1,
    minHeight: 66,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.border
  }
});
