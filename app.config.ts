const version = '0.1.4';

export default {
  expo: {
    name: 'PocketNet',
    slug: 'pocketnet',
    scheme: 'pocketnet',
    version,
    orientation: 'portrait',
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
      versionCode: 4,
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
