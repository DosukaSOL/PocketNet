import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';

import { gradients } from '@/design/tokens';

export function GradientBackground({ children }: PropsWithChildren) {
  return (
    <LinearGradient colors={gradients.app} style={styles.wrap}>
      <LinearGradient colors={gradients.appGlow} style={styles.glow} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1
  },
  glow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 320
  }
});
