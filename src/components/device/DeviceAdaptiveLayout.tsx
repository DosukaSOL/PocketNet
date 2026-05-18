import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { getDeviceProfile } from '@/lib/devices';

export function DeviceAdaptiveLayout({
  deviceName,
  children
}: PropsWithChildren<{ deviceName?: string }>) {
  const device = getDeviceProfile(deviceName);
  return <View style={[styles.base, styles[device.density]]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    width: '100%'
  },
  compact: {
    gap: 12
  },
  balanced: {
    gap: 16
  },
  spacious: {
    gap: 20
  }
});
