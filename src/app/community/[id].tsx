import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Bell, BellOff, ExternalLink, Flag, Pencil, Pin, PinOff, Shield, UserMinus, UserPlus, Users } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { AnimatedCardBorder } from '@/components/social/AnimatedCardBorder';
import { GifPicker } from '@/components/social/GifPicker';
import { StatusComposer } from '@/components/social/StatusComposer';
import { UserCard } from '@/components/social/UserCard';
import { AppText, Avatar, Badge, Button, EmptyState, GlowCard, Row, Screen, Stack, StatPill } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { canManageCommunityRoles, canModerateCommunity } from '@/lib/moderation';
import { pickGif, pickImage } from '@/lib/media';
import { colors, gradients, radius, spacing } from '@/design/tokens';

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
    unpinPost,
    setCommunityModerator,
    banCommunityMember,
    setCommunityNotify,
    report,
    refresh,
    isLoading
  } = usePocketData();
  const [body, setBody] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [posting, setPosting] = useState(false);
  const [tenorVisible, setTenorVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const community = getCommunity(id);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

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
  const isOwner = activeCommunity.creatorId === profile?.id;
  const socialEntries = Object.entries(activeCommunity.socialLinks ?? {}).filter(
    ([, value]) => typeof value === 'string' && value.length > 0
  ) as [string, string][];

  async function publish() {
    try {
      setPosting(true);
      await createPost({ body, communityId: activeCommunity.id, imageUri });
      setBody('');
      setImageUri(undefined);
    } catch (error) {
      Alert.alert('Could not post', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setPosting(false);
    }
  }

  async function chooseImage() {
    try {
      const image = await pickImage();
      if (image) setImageUri(image.uri);
    } catch (error) {
      Alert.alert('Could not pick image', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function chooseGif() {
    try {
      const image = await pickGif();
      if (image) setImageUri(image.uri);
    } catch (error) {
      Alert.alert('Could not pick GIF', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function reportCommunity() {
    await report('community', activeCommunity.id, 'Community report');
    Alert.alert('Report sent', 'The community has been queued for review.');
  }

  return (
    <Screen scroll refreshing={refreshing || isLoading} onRefresh={() => void onRefresh()}>
      <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />

      <AnimatedCardBorder preset={activeCommunity.cardBorder} customBorderUrl={activeCommunity.customBorderUrl}>
        <GlowCard tone="purple" style={styles.hero}>
        <View style={styles.banner}>
          {activeCommunity.bannerUrl ? (
            <Image source={{ uri: activeCommunity.bannerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient colors={gradients.magenta} style={StyleSheet.absoluteFill} />
          )}
          <View style={styles.bannerShade} />
        </View>
        <Stack gap={spacing.sm}>
          <Row style={styles.titleRow}>
            <Stack gap={spacing.xs} style={styles.titleCopy}>
              <Badge label={activeCommunity.slug} tone="cyan" />
              <AppText variant="display">{activeCommunity.name}</AppText>
              <AppText color={colors.textSecondary}>{activeCommunity.description}</AppText>
              {activeCommunity.bio ? (
                <AppText variant="caption" color={colors.textSecondary}>{activeCommunity.bio}</AppText>
              ) : null}
            </Stack>
            <Avatar label={activeCommunity.name} uri={activeCommunity.avatarUrl} size={64} focus />
          </Row>
          {socialEntries.length ? (
            <Row style={styles.badges}>
              {socialEntries.map(([key, url]) => (
                <Button
                  key={key}
                  label={key}
                  icon={ExternalLink}
                  variant="ghost"
                  compact
                  onPress={() => void Linking.openURL(url)}
                />
              ))}
            </Row>
          ) : null}
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
            {isMember ? (
              <Button
                label={activeCommunity.notifyOnPost ? 'Notifs on' : 'Notifs off'}
                icon={activeCommunity.notifyOnPost ? Bell : BellOff}
                variant="ghost"
                onPress={() => void setCommunityNotify(activeCommunity.id, !activeCommunity.notifyOnPost)}
              />
            ) : null}
            {isOwner ? (
              <Button
                label="Edit community"
                icon={Pencil}
                variant="secondary"
                onPress={() => router.push(`/community/edit/${activeCommunity.id}` as never)}
              />
            ) : null}
            <Button label="Report" icon={Flag} variant="ghost" onPress={() => void reportCommunity()} />
          </Row>
        </Stack>
        </GlowCard>
      </AnimatedCardBorder>

      {pinnedPost ? (
        <Stack gap={spacing.sm}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Row>
              <Pin color={colors.warning} size={18} />
              <AppText variant="sectionTitle">Pinned Post</AppText>
            </Row>
            {isModerator ? (
              <Button
                label="Unpin"
                icon={PinOff}
                compact
                variant="ghost"
                onPress={() => void unpinPost(activeCommunity.id)}
              />
            ) : null}
          </Row>
          <PostCard post={pinnedPost} />
        </Stack>
      ) : null}

      {isMember ? (
        <>
          <StatusComposer
            profile={profile}
            value={body}
            onChangeText={setBody}
            imageUri={imageUri}
            onChooseImage={() => void chooseImage()}
            onChooseGif={() => void chooseGif()}
            onChooseTenor={() => setTenorVisible(true)}
            onRemoveImage={() => setImageUri(undefined)}
            onSubmit={() => void publish()}
            loading={posting}
            title={`Post to ${activeCommunity.name}`}
            placeholder="Ask a question, share a compatibility note, or drop a setup win."
          />
          <GifPicker
            visible={tenorVisible}
            onClose={() => setTenorVisible(false)}
            onPick={(url) => setImageUri(url)}
          />
        </>
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
    paddingTop: 0,
    overflow: 'hidden'
  },
  banner: {
    height: 172,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceStrong,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden'
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
