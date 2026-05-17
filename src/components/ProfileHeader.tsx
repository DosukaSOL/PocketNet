import { Image } from 'expo-image';
import { Gamepad2, Link as LinkIcon, MonitorSmartphone, RadioTower } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/lib/theme';
import type { Profile } from '@/types/domain';

import { AppText, Avatar, Badge, Button, Card, Row } from './ui';

export function ProfileHeader({
  profile,
  isCurrentUser,
  isFriend,
  hasIncomingRequest,
  hasOutgoingRequest,
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
  onEdit?: () => void;
  onFriend?: () => void;
  onAccept?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
}) {
  return (
    <Card style={styles.wrap} elevated>
      <View style={styles.banner}>
        {profile.bannerUrl ? (
          <Image source={{ uri: profile.bannerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.bannerGlow} />
        )}
      </View>
      <View style={styles.avatarRow}>
        <Avatar label={profile.displayName} uri={profile.avatarUrl} size={74} />
        <View style={styles.profileMeta}>
          <AppText variant="title">{profile.displayName}</AppText>
          <AppText color={colors.textMuted}>@{profile.username}</AppText>
        </View>
      </View>

      {profile.bio ? <AppText>{profile.bio}</AppText> : null}

      <Row style={styles.badges}>
        {profile.favoriteHandheld ? (
          <Badge label={profile.favoriteHandheld} tone={profile.isThorUser ? 'lime' : 'cyan'} icon={Gamepad2} />
        ) : null}
        {profile.favoriteFrontend ? (
          <Badge label={profile.favoriteFrontend} tone="blue" icon={MonitorSmartphone} />
        ) : null}
        {profile.currentGame ? <Badge label={`Playing ${profile.currentGame}`} tone="coral" icon={RadioTower} /> : null}
      </Row>

      <Row style={styles.badges}>
        {Object.entries(profile.socialLinks)
          .filter(([, value]) => Boolean(value))
          .slice(0, 4)
          .map(([name]) => (
            <Badge key={name} label={name} tone="neutral" icon={LinkIcon} />
          ))}
      </Row>

      {profile.setupNotes ? (
        <View style={styles.setup}>
          <AppText variant="small" color={colors.textMuted}>
            PocketCard
          </AppText>
          <AppText>{profile.setupNotes}</AppText>
          <Row style={styles.badges}>
            {profile.favoriteSystems.slice(0, 4).map((system) => (
              <Badge key={system} label={system} tone="neutral" />
            ))}
          </Row>
        </View>
      ) : null}

      <Row style={styles.actions}>
        {isCurrentUser ? (
          <Button label="Edit profile" variant="secondary" onPress={onEdit} />
        ) : hasIncomingRequest ? (
          <Button label="Accept" onPress={onAccept} />
        ) : (
          <Button
            label={isFriend ? 'Friends' : hasOutgoingRequest ? 'Requested' : 'Add friend'}
            variant={isFriend || hasOutgoingRequest ? 'secondary' : 'primary'}
            onPress={onFriend}
          />
        )}
        {!isCurrentUser ? (
          <>
            <Button label="Report" variant="ghost" onPress={onReport} />
            <Button label="Block" variant="danger" onPress={onBlock} />
          </>
        ) : null}
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden'
  },
  banner: {
    height: 118,
    margin: -spacing.lg,
    marginBottom: -spacing.xl,
    backgroundColor: colors.surfaceRaised
  },
  bannerGlow: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderBottomColor: `${colors.cyan}55`,
    borderBottomWidth: 1
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md
  },
  profileMeta: {
    flex: 1,
    paddingBottom: spacing.xs
  },
  badges: {
    flexWrap: 'wrap'
  },
  setup: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    gap: spacing.sm
  },
  actions: {
    flexWrap: 'wrap'
  }
});
