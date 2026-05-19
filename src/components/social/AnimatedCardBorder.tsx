import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@/design/tokens';

export type BorderPreset =
  | 'classic'
  | 'neon'
  | 'sunset'
  | 'aurora'
  | 'gold'
  | 'retro'
  | 'plasma'
  | 'lightning'
  | 'fire'
  | 'glitch';

export const STATIC_BORDERS: BorderPreset[] = ['classic'];
export const ANIMATED_BORDERS: BorderPreset[] = [
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

const PRESET_STOPS: Record<BorderPreset, string[]> = {
  classic: [`${colors.accentCyan}66`, `${colors.accentCyan}66`, `${colors.accentCyan}66`],
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
  customBorderUrl?: string | null;
  borderRadius?: number;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function AnimatedCardBorder({
  preset,
  customBorderUrl,
  borderRadius: r = radius.lg,
  children,
  style
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const strobe = useRef(new Animated.Value(1)).current;
  const jitter = useRef(new Animated.Value(0)).current;
  const hasCustom = Boolean(customBorderUrl && customBorderUrl.startsWith('https://'));
  const isAnimated = !hasCustom && preset && preset !== 'classic';
  const presetKey: BorderPreset = (
    preset && preset in PRESET_STOPS ? preset : 'classic'
  ) as BorderPreset;

  useEffect(() => {
    if (!isAnimated && !hasCustom) {
      progress.setValue(0);
      strobe.setValue(1);
      jitter.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: durationFor(presetKey),
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    loop.start();

    let extra: Animated.CompositeAnimation | undefined;

    if (presetKey === 'lightning') {
      extra = Animated.loop(
        Animated.sequence([
          Animated.timing(strobe, { toValue: 0.55, duration: 80, useNativeDriver: true }),
          Animated.timing(strobe, { toValue: 1, duration: 110, useNativeDriver: true }),
          Animated.timing(strobe, { toValue: 0.7, duration: 60, useNativeDriver: true }),
          Animated.timing(strobe, { toValue: 1, duration: 350, useNativeDriver: true })
        ])
      );
      extra.start();
    } else if (presetKey === 'glitch') {
      extra = Animated.loop(
        Animated.sequence([
          Animated.timing(jitter, { toValue: 2, duration: 60, useNativeDriver: true }),
          Animated.timing(jitter, { toValue: -2, duration: 60, useNativeDriver: true }),
          Animated.timing(jitter, { toValue: 0, duration: 60, useNativeDriver: true }),
          Animated.delay(160)
        ])
      );
      extra.start();
    } else if (presetKey === 'fire') {
      extra = Animated.loop(
        Animated.sequence([
          Animated.timing(strobe, {
            toValue: 1.04,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true
          }),
          Animated.timing(strobe, {
            toValue: 0.96,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true
          })
        ])
      );
      extra.start();
    }

    return () => {
      loop.stop();
      extra?.stop();
    };
  }, [progress, strobe, jitter, isAnimated, hasCustom, presetKey]);

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const transform = (
    presetKey === 'glitch'
      ? [{ rotate }, { translateX: jitter }]
      : presetKey === 'fire'
        ? [{ rotate }, { scale: strobe }]
        : [{ rotate }]
  ) as unknown as Animated.WithAnimatedArray<never>;
  const customTransform = [{ rotate }] as unknown as Animated.WithAnimatedArray<never>;

  return (
    <View style={[styles.outer, { borderRadius: r }, style]}>
      <View style={[styles.frame, { borderRadius: r, padding: BORDER_THICKNESS }]}>
        {hasCustom ? (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: r, overflow: 'hidden', transform: customTransform } as unknown as import('react-native').ViewStyle
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
        ) : isAnimated ? (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: r,
                overflow: 'hidden',
                transform,
                opacity: presetKey === 'lightning' ? strobe : 1
              } as unknown as import('react-native').ViewStyle
            ]}
          >
            <LinearGradient
              colors={PRESET_STOPS[presetKey] as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        ) : (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: r,
                borderWidth: 1,
                borderColor: `${colors.accentCyan}55`
              }
            ]}
          />
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
    position: 'relative'
  },
  inner: {
    overflow: 'hidden',
    backgroundColor: 'transparent'
  }
});
