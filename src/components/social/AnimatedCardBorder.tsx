import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@/design/tokens';

export type StaticBorder =
  | 'classic'
  | 'mono'
  | 'ocean'
  | 'rose'
  | 'forest'
  | 'slate'
  | 'glow'
  | 'flames';

export type AnimatedBorderPreset =
  | 'neon'
  | 'sunset'
  | 'aurora'
  | 'gold'
  | 'retro'
  | 'plasma'
  | 'lightning'
  | 'fire'
  | 'glitch';

export type BorderPreset = StaticBorder | AnimatedBorderPreset;

export type BorderMotion = 'static' | 'rotate' | 'pulse' | 'breathe' | 'shimmer';

export const STATIC_BORDERS: StaticBorder[] = [
  'classic',
  'mono',
  'ocean',
  'rose',
  'forest',
  'slate',
  'glow',
  'flames'
];

export const ANIMATED_BORDERS: AnimatedBorderPreset[] = [
  'neon',
  'sunset',
  'aurora',
  'gold',
  'retro',
  'plasma',
  'lightning',
  'fire',
  'glitch'
];

export const BORDER_MOTIONS: BorderMotion[] = ['rotate', 'pulse', 'breathe', 'shimmer', 'static'];

const PRESET_STOPS: Record<BorderPreset, string[]> = {
  classic: [`${colors.accentCyan}66`, `${colors.accentCyan}66`, `${colors.accentCyan}66`],
  mono: ['#0F1320', '#1F2937', '#0F1320'],
  ocean: ['#22D3EE', '#0EA5E9', '#1D4ED8'],
  rose: ['#F472B6', '#FB7185', '#E11D48'],
  forest: ['#34D399', '#10B981', '#065F46'],
  slate: ['#94A3B8', '#475569', '#94A3B8'],
  glow: [`${colors.accentCyan}AA`, '#FFFFFF', `${colors.accentCyan}AA`],
  flames: ['#7C2D12', '#EA580C', '#FDE047', '#7C2D12'],
  neon: [colors.accentCyan, colors.accentPink, colors.accentCyan],
  sunset: ['#FF8A4C', colors.accentPink, '#FF8A4C'],
  aurora: ['#22D3EE', '#34D399', colors.accentPurple, '#22D3EE'],
  gold: [colors.warning, '#FFF1B8', colors.warning],
  retro: [colors.accentCyan, '#B4FF39', colors.accentCyan],
  plasma: [colors.accentPurple, colors.accentPink, colors.accentCyan, colors.accentPurple],
  lightning: [colors.accentCyan, '#FFFFFF', '#FFE45C', colors.accentCyan],
  fire: ['#FF4500', '#FF8C00', '#FFD000', '#FF4500'],
  glitch: [colors.accentPink, colors.accentCyan, '#39FF14', colors.accentPink]
};

const BORDER_THICKNESS = 4;
const SPECIAL_PRESETS = new Set<BorderPreset>(['lightning', 'fire', 'glitch']);

export function isStaticBorder(value: string): value is StaticBorder {
  return (STATIC_BORDERS as string[]).includes(value);
}

export function isAnimatedBorder(value: string): value is AnimatedBorderPreset {
  return (ANIMATED_BORDERS as string[]).includes(value);
}

export function encodeCardBorder(preset: string, motion?: BorderMotion | null): string {
  if (!motion || isStaticBorder(preset)) return preset;
  return `${preset}::${motion}`;
}

export function decodeCardBorder(value?: string | null): { preset: string; motion: BorderMotion } {
  if (!value) return { preset: 'classic', motion: 'rotate' };
  const [presetRaw, motionRaw] = value.split('::');
  const preset = presetRaw || 'classic';
  const motion = (BORDER_MOTIONS as string[]).includes(motionRaw ?? '')
    ? (motionRaw as BorderMotion)
    : 'rotate';
  return { preset, motion };
}

function durationFor(preset: BorderPreset): number {
  switch (preset) {
    case 'lightning':
      return 600;
    case 'fire':
      return 1800;
    case 'glitch':
      return 320;
    default:
      return 4200;
  }
}

type Props = {
  preset?: BorderPreset | string | null;
  motion?: BorderMotion | null;
  customBorderUrl?: string | null;
  borderRadius?: number;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function AnimatedCardBorder({
  preset,
  motion,
  customBorderUrl,
  borderRadius: r = radius.lg,
  children,
  style
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const strobe = useRef(new Animated.Value(1)).current;
  const jitter = useRef(new Animated.Value(0)).current;
  const breath = useRef(new Animated.Value(1)).current;
  const pulseV = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  const decoded = typeof preset === 'string' ? decodeCardBorder(preset) : { preset: 'classic', motion: motion ?? 'rotate' };
  const effectivePreset: BorderPreset = (
    decoded.preset && decoded.preset in PRESET_STOPS ? decoded.preset : 'classic'
  ) as BorderPreset;
  const effectiveMotion: BorderMotion = motion ?? decoded.motion;

  const hasCustom = Boolean(customBorderUrl && customBorderUrl.startsWith('https://'));
  const animatedPreset = isAnimatedBorder(effectivePreset);
  const isSpecial = SPECIAL_PRESETS.has(effectivePreset);
  const shouldAnimate = hasCustom || (animatedPreset && effectiveMotion !== 'static');

  useEffect(() => {
    progress.setValue(0);
    strobe.setValue(1);
    jitter.setValue(0);
    breath.setValue(1);
    pulseV.setValue(1);
    shimmer.setValue(0);

    if (!shouldAnimate) return;

    const motionForPreset: BorderMotion = isSpecial ? 'rotate' : effectiveMotion;
    const anims: Animated.CompositeAnimation[] = [];

    if (hasCustom || motionForPreset === 'rotate') {
      anims.push(
        Animated.loop(
          Animated.timing(progress, {
            toValue: 1,
            duration: durationFor(effectivePreset),
            easing: Easing.linear,
            useNativeDriver: true
          })
        )
      );
    }

    if (effectivePreset === 'lightning') {
      anims.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(strobe, { toValue: 0.55, duration: 80, useNativeDriver: true }),
            Animated.timing(strobe, { toValue: 1, duration: 110, useNativeDriver: true }),
            Animated.timing(strobe, { toValue: 0.7, duration: 60, useNativeDriver: true }),
            Animated.timing(strobe, { toValue: 1, duration: 350, useNativeDriver: true })
          ])
        )
      );
    } else if (effectivePreset === 'glitch') {
      anims.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(jitter, { toValue: 2, duration: 60, useNativeDriver: true }),
            Animated.timing(jitter, { toValue: -2, duration: 60, useNativeDriver: true }),
            Animated.timing(jitter, { toValue: 0, duration: 60, useNativeDriver: true }),
            Animated.delay(160)
          ])
        )
      );
    } else if (effectivePreset === 'fire') {
      anims.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(strobe, { toValue: 1.04, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(strobe, { toValue: 0.96, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
          ])
        )
      );
    } else if (motionForPreset === 'pulse') {
      anims.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseV, { toValue: 0.45, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(pulseV, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
          ])
        )
      );
    } else if (motionForPreset === 'breathe') {
      anims.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(breath, { toValue: 1.03, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(breath, { toValue: 0.97, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
          ])
        )
      );
    } else if (motionForPreset === 'shimmer') {
      anims.push(
        Animated.loop(
          Animated.timing(shimmer, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true })
        )
      );
    }

    anims.forEach((a) => a.start());
    return () => {
      anims.forEach((a) => a.stop());
    };
  }, [progress, strobe, jitter, breath, pulseV, shimmer, shouldAnimate, hasCustom, isSpecial, effectivePreset, effectiveMotion]);

  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] });
  const motionForPreset: BorderMotion = isSpecial ? 'rotate' : effectiveMotion;

  let transform: unknown;
  let opacityAnim: Animated.AnimatedInterpolation<number> | Animated.Value | number = 1;

  if (hasCustom) {
    transform = [{ rotate }];
  } else if (animatedPreset) {
    if (effectivePreset === 'glitch') {
      transform = [{ rotate }, { translateX: jitter }];
    } else if (effectivePreset === 'fire') {
      transform = [{ rotate }, { scale: strobe }];
    } else if (effectivePreset === 'lightning') {
      transform = [{ rotate }];
      opacityAnim = strobe;
    } else if (motionForPreset === 'rotate') {
      transform = [{ rotate }];
    } else if (motionForPreset === 'pulse') {
      opacityAnim = pulseV;
    } else if (motionForPreset === 'breathe') {
      transform = [{ scale: breath }];
    } else if (motionForPreset === 'shimmer') {
      opacityAnim = shimmerOpacity;
    }
  }

  return (
    <View style={[styles.outer, { borderRadius: r }, style]}>
      <View style={[styles.frame, { borderRadius: r, padding: BORDER_THICKNESS }]}>
        {hasCustom ? (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: r, overflow: 'hidden', transform } as unknown as ViewStyle
            ]}
          >
            <Image
              source={{ uri: customBorderUrl! }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityIgnoresInvertColors
            />
          </Animated.View>
        ) : animatedPreset ? (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: r,
                overflow: 'hidden',
                transform,
                opacity: opacityAnim
              } as unknown as ViewStyle
            ]}
          >
            <LinearGradient
              colors={PRESET_STOPS[effectivePreset] as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        ) : effectivePreset === 'glow' ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: r,
                borderWidth: 2,
                borderColor: colors.accentCyan,
                shadowColor: colors.accentCyan,
                shadowOpacity: 0.7,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 }
              }
            ]}
          />
        ) : effectivePreset === 'classic' ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: r, borderWidth: 1, borderColor: `${colors.accentCyan}55` }
            ]}
          />
        ) : (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: r, overflow: 'hidden' }]}>
            <LinearGradient
              colors={PRESET_STOPS[effectivePreset] as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}

        <View style={[styles.inner, { borderRadius: Math.max(0, r - 2) }]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden'
  },
  frame: {
    position: 'relative',
    overflow: 'hidden'
  },
  inner: {
    backgroundColor: colors.surface,
    overflow: 'hidden'
  }
});
