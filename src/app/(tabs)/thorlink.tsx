import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Camera, Gamepad2, MonitorUp, RadioTower, Send, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { AppText, Avatar, Badge, Button, Card, Row, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { pickImage } from '@/lib/media';
import { colors, radius, shadow, spacing } from '@/lib/theme';

export default function ThorLinkScreen() {
  const { profile, patchProfile } = useAuth();
  const { getFriends, getHomeFeed, createPost } = usePocketData();
  const [status, setStatus] = useState(profile?.currentStatus ?? '');
  const [quickPost, setQuickPost] = useState('');
  const friends = getFriends();
  const activeFriends = friends.filter((friend) => friend.currentGame || friend.currentStatus);
  const feed = useMemo(() => getHomeFeed().slice(0, 2), [getHomeFeed]);

  async function saveStatus() {
    try {
      await patchProfile({
        currentStatus: status,
        isThorUser: true,
        favoriteHandheld: profile?.favoriteHandheld || 'AYN Thor'
      });
      Alert.alert('ThorLink updated', 'Your quick status is live.');
    } catch (error) {
      Alert.alert('Could not update status', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function screenshotPost() {
    try {
      const image = await pickImage();
      if (!image) {
        return;
      }
      await createPost({
        body: quickPost || 'Quick screenshot from ThorLink.',
        imageUri: image.uri
      });
      setQuickPost('');
      Alert.alert('Screenshot posted', 'Your ThorLink update is live.');
    } catch (error) {
      Alert.alert('Could not post screenshot', error instanceof Error ? error.message : 'Try again.');
    }
  }

  return (
    <Screen scroll>
      <Card style={styles.hero} elevated>
        <View style={styles.heroText}>
          <Badge label="ThorLink" tone="lime" icon={RadioTower} />
          <AppText variant="heading">Dual-Screen Command</AppText>
          <AppText color={colors.textMuted}>
            A compact social dashboard tuned for AYN Thor owners and handheld players who live between screens.
          </AppText>
        </View>
        <Image
          source={require('@/assets/images/thorlink-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Card>

      <View style={styles.dualGrid}>
        <Card style={styles.screenCard}>
          <Row>
            <MonitorUp color={colors.cyan} size={20} />
            <AppText variant="title">Top Screen</AppText>
          </Row>
          <AppText color={colors.textMuted}>Feed, community posts, and profile detail stay readable here.</AppText>
          <Button label="Open feed" compact variant="secondary" onPress={() => router.push('/(tabs)/home')} />
        </Card>
        <Card style={styles.screenCard}>
          <Row>
            <Gamepad2 color={colors.lime} size={20} />
            <AppText variant="title">Bottom Screen</AppText>
          </Row>
          <AppText color={colors.textMuted}>Quick status, friends, and screenshot posting are kept compact.</AppText>
          <Button label="New screenshot" compact icon={Camera} onPress={() => void screenshotPost()} />
        </Card>
      </View>

      <Card>
        <Row>
          <RadioTower color={colors.coral} size={20} />
          <AppText variant="title">Quick Status</AppText>
        </Row>
        <TextField
          value={status}
          onChangeText={setStatus}
          placeholder="Trying a new Cocoon layout..."
        />
        <Button label="Update status" icon={Send} onPress={() => void saveStatus()} />
      </Card>

      <Card>
        <Row>
          <Camera color={colors.cyan} size={20} />
          <AppText variant="title">Screenshot Entry</AppText>
        </Row>
        <TextField
          value={quickPost}
          onChangeText={setQuickPost}
          placeholder="Caption for your next screenshot"
        />
        <Button label="Choose and post" icon={Camera} variant="secondary" onPress={() => void screenshotPost()} />
      </Card>

      <Card>
        <Row>
          <Users color={colors.violet} size={20} />
          <AppText variant="title">Friend Activity</AppText>
        </Row>
        {activeFriends.length ? (
          activeFriends.slice(0, 4).map((friend) => (
            <Row key={friend.id} style={styles.friendRow}>
              <Avatar label={friend.displayName} uri={friend.avatarUrl} />
              <View style={styles.friendMeta}>
                <AppText>{friend.displayName}</AppText>
                <AppText variant="small" color={colors.textMuted}>
                  {friend.currentGame ? `Playing ${friend.currentGame}` : friend.currentStatus}
                </AppText>
              </View>
            </Row>
          ))
        ) : (
          <AppText color={colors.textMuted}>No active friends yet.</AppText>
        )}
      </Card>

      <AppText variant="title">Glance Feed</AppText>
      {feed.map((post) => (
        <PostCard key={post.id} post={post} compact />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadow
  },
  heroText: {
    flex: 1,
    gap: spacing.sm
  },
  logo: {
    width: 116,
    height: 116,
    borderRadius: radius.md
  },
  dualGrid: {
    flexDirection: 'row',
    gap: spacing.md
  },
  screenCard: {
    flex: 1,
    minHeight: 164
  },
  friendRow: {
    alignItems: 'center'
  },
  friendMeta: {
    flex: 1,
    gap: spacing.xs
  }
});
