const version = '0.1.0';

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
      versionCode: 1,
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
    plugins: ['expo-router', 'expo-image-picker', 'expo-audio'],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: '00000000-0000-0000-0000-000000000000'
      }
    }
  }
};
