import { Tabs } from 'expo-router';
import { Compass, Home, PlusCircle, UserRound } from 'lucide-react-native';

import { colors, radius, shadows, spacing } from '@/design/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: spacing.md,
          right: spacing.md,
          bottom: spacing.md,
          height: 74,
          borderRadius: radius.xxl,
          backgroundColor: 'rgba(13, 21, 36, 0.92)',
          borderColor: colors.borderGlow,
          borderWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          ...shadows.card
        },
        tabBarActiveTintColor: colors.accentCyan,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 14,
          fontWeight: '900'
        },
        tabBarItemStyle: {
          borderRadius: radius.xl,
          marginHorizontal: 4
        }
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: icon(Home) }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: icon(Compass) }} />
      <Tabs.Screen name="create" options={{ title: 'Post', tabBarIcon: icon(PlusCircle) }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon(UserRound) }} />
    </Tabs>
  );
}

function icon(Icon: typeof Home) {
  function TabIcon({ color, size }: { color: string; size: number }) {
    return <Icon color={color} size={size} />;
  }
  TabIcon.displayName = `${Icon.displayName ?? 'PocketNet'}TabIcon`;
  return TabIcon;
}
