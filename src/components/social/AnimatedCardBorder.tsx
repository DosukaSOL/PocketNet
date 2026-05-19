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
  | 'plasma';

const PRESET_STOPS: Record<BorderPreset, string[]> = {
  classic: [`${colors.accentCyan}66`, `${colors.accentCyan}66`, `${colors.accentCyan}66`],
  neon: [colors.accentCyan, colors.accentPink, colors.accentCyan],
  sunset: ['#FF8A4C', colors.accentPink, '#FF8A4C'],
  aurora: ['#22D3EE', '#34D399', colors.accentPurple, '#22D3EE'],
  gold: [colors.warning, '#FFF1B8', colors.warning],
  retro: [colors.accentCyan, '#B4FF39', colors.accentCyan],
  plasma: [colors.accentPurple, colors.accentPink, colors.accentCyan, colors.accentPurple]
};

const BORDER_THICKNESS = 4;

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
  const hasCustom = Boolean(customBorderUrl && customBorderUrl.startsWith('https://'));
  const isAnimated = !hasCustom && preset && preset !== 'classic';
  const presetKey: BorderPreset = (
    preset && preset in PRESET_STOPS ? preset : 'classic'
  ) as BorderPreset;

  useEffect(() => {
    if (!isAnimated && !hasCustom) {
      progress.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress, isAnimated, hasCustom]);

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.outer, { borderRadius: r }, style]}>
      <View style={[styles.frame, { borderRadius: r, padding: BORDER_THICKNESS }]}>
        {hasCustom ? (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: r, overflow: 'hidden', transform: [{ rotate }] }
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
              { borderRadius: r, overflow: 'hidden', transform: [{ rotate }] }
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
