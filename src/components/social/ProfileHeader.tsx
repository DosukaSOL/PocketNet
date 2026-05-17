import { Image } from 'expo-image';
import { Gamepad2, Link as LinkIcon, MonitorSmartphone, RadioTower, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Button, Card, Row, SegmentedTabs, Stack, StatPill } from '@/components/ui';
import { SetupCard } from '@/components/social/SetupCard';
import { colors, gradients, shadows, spacing } from '@/design/tokens';
import type { Profile } from '@/types/domain';

export type ProfileTab = 'posts' | 'setup' | 'communities';

export function ProfileHeader({
  profile,
  isCurrentUser,
  isFriend,
  hasIncomingRequest,
  hasOutgoingRequest,
  postCount = 0,
  friendCount = 0,
  communityCount = 0,
  activeTab,
  onTabChange,
  onEdit,
  onFriend,
  onAccept,
  onBlock,
  onReport
}: {
  profile: Profile;
  isCurrentUser?: boolean;
  isFriend?: boolean;
  hasIncomingRequest?: boolean;
  hasOutgoingRequest?: boolean;
  postCount?: number;
  friendCount?: number;
  communityCount?: number;
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
  onEdit?: () => void;
  onFriend?: () => void;
  onAccept?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
}) {
  const actionLabel = hasIncomingRequest
    ? 'Accept'
    : isFriend
      ? 'Friends'
      : hasOutgoingRequest
        ? 'Requested'
        : 'Add friend';

  return (
    <Stack gap={spacing.md}>
      <Card style={styles.wrap} elevated>
        <View style={styles.banner}>
          {profile.bannerUrl ? (
            <Image source={{ uri: profile.bannerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.bannerFallback} />
          )}
          <View style={styles.bannerOverlay} />
        </View>

        <View style={styles.identity}>
          <View style={styles.avatarLift}>
            <Avatar
              label={profile.displayName}
              uri={profile.avatarUrl}
              size={88}
              status={profile.currentGame ? 'online' : 'offline'}
              thor={profile.isThorUser}
            />
          </View>
          <Stack gap={spacing.xs} style={styles.nameBlock}>
            <Row>
              <AppText variant="heroTitle" numberOfLines={1} style={styles.name}>
                {profile.displayName}
              </AppText>
              {profile.isThorUser ? <ShieldCheck color={colors.thorlinkAccent} size={18} /> : null}
            </Row>
            <AppText variant="caption" color={colors.textMuted}>
              @{profile.username}
            </AppText>
          </Stack>
        </View>

        {profile.bio ? <AppText color={colors.textSecondary}>{profile.bio}</AppText> : null}

        <Row style={styles.badges}>
          {profile.favoriteHandheld ? (
            <Badge label={profile.favoriteHandheld} tone={profile.isThorUser ? 'thor' : 'cyan'} icon={Gamepad2} />
          ) : null}
          {profile.favoriteFrontend ? (
            <Badge label={profile.favoriteFrontend} tone="purple" icon={MonitorSmartphone} />
          ) : null}
          {profile.currentGame ? (
            <Badge label={`Playing ${profile.currentGame}`} tone="pink" icon={RadioTower} />
          ) : null}
        </Row>

        {Object.entries(profile.socialLinks).some(([, value]) => Boolean(value)) ? (
          <Row style={styles.badges}>
            {Object.entries(profile.socialLinks)
              .filter(([, value]) => Boolean(value))
              .slice(0, 5)
              .map(([name]) => (
                <Badge key={name} label={name} tone="neutral" icon={LinkIcon} compact />
              ))}
          </Row>
        ) : null}

        <Row>
          <StatPill label="Posts" value={postCount} />
          <StatPill label="Friends" value={friendCount} />
          <StatPill label="Places" value={communityCount} />
        </Row>

        <Row style={styles.actions}>
          {isCurrentUser ? (
            <Button label="Edit profile" variant="secondary" onPress={onEdit} />
          ) : (
            <Button
              label={actionLabel}
              variant={isFriend || hasOutgoingRequest ? 'secondary' : 'primary'}
              onPress={hasIncomingRequest ? onAccept : onFriend}
            />
          )}
          {!isCurrentUser ? (
            <>
              <Button label="Report" compact variant="ghost" onPress={onReport} />
              <Button label="Block" compact variant="danger" onPress={onBlock} />
            </>
          ) : null}
        </Row>
      </Card>

      <SetupCard profile={profile} compact />

      {activeTab && onTabChange ? (
        <SegmentedTabs
          value={activeTab}
          onChange={onTabChange}
          tabs={[
            { label: 'Posts', value: 'posts' },
            { label: 'Setup', value: 'setup' },
            { label: 'Communities', value: 'communities' }
          ]}
        />
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    paddingTop: 0,
    ...shadows.card
  },
  banner: {
    height: 154,
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    marginBottom: -spacing.xl,
    backgroundColor: colors.surfaceStrong
  },
  bannerFallback: {
    flex: 1,
    backgroundColor: gradients.hero[0]
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 7, 13, 0.30)'
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md
  },
  avatarLift: {
    marginTop: -spacing.xxxl
  },
  nameBlock: {
    flex: 1,
    paddingBottom: spacing.xs
  },
  name: {
    flex: 1
  },
  badges: {
    flexWrap: 'wrap'
  },
  actions: {
    flexWrap: 'wrap'
  }
});
