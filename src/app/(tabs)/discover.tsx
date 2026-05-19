import { router, useFocusEffect } from 'expo-router';
import { Compass, Plus, Search, UsersRound } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { CommunityCard } from '@/components/CommunityCard';
import { UserCard } from '@/components/social/UserCard';
import { AppText, Badge, Button, EmptyState, GlowCard, Row, Screen, SearchBar, Stack, TextArea, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { colors, spacing } from '@/design/tokens';

export default function DiscoverScreen() {
  const { profile } = useAuth();
  const {
    searchUsers,
    searchCommunities,
    sendFriendRequest,
    acceptFriendRequest,
    joinCommunity,
    leaveCommunity,
    createCommunity,
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    refresh
  } = usePocketData();
  const [query, setQuery] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const users = useMemo(() => searchUsers(query).slice(0, 8), [query, searchUsers]);
  const friendIds = useMemo(() => new Set(getFriends().map((f) => f.id)), [getFriends]);
  const outgoing = useMemo(() => getOutgoingRequests(), [getOutgoingRequests]);
  const incoming = useMemo(() => getIncomingRequests(), [getIncomingRequests]);
  const outgoingTo = useMemo(() => new Set(outgoing.map((r) => r.toUserId)), [outgoing]);
  const incomingFrom = useMemo(
    () => new Map(incoming.map((r) => [r.fromUserId, r.id])),
    [incoming]
  );
  const communities = useMemo(() => searchCommunities(query), [query, searchCommunities]);
  const featuredCommunities = communities.slice(0, 2);
  const otherCommunities = communities.slice(2);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  async function handleCreateCommunity() {
    try {
      if (!communityName.trim()) {
        throw new Error('Name your community first.');
      }
      setCreating(true);
      const community = await createCommunity({
        name: communityName,
        description: communityDescription || 'A new PocketNet community.'
      });
      setCommunityName('');
      setCommunityDescription('');
      router.push(`/community/${community.id}`);
    } catch (error) {
      Alert.alert('Could not create community', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Screen scroll>
      <Row style={styles.heroHeader}>
        <BrandMark size={38} />
        <Stack gap={spacing.xs} style={styles.heroCopy}>
          <Badge label="Discovery" tone="cyan" icon={Compass} />
          <AppText variant="display">Find your next handheld circle</AppText>
          <AppText color={colors.textSecondary}>
            Search players, device crews, frontend setups, and communities that match how you play.
          </AppText>
        </Stack>
      </Row>

      <SearchBar
        icon={Search}
        placeholder="Search users, devices, frontends, communities"
        value={query}
        onChangeText={setQuery}
      />

      <Row style={styles.sectionHeader}>
        <Stack gap={2}>
          <AppText variant="sectionTitle">Players</AppText>
          <AppText variant="metadata" color={colors.textMuted}>
            People, handhelds, and launchers.
          </AppText>
        </Stack>
        <Badge label={`${users.length}`} tone="neutral" />
      </Row>

      {users.length ? (
        users.map((user) => {
          const isSelf = user.id === profile?.id;
          const isFriend = friendIds.has(user.id);
          const hasOutgoing = outgoingTo.has(user.id);
          const incomingRequestId = incomingFrom.get(user.id);
          let actionLabel: string;
          let actionDisabled = false;
          let onAction: (() => void) | undefined;
          if (isSelf) {
            actionLabel = 'You';
            actionDisabled = true;
          } else if (isFriend) {
            actionLabel = 'Friend';
            actionDisabled = true;
          } else if (incomingRequestId) {
            actionLabel = 'Accept';
            onAction = () => void acceptFriendRequest(incomingRequestId);
          } else if (hasOutgoing) {
            actionLabel = 'Requested';
            actionDisabled = true;
          } else {
            actionLabel = 'Add';
            onAction = () => void sendFriendRequest(user.id);
          }
          return (
            <UserCard
              key={user.id}
              profile={user}
              actionLabel={actionLabel}
              actionDisabled={actionDisabled}
              onOpen={() => router.push(`/user/${user.id}`)}
              onAction={onAction}
            />
          );
        })
      ) : (
        <EmptyState
          title="No players found"
          body="Try a device name like Odin, Thor, Retroid, Cocoon, Daijisho, or a username."
          icon={UsersRound}
        />
      )}

      <GlowCard tone="purple">
        <Row style={styles.sectionHeader}>
          <Stack gap={2} style={styles.formCopy}>
            <AppText variant="sectionTitle">Start a Community</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Create a place for setup notes, compatibility tips, screenshots, and handheld rituals.
            </AppText>
          </Stack>
          <Badge label="Creator tools" tone="purple" />
        </Row>
        <TextField label="Name" value={communityName} onChangeText={setCommunityName} placeholder="Dual-Screen Lab" />
        <TextArea
          label="Description"
          value={communityDescription}
          onChangeText={setCommunityDescription}
          placeholder="What belongs here?"
        />
        <Button label="Create community" icon={Plus} loading={creating} onPress={() => void handleCreateCommunity()} />
      </GlowCard>

      <Row style={styles.sectionHeader}>
        <Stack gap={2}>
          <AppText variant="sectionTitle">Communities</AppText>
          <AppText variant="metadata" color={colors.textMuted}>
            Built around handheld identity, not generic groups.
          </AppText>
        </Stack>
        <Badge label={`${communities.length}`} tone="neutral" />
      </Row>

      {communities.length ? (
        <>
          {featuredCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              featured
              onOpen={() => router.push(`/community/${community.id}`)}
              onJoin={() => void joinCommunity(community.id)}
              onLeave={() => void leaveCommunity(community.id)}
            />
          ))}
          {otherCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onOpen={() => router.push(`/community/${community.id}`)}
              onJoin={() => void joinCommunity(community.id)}
              onLeave={() => void leaveCommunity(community.id)}
            />
          ))}
        </>
      ) : (
        <EmptyState
          title="No communities match"
          body="Clear the search or create the community you wanted to find."
          icon={Compass}
          tone="purple"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  formCopy: {
    flex: 1
  },
  heroHeader: {
    alignItems: 'flex-start'
  },
  heroCopy: {
    flex: 1,
    minWidth: 0
  }
});
