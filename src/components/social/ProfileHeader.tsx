import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FileText,
  Handshake,
  Heart,
  MessageSquare,
  RadioTower,
  Trophy,
  Users
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Button, GlowCard, Row, SegmentedTabs, Stack } from '@/components/ui';
import { DeviceBadge, FrontendBadge } from '@/components/device';
import { ProfileBadgeStrip } from '@/components/social/ProfileBadgeStrip';
import { ProfileSocialLinks } from '@/components/social/ProfileSocialLinks';
import { colors, gradients, radius, shadows, spacing } from '@/design/tokens';
import { isDualScreenDevice } from '@/lib/devices';
import type { Profile } from '@/types/domain';

export type ProfileTab = 'posts' | 'replies' | 'friends' | 'followers' | 'communities' | 'achievements';

export const PROFILE_TABS: { label: string; value: ProfileTab }[] = [
  { label: 'Posts', value: 'posts' },
  { label: 'Replies', value: 'replies' },
  { label: 'Friends', value: 'friends' },
  { label: 'Followers', value: 'followers' },
  { label: 'Communities', value: 'communities' },
  { label: 'Achievements', value: 'achievements' }
];

export function ProfileHeader({
  profile,
  isCurrentUser,
  isFriend,
  hasIncomingRequest,
  hasOutgoingRequest,
  postCount = 0,
  replyCount = 0,
  friendCount = 0,
  followerCount = 0,
  communityCount = 0,
  achievementCount = 0,
  achievementPoints,
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
  replyCount?: number;
  friendCount?: number;
  followerCount?: number;
  communityCount?: number;
  achievementCount?: number;
  achievementPoints?: number;
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
  onEdit?: () => void;
  onFriend?: () => void;
  onAccept?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
}) {
  const dualScreen = isDualScreenDevice(profile.favoriteHandheld);
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
              {profile.isPrivate ? <Badge label="Private" tone="warning" compact /> : null}
            </Row>
            <AppText variant="caption" color={colors.textMuted}>
              @{profile.username}
            </AppText>
            <ProfileBadgeStrip badges={profile.badges} />
          </Stack>
        </View>

        {profile.bio ? <AppText color={colors.textSecondary}>{profile.bio}</AppText> : null}

        <Row style={styles.badges}>
          {profile.favoriteHandheld ? <DeviceBadge deviceName={profile.favoriteHandheld} /> : null}
          <FrontendBadge frontend={profile.favoriteFrontend} />
          {profile.currentGame ? (
            <Badge label={`Playing ${profile.currentGame}`} tone="pink" icon={RadioTower} />
          ) : null}
          {profile.raUsername ? (
            <Badge label={`RA · ${profile.raUsername}`} tone="warning" icon={Trophy} compact />
          ) : null}
        </Row>

        <ProfileSocialLinks profile={profile} />

        <View style={styles.statsRow}>
          <StatChip
            icon={FileText}
            label="Posts"
            value={postCount}
            tint={colors.accentCyan}
            active={activeTab === 'posts'}
            onPress={() => onTabChange?.('posts')}
          />
          <StatChip
            icon={MessageSquare}
            label="Replies"
            value={replyCount}
            tint={colors.accentCyan}
            active={activeTab === 'replies'}
            onPress={() => onTabChange?.('replies')}
          />
          <StatChip
            icon={Handshake}
            label="Friends"
            value={friendCount}
            tint={colors.accentPurple}
            active={activeTab === 'friends'}
            onPress={() => onTabChange?.('friends')}
          />
          <StatChip
            icon={Heart}
            label="Followers"
            value={followerCount}
            tint={colors.accentPink}
            active={activeTab === 'followers'}
            onPress={() => onTabChange?.('followers')}
          />
          <StatChip
            icon={Users}
            label="Communities"
            value={communityCount}
            tint={colors.accentCyan}
            active={activeTab === 'communities'}
            onPress={() => onTabChange?.('communities')}
          />
          <StatChip
            icon={Trophy}
            label={achievementPoints != null && profile.raUsername ? `${achievementPoints}pts` : 'Achievements'}
            value={achievementCount}
            tint={colors.warning}
            active={activeTab === 'achievements'}
            onPress={() => onTabChange?.('achievements')}
          />
        </View>

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

      {activeTab && onTabChange ? (
        <SegmentedTabs value={activeTab} onChange={onTabChange} tabs={PROFILE_TABS} />
      ) : null}
    </Stack>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  tint,
  active,
  onPress
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tint: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [
        styles.statChip,
        active && styles.statChipActive,
        active && { borderColor: tint },
        pressed && { opacity: 0.7 }
      ]}
    >
      <Icon color={tint} size={16} />
      <AppText variant="bodyStrong">{value}</AppText>
      <AppText variant="caption" color={colors.textMuted}>{label}</AppText>
    </Pressable>
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
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  statChipActive: {
    backgroundColor: colors.surfaceStrong
  },
  actions: {
    flexWrap: 'wrap'
  }
});
