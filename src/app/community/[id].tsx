import { useLocalSearchParams, router } from 'expo-router';
import { Pin, Shield, UserMinus, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { AppText, Avatar, Badge, Button, Card, EmptyState, Row, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { canManageCommunityRoles, canModerateCommunity } from '@/lib/moderation';
import { colors, spacing } from '@/lib/theme';

export default function CommunityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const {
    getCommunity,
    getCommunityPosts,
    getProfile,
    createPost,
    joinCommunity,
    leaveCommunity,
    pinPost,
    setCommunityModerator,
    banCommunityMember,
    report
  } = usePocketData();
  const [body, setBody] = useState('');
  const community = getCommunity(id);

  if (!community) {
    return (
      <Screen>
        <EmptyState title="Community not found" body="This community may have been removed." />
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const activeCommunity = community;
  const posts = getCommunityPosts(activeCommunity.id);
  const isMember = Boolean(profile && activeCommunity.memberIds.includes(profile.id));
  const isModerator = canModerateCommunity(activeCommunity, profile?.id);
  const canManageRoles = canManageCommunityRoles(activeCommunity, profile?.id);

  async function publish() {
    try {
      await createPost({ body, communityId: activeCommunity.id });
      setBody('');
    } catch (error) {
      Alert.alert('Could not post', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function reportCommunity() {
    await report('community', activeCommunity.id, 'Community report');
    Alert.alert('Report sent', 'The community has been queued for review.');
  }

  return (
    <Screen scroll>
      <Button label="Back" compact variant="ghost" onPress={() => router.back()} />
      <Card elevated>
        <AppText variant="heading">{activeCommunity.name}</AppText>
        <AppText color={colors.textMuted}>{activeCommunity.description}</AppText>
        <Row style={styles.badges}>
          <Badge label={`${activeCommunity.memberIds.length} members`} tone="cyan" />
          {isModerator ? <Badge label="Moderator tools" icon={Shield} tone="lime" /> : null}
        </Row>
        <Row>
          <Button
            label={isMember ? 'Leave' : 'Join'}
            icon={isMember ? UserMinus : UserPlus}
            variant={isMember ? 'ghost' : 'primary'}
            onPress={() => void (isMember ? leaveCommunity(activeCommunity.id) : joinCommunity(activeCommunity.id))}
          />
          <Button label="Report" variant="secondary" onPress={() => void reportCommunity()} />
        </Row>
      </Card>

      {isMember ? (
        <Card>
          <AppText variant="title">Post to {activeCommunity.name}</AppText>
          <TextField
            multiline
            value={body}
            onChangeText={setBody}
            placeholder="Share a setup, screenshot note, or community question."
          />
          <Button label="Publish" onPress={() => void publish()} />
        </Card>
      ) : null}

      <Card>
        <AppText variant="title">Members</AppText>
        {activeCommunity.memberIds.map((memberId) => {
          const member = getProfile(memberId);
          const role = activeCommunity.roles[memberId];
          return (
            <Row key={memberId} style={styles.memberRow}>
              <Avatar label={member?.displayName ?? 'Player'} uri={member?.avatarUrl} />
              <View style={styles.memberMeta}>
                <AppText>{member?.displayName ?? 'PocketNet user'}</AppText>
                <AppText variant="small" color={colors.textMuted}>@{member?.username ?? 'unknown'}</AppText>
              </View>
              <Badge label={role ?? 'member'} tone={role === 'creator' ? 'lime' : 'neutral'} />
              {canManageRoles && role !== 'creator' ? (
                <Button
                  compact
                  label={role === 'moderator' ? 'Demote' : 'Mod'}
                  variant="secondary"
                  onPress={() => void setCommunityModerator(activeCommunity.id, memberId, role !== 'moderator')}
                />
              ) : null}
              {canManageRoles && role !== 'creator' ? (
                <Button
                  compact
                  label="Ban"
                  variant="danger"
                  onPress={() => void banCommunityMember(activeCommunity.id, memberId)}
                />
              ) : null}
            </Row>
          );
        })}
      </Card>

      <AppText variant="title">Posts</AppText>
      {posts.length ? (
        posts.map((post) => (
          <View key={post.id} style={styles.postWrap}>
            {isModerator ? (
              <Button label="Pin" icon={Pin} compact variant="secondary" onPress={() => void pinPost(activeCommunity.id, post.id)} />
            ) : null}
            <PostCard post={post} />
          </View>
        ))
      ) : (
        <EmptyState title="No community posts" body="Members can start the first thread." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexWrap: 'wrap'
  },
  memberRow: {
    flexWrap: 'wrap'
  },
  memberMeta: {
    flex: 1,
    minWidth: 110,
    gap: spacing.xs
  },
  postWrap: {
    gap: spacing.sm
  }
});
