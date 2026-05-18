import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/design/tokens';

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: Math.min(radius.lg, size / 2.3)
        }
      ]}
    >
      <Image
        source={require('../assets/images/pocketnet-logo.png')}
        style={{ width: size * 0.72, height: size * 0.72 }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.surfaceGlass
  }
});
