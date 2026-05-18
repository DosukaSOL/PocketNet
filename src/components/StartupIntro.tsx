import { useAudioPlayer } from 'expo-audio';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, gradients, radius, spacing } from '@/design/tokens';

export function StartupIntro({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const copyOpacity = useRef(new Animated.Value(0)).current;
  const player = useAudioPlayer(require('../assets/sounds/pocketnet-jingle.wav'), {
    keepAudioSessionActive: false,
    updateInterval: 1000
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      try {
        player.volume = 0.32;
        player.play();
      } catch {
        // Audio can be unavailable in simulator or muted contexts; the visual intro still runs.
      }
    }

    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 16,
        bounciness: 5
      }),
      Animated.sequence([
        Animated.delay(260),
        Animated.timing(copyOpacity, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true
        })
      ]),
      Animated.sequence([
        Animated.delay(1550),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true
        })
      ])
    ]).start();

    const doneTimer = setTimeout(onDone, 2050);
    return () => clearTimeout(doneTimer);
  }, [copyOpacity, logoScale, onDone, opacity, player]);

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity }]}>
      <LinearGradient colors={gradients.app} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={gradients.aurora} style={styles.glow} />
      <View style={styles.center}>
        <Animated.View style={[styles.logoShell, { transform: [{ scale: logoScale }] }]}>
          <Image
            source={require('../assets/images/pocketnet-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>
        <Animated.View style={[styles.copy, { opacity: copyOpacity }]}>
          <AppText variant="screenTitle">PocketNet</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.subtitle}>
            Handheld social, tuned for play.
          </AppText>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: colors.background
  },
  glow: {
    position: 'absolute',
    left: -80,
    right: -80,
    top: -120,
    height: 420,
    opacity: 0.9
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg
  },
  logoShell: {
    width: 132,
    height: 132,
    borderRadius: radius.xxxl,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentCyan,
    shadowOpacity: 0.34,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12
  },
  logo: {
    width: 104,
    height: 104
  },
  copy: {
    alignItems: 'center',
    gap: spacing.xs
  },
  subtitle: {
    textAlign: 'center'
  }
});
