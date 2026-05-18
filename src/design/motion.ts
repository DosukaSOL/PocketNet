import { Animated, Easing } from 'react-native';

import { motion } from '@/design/tokens';

export const timings = {
  pressIn: motion.fast,
  pressOut: motion.normal,
  cardIn: motion.entrance,
  tab: motion.normal,
  sheet: motion.slow,
  shimmer: motion.shimmer
};

export const easing = {
  standard: Easing.out(Easing.cubic),
  emphasized: Easing.out(Easing.exp),
  inOut: Easing.inOut(Easing.cubic)
};

export function fadeSlideIn(value: Animated.Value, delay = 0) {
  value.setValue(0);
  Animated.timing(value, {
    toValue: 1,
    duration: timings.cardIn,
    delay,
    easing: easing.standard,
    useNativeDriver: true
  }).start();
}
