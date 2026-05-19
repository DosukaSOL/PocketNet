import { router, useFocusEffect } from 'expo-router';
import { Compass, UserX } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { BrandMark } from '@/components/BrandMark';
import { UserCard } from '@/components/social/UserCard';
import {
  AppText,
  Button,
  EmptyState,
  GlowCard,
  Row,
  Screen,
  SegmentedTabs,
  Skeleton,
  Stack
} from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { colors, radius, spacing } from '@/design/tokens';

type FeedKey = 'fyp' | 'explore';

export default function HomeScreen() {
  const { profile } = useAuth();
  const {
    getHomeFeed,
    getExploreFeed,
    getProfile,
    getIncomingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    refresh,
    isLoading
  } = usePocketData();
  const [feedTab, setFeedTab] = useState<FeedKey>('fyp');
  const forYou = useMemo(() => getHomeFeed(), [getHomeFeed]);
  const explore = useMemo(() => getExploreFeed(), [getExploreFeed]);
  const feed = feedTab === 'fyp' ? forYou : explore;
  const requests = getIncomingRequests();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  return (
    <Screen scroll refreshing={isLoading} onRefresh={() => void refresh()}>
      <Stack gap={spacing.sm} style={styles.heroBlock}>
        <BrandMark size={80} />
        <AppText variant="display" style={styles.wordmark}>
          PocketNet
        </AppText>
      </Stack>

      <SegmentedTabs
        value={feedTab}
        onChange={(value) => setFeedTab(value as FeedKey)}
        tabs={[
          { label: 'For You Page', value: 'fyp' },
          { label: 'Explore', value: 'explore' }
        ]}
      />

      {feedTab === 'fyp' && requests.length ? (
        <Stack gap={spacing.sm}>
          <AppText variant="sectionTitle">Friend Requests</AppText>
          {requests.map((request) => {
            const from = getProfile(request.fromUserId);
            return from ? (
              <UserCard
                key={request.id}
                profile={from}
                actionLabel="Accept"
                onOpen={() => router.push(`/user/${from.id}`)}
                onAction={() => void acceptFriendRequest(request.id)}
                secondaryAction={
                  <Button
                    label="Reject"
                    icon={UserX}
                    compact
                    variant="ghost"
                    onPress={() => void rejectFriendRequest(request.id)}
                  />
                }
              />
            ) : null;
          })}
        </Stack>
      ) : null}

      {isLoading && !feed.length ? (
        <Stack>
          {[0, 1, 2].map((item) => (
            <GlowCard key={item}>
              <Row>
                <Skeleton width={50} height={50} radius={25} />
                <Stack gap={spacing.xs} style={styles.skeletonCopy}>
                  <Skeleton width="48%" height={16} />
                  <Skeleton width="30%" height={12} />
                </Stack>
              </Row>
              <Skeleton height={88} radius={radius.lg} />
            </GlowCard>
          ))}
        </Stack>
      ) : feed.length ? (
        feed.map((post) => <PostCard key={post.id} post={post} />)
      ) : feedTab === 'fyp' ? (
        <EmptyState
          title={profile ? 'Your For You Page is waiting' : 'PocketNet is ready when you are'}
          body="Add friends, follow players, or share your first post — their updates land here."
          icon={Compass}
          action={
            <Row style={styles.emptyActions}>
              <Button label="Discover" variant="secondary" onPress={() => router.push('/(tabs)/discover')} />
              <Button label="Create post" onPress={() => router.push('/(tabs)/create')} />
            </Row>
          }
        />
      ) : (
        <EmptyState
          title="Nothing new to explore yet"
          body="Pull to refresh, or check back after other players post."
          icon={Compass}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroBlock: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xs
  },
  wordmark: {
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 1.2
  },
  skeletonCopy: {
    flex: 1
  },
  emptyActions: {
    flexWrap: 'wrap'
  }
});
