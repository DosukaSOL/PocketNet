import { Tabs } from 'expo-router';
import { Compass, Home, PlusCircle, RadioTower, UserRound } from 'lucide-react-native';

import { colors } from '@/design/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(16, 23, 38, 0.96)',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          minHeight: 76,
          paddingTop: 9,
          paddingBottom: 10
        },
        tabBarActiveTintColor: colors.accentCyan,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 14,
          fontWeight: '900'
        },
        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 2
        }
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: icon(Home) }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: icon(Compass) }} />
      <Tabs.Screen name="create" options={{ title: 'Post', tabBarIcon: icon(PlusCircle) }} />
      <Tabs.Screen name="thorlink" options={{ title: 'ThorLink', tabBarIcon: icon(RadioTower) }} />
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
