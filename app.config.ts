const version = '1.0.0';

export default {
  expo: {
    name: 'PocketNet',
    slug: 'pocketnet',
    scheme: 'pocketnet',
    version,
    // 'default' lets the OS pick a natural orientation. On dual-screen handhelds
    // (e.g. AYN Thor) a hard portrait lock made the activity launch sideways on
    // the secondary panel because that panel's natural orientation is rotated.
    orientation: 'default',
    userInterfaceStyle: 'dark',
    icon: './src/assets/images/pocketnet-logo.png',
    splash: {
      image: './src/assets/images/pocketnet-logo.png',
      resizeMode: 'contain',
      backgroundColor: '#05060A'
    },
    assetBundlePatterns: ['**/*'],
    android: {
      package: 'com.pocketnet.app',
      versionCode: 10,
      adaptiveIcon: {
        foregroundImage: './src/assets/images/pocketnet-logo.png',
        backgroundColor: '#05060A'
      },
      permissions: ['READ_MEDIA_IMAGES']
    },
    ios: {
      bundleIdentifier: 'com.pocketnet.app'
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './src/assets/images/pocketnet-logo.png'
    },
    plugins: ['expo-router', 'expo-image-picker', 'expo-audio', 'expo-screen-orientation'],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: '4165f4e0-21bd-4579-b6ee-0b2ea95cdaa0'
      }
    }
  }
};
