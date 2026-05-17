import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Camera, Gamepad2, MonitorUp, RadioTower, Send, Sparkles, Users, Zap } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { ThorLinkCard } from '@/components/social/ThorLinkCard';
import { UserCard } from '@/components/social/UserCard';
import { AppText, Badge, Button, Card, EmptyState, Row, Screen, Stack, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { pickImage } from '@/lib/media';
import { colors, gradients, radius, spacing } from '@/design/tokens';

export default function ThorLinkScreen() {
  const { profile, patchProfile } = useAuth();
  const { getFriends, getHomeFeed, createPost } = usePocketData();
  const [status, setStatus] = useState(profile?.currentStatus ?? '');
  const [quickPost, setQuickPost] = useState('');
  const [saving, setSaving] = useState(false);
  const friends = getFriends();
  const activeFriends = friends.filter((friend) => friend.currentGame || friend.currentStatus);
  const feed = useMemo(() => getHomeFeed().slice(0, 2), [getHomeFeed]);

  async function saveStatus() {
    try {
      setSaving(true);
      await patchProfile({
        currentStatus: status,
        isThorUser: true,
        favoriteHandheld: profile?.favoriteHandheld || 'AYN Thor'
      });
      Alert.alert('ThorLink updated', 'Your quick status is live.');
    } catch (error) {
      Alert.alert('Could not update status', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSaving(false);
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
      <Card gradient="thor" elevated style={styles.hero}>
        <LinearGradient colors={gradients.aurora} style={styles.heroGlow} />
        <Row style={styles.heroContent}>
          <Stack gap={spacing.sm} style={styles.heroCopy}>
            <Badge label="ThorLink" tone="thor" icon={RadioTower} />
            <AppText variant="display">Dual-screen social command</AppText>
            <AppText color={colors.textSecondary}>
              A compact PocketNet mode for Thor owners: quick status, friend activity, and screenshot sharing.
            </AppText>
            <Row style={styles.heroActions}>
              <Button label="Quick post" icon={Camera} variant="thor" onPress={() => void screenshotPost()} />
              <Button label="Open feed" compact variant="secondary" onPress={() => router.push('/(tabs)/home')} />
            </Row>
          </Stack>
          <Image source={require('@/assets/images/thorlink-logo.png')} style={styles.logo} contentFit="contain" />
        </Row>
      </Card>

      <View style={styles.dashboardGrid}>
        <ThorLinkCard
          title="Top Screen"
          body="Readable feed and community context stay primary."
          icon={MonitorUp}
          metric="Context"
        />
        <ThorLinkCard
          title="Bottom Screen"
          body="Compact status, friends, and screenshot actions fit the second-screen idea."
          icon={Gamepad2}
          metric="Control"
        />
      </View>

      <Card>
        <Row>
          <View style={styles.statusIcon}>
            <Zap color={colors.thorlinkAccent} size={20} />
          </View>
          <Stack gap={2} style={styles.statusCopy}>
            <AppText variant="sectionTitle">Quick Status</AppText>
            <AppText variant="metadata" color={colors.textMuted}>
              Manual for v1, designed for deeper Thor integrations later.
            </AppText>
          </Stack>
        </Row>
        <TextField value={status} onChangeText={setStatus} placeholder="Trying a new Cocoon layout..." />
        <Button label="Update Thor status" icon={Send} variant="thor" loading={saving} onPress={() => void saveStatus()} />
      </Card>

      <Card>
        <Row>
          <Camera color={colors.accentCyan} size={20} />
          <AppText variant="sectionTitle">Screenshot Share</AppText>
        </Row>
        <TextField
          value={quickPost}
          onChangeText={setQuickPost}
          placeholder="Caption for your next screenshot"
        />
        <Button label="Choose and post image" icon={Camera} variant="secondary" onPress={() => void screenshotPost()} />
      </Card>

      <Stack gap={spacing.sm}>
        <Row style={styles.sectionHeader}>
          <AppText variant="sectionTitle">Friend Activity</AppText>
          <Badge label={`${activeFriends.length} active`} tone="lime" />
        </Row>
        {activeFriends.length ? (
          activeFriends.slice(0, 4).map((friend) => (
            <UserCard
              key={friend.id}
              profile={friend}
              actionLabel="View"
              onOpen={() => router.push(`/user/${friend.id}`)}
              onAction={() => router.push(`/user/${friend.id}`)}
            />
          ))
        ) : (
          <EmptyState
            title="No active friends yet"
            body="ThorLink becomes more useful once friends add current game or status updates."
            icon={Users}
            tone="thor"
          />
        )}
      </Stack>

      <Stack gap={spacing.sm}>
        <Row style={styles.sectionHeader}>
          <AppText variant="sectionTitle">Glance Feed</AppText>
          <Badge label="2-card view" tone="thor" />
        </Row>
        {feed.length ? (
          feed.map((post) => <PostCard key={post.id} post={post} compact />)
        ) : (
          <EmptyState
            title="Nothing to glance at yet"
            body="Your ThorLink feed mirrors your PocketNet social activity in a denser view."
            icon={Sparkles}
            tone="thor"
          />
        )}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 244,
    position: 'relative'
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.card
  },
  heroContent: {
    alignItems: 'center'
  },
  heroCopy: {
    flex: 1,
    minWidth: 0
  },
  heroActions: {
    flexWrap: 'wrap'
  },
  logo: {
    width: 122,
    height: 122,
    borderRadius: radius.xl
  },
  dashboardGrid: {
    gap: spacing.md
  },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.thorlinkAccent}66`,
    backgroundColor: `${colors.thorlinkAccent}18`,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusCopy: {
    flex: 1
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
