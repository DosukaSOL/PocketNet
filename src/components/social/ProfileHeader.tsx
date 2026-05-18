import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { RadioTower, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Button, GlowCard, Row, SegmentedTabs, Stack } from '@/components/ui';
import { DeviceBadge, FrontendBadge } from '@/components/device';
import { SetupCard } from '@/components/social/SetupCard';
import { ProfileSocialLinks } from '@/components/social/ProfileSocialLinks';
import { ProfileStats } from '@/components/social/ProfileStats';
import { colors, gradients, radius, shadows, spacing } from '@/design/tokens';
import { getDeviceProfile, isDualScreenDevice } from '@/lib/devices';
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
  const dualScreen = isDualScreenDevice(profile.favoriteHandheld);
  const device = getDeviceProfile(profile.favoriteHandheld);
  const actionLabel = hasIncomingRequest
    ? 'Accept'
    : isFriend
      ? 'Friends'
      : hasOutgoingRequest
        ? 'Requested'
        : 'Add friend';

  return (
    <Stack gap={spacing.md}>
      <GlowCard tone={dualScreen ? 'focus' : 'cyan'} style={styles.wrap}>
        <View style={styles.banner}>
          {profile.bannerUrl ? (
            <Image source={{ uri: profile.bannerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient colors={dualScreen ? gradients.focus : gradients.hero} style={StyleSheet.absoluteFill} />
          )}
          <View style={styles.bannerOverlay} />
          <View style={[styles.devicePlate, { borderColor: `${device.accentColor}66` }]}>
            <AppText variant="metadata" color={colors.textSecondary}>{device.badgeLabel}</AppText>
          </View>
        </View>

        <View style={styles.identity}>
          <View style={styles.avatarLift}>
            <Avatar
              label={profile.displayName}
              uri={profile.avatarUrl}
              size={88}
              status={profile.currentGame ? 'online' : 'offline'}
              focus={dualScreen}
            />
          </View>
          <Stack gap={spacing.xs} style={styles.nameBlock}>
            <Row>
              <AppText variant="heroTitle" numberOfLines={1} style={styles.name}>
                {profile.displayName}
              </AppText>
              {dualScreen ? <ShieldCheck color={colors.focus} size={18} /> : null}
            </Row>
            <AppText variant="caption" color={colors.textMuted}>
              @{profile.username}
            </AppText>
          </Stack>
        </View>

        {profile.bio ? <AppText color={colors.textSecondary}>{profile.bio}</AppText> : null}

        <Row style={styles.badges}>
          {profile.favoriteHandheld ? <DeviceBadge deviceName={profile.favoriteHandheld} /> : null}
          <FrontendBadge frontend={profile.favoriteFrontend} />
          {profile.currentGame ? (
            <Badge label={`Playing ${profile.currentGame}`} tone="pink" icon={RadioTower} />
          ) : null}
        </Row>

        <ProfileSocialLinks profile={profile} />

        <ProfileStats posts={postCount} friends={friendCount} communities={communityCount} />

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
      </GlowCard>

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
    height: 184,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: -spacing.xl,
    backgroundColor: colors.surfaceStrong
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 6, 13, 0.24)'
  },
  devicePlate: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
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
