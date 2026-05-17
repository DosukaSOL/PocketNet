import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Flag, Pin, Shield, UserMinus, UserPlus, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { StatusComposer } from '@/components/social/StatusComposer';
import { UserCard } from '@/components/social/UserCard';
import { AppText, Avatar, Badge, Button, Card, EmptyState, Row, Screen, Stack, StatPill } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { canManageCommunityRoles, canModerateCommunity } from '@/lib/moderation';
import { colors, gradients, spacing } from '@/design/tokens';

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
  const [posting, setPosting] = useState(false);
  const community = getCommunity(id);

  if (!community) {
    return (
      <Screen>
        <EmptyState
          title="Community not found"
          body="This community may have been removed."
          icon={Users}
          action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const activeCommunity = community;
  const posts = getCommunityPosts(activeCommunity.id);
  const pinnedPost = posts.find((post) => post.id === activeCommunity.pinnedPostId);
  const isMember = Boolean(profile && activeCommunity.memberIds.includes(profile.id));
  const isModerator = canModerateCommunity(activeCommunity, profile?.id);
  const canManageRoles = canManageCommunityRoles(activeCommunity, profile?.id);

  async function publish() {
    try {
      setPosting(true);
      await createPost({ body, communityId: activeCommunity.id });
      setBody('');
    } catch (error) {
      Alert.alert('Could not post', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setPosting(false);
    }
  }

  async function reportCommunity() {
    await report('community', activeCommunity.id, 'Community report');
    Alert.alert('Report sent', 'The community has been queued for review.');
  }

  return (
    <Screen scroll>
      <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />

      <Card elevated style={styles.hero}>
        <View style={styles.banner}>
          {activeCommunity.bannerUrl ? (
            <Image source={{ uri: activeCommunity.bannerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.bannerFallback} />
          )}
          <View style={styles.bannerShade} />
        </View>
        <Stack gap={spacing.sm}>
          <Row style={styles.titleRow}>
            <Stack gap={spacing.xs} style={styles.titleCopy}>
              <Badge label={activeCommunity.slug} tone="cyan" />
              <AppText variant="display">{activeCommunity.name}</AppText>
              <AppText color={colors.textSecondary}>{activeCommunity.description}</AppText>
            </Stack>
            <Avatar label={activeCommunity.name} size={64} thor />
          </Row>
          <Row style={styles.stats}>
            <StatPill label="Members" value={activeCommunity.memberIds.length} />
            <StatPill label="Posts" value={posts.length} />
            <StatPill label="Pinned" value={pinnedPost ? 1 : 0} />
          </Row>
          <Row style={styles.badges}>
            {isModerator ? <Badge label="Moderator tools" icon={Shield} tone="lime" /> : null}
            {isMember ? <Badge label="Joined" tone="cyan" /> : <Badge label="Open community" tone="neutral" />}
          </Row>
          <Row style={styles.actions}>
            <Button
              label={isMember ? 'Leave community' : 'Join community'}
              icon={isMember ? UserMinus : UserPlus}
              variant={isMember ? 'secondary' : 'primary'}
              onPress={() => void (isMember ? leaveCommunity(activeCommunity.id) : joinCommunity(activeCommunity.id))}
            />
            <Button label="Report" icon={Flag} variant="ghost" onPress={() => void reportCommunity()} />
          </Row>
        </Stack>
      </Card>

      {pinnedPost ? (
        <Stack gap={spacing.sm}>
          <Row>
            <Pin color={colors.warning} size={18} />
            <AppText variant="sectionTitle">Pinned Post</AppText>
          </Row>
          <PostCard post={pinnedPost} />
        </Stack>
      ) : null}

      {isMember ? (
        <StatusComposer
          profile={profile}
          value={body}
          onChangeText={setBody}
          onSubmit={() => void publish()}
          loading={posting}
          title={`Post to ${activeCommunity.name}`}
          placeholder="Ask a question, share a compatibility note, or drop a setup win."
        />
      ) : (
        <EmptyState
          title="Join to post"
          body="Members can start threads, ask questions, and add screenshots to this community."
          icon={UserPlus}
          action={<Button label="Join community" onPress={() => void joinCommunity(activeCommunity.id)} />}
        />
      )}

      <Stack gap={spacing.sm}>
        <AppText variant="sectionTitle">Members</AppText>
        {activeCommunity.memberIds.slice(0, 8).map((memberId) => {
          const member = getProfile(memberId);
          const role = activeCommunity.roles[memberId];
          if (!member) return null;
          return (
            <UserCard
              key={memberId}
              profile={member}
              actionLabel="View"
              onOpen={() => router.push(`/user/${member.id}`)}
              onAction={() => router.push(`/user/${member.id}`)}
              secondaryAction={
                canManageRoles && role !== 'creator' ? (
                  <Row style={styles.memberTools}>
                    <Button
                      compact
                      label={role === 'moderator' ? 'Demote' : 'Mod'}
                      variant="secondary"
                      onPress={() => void setCommunityModerator(activeCommunity.id, memberId, role !== 'moderator')}
                    />
                    <Button
                      compact
                      label="Ban"
                      variant="danger"
                      onPress={() => void banCommunityMember(activeCommunity.id, memberId)}
                    />
                  </Row>
                ) : (
                  <Badge label={role ?? 'member'} tone={role === 'creator' ? 'lime' : 'neutral'} />
                )
              }
            />
          );
        })}
      </Stack>

      <Row style={styles.sectionHeader}>
        <AppText variant="sectionTitle">Community Posts</AppText>
        <Badge label={`${posts.length}`} tone="neutral" />
      </Row>
      {posts.length ? (
        posts
          .filter((post) => post.id !== pinnedPost?.id)
          .map((post) => (
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
  hero: {
    paddingTop: 0
  },
  banner: {
    height: 156,
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceStrong
  },
  bannerFallback: {
    flex: 1,
    backgroundColor: gradients.hero[0]
  },
  bannerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 7, 13, 0.32)'
  },
  titleRow: {
    alignItems: 'flex-start'
  },
  titleCopy: {
    flex: 1,
    minWidth: 0
  },
  stats: {
    flexWrap: 'wrap'
  },
  badges: {
    flexWrap: 'wrap'
  },
  actions: {
    flexWrap: 'wrap'
  },
  memberTools: {
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  postWrap: {
    gap: spacing.sm
  }
});
