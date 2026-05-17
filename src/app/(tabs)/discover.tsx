import { router } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { CommunityCard } from '@/components/CommunityCard';
import { AppText, Avatar, Button, Card, Row, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { colors, spacing } from '@/lib/theme';

export default function DiscoverScreen() {
  const { profile } = useAuth();
  const {
    searchUsers,
    searchCommunities,
    sendFriendRequest,
    joinCommunity,
    leaveCommunity,
    createCommunity
  } = usePocketData();
  const [query, setQuery] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const users = useMemo(() => searchUsers(query).slice(0, 8), [query, searchUsers]);
  const communities = useMemo(() => searchCommunities(query), [query, searchCommunities]);

  async function handleCreateCommunity() {
    try {
      if (!communityName.trim()) {
        throw new Error('Name your community first.');
      }
      const community = await createCommunity({
        name: communityName,
        description: communityDescription || 'A new PocketNet community.'
      });
      setCommunityName('');
      setCommunityDescription('');
      router.push(`/community/${community.id}`);
    } catch (error) {
      Alert.alert('Could not create community', error instanceof Error ? error.message : 'Try again.');
    }
  }

  return (
    <Screen scroll>
      <AppText variant="heading">Discover</AppText>
      <TextField
        placeholder="Search users, devices, frontends, communities"
        value={query}
        onChangeText={setQuery}
      />

      <Card>
        <Row>
          <Search color={colors.cyan} size={20} />
          <AppText variant="title">Players</AppText>
        </Row>
        {users.map((user) => (
          <Row key={user.id} style={styles.userRow}>
            <Avatar label={user.displayName} uri={user.avatarUrl} />
            <View style={styles.userMeta}>
              <AppText>{user.displayName}</AppText>
              <AppText variant="small" color={colors.textMuted}>
                @{user.username} · {user.favoriteHandheld ?? 'Handheld player'}
              </AppText>
            </View>
            <Button label="View" compact variant="secondary" onPress={() => router.push(`/user/${user.id}`)} />
            <Button
              label="Add"
              compact
              disabled={user.id === profile?.id}
              onPress={() => void sendFriendRequest(user.id)}
            />
          </Row>
        ))}
      </Card>

      <Card>
        <Row>
          <Plus color={colors.lime} size={20} />
          <AppText variant="title">Create Community</AppText>
        </Row>
        <TextField label="Name" value={communityName} onChangeText={setCommunityName} placeholder="Thor Lab" />
        <TextField
          label="Description"
          value={communityDescription}
          onChangeText={setCommunityDescription}
          placeholder="What belongs here?"
          multiline
        />
        <Button label="Create" icon={Plus} onPress={() => void handleCreateCommunity()} />
      </Card>

      <AppText variant="title">Communities</AppText>
      {communities.map((community) => (
        <CommunityCard
          key={community.id}
          community={community}
          onOpen={() => router.push(`/community/${community.id}`)}
          onJoin={() => void joinCommunity(community.id)}
          onLeave={() => void leaveCommunity(community.id)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexWrap: 'wrap'
  },
  userMeta: {
    flex: 1,
    minWidth: 120,
    gap: spacing.xs
  }
});
