import { Tabs } from 'expo-router';
import { Compass, Home, PlusCircle, RadioTower, UserRound } from 'lucide-react-native';

import { colors } from '@/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: 68,
          paddingTop: 8
        },
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800'
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
