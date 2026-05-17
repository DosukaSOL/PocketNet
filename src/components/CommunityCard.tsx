import { Image } from 'expo-image';
import { Shield, Users } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { colors, radius, spacing } from '@/lib/theme';
import type { Community } from '@/types/domain';

import { AppText, Badge, Button, Card, Row } from './ui';

export function CommunityCard({
  community,
  onOpen,
  onJoin,
  onLeave
}: {
  community: Community;
  onOpen?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
}) {
  const { profile } = useAuth();
  const isMember = Boolean(profile && community.memberIds.includes(profile.id));
  const role = profile ? community.roles[profile.id] : undefined;

  return (
    <Card>
      <View style={styles.banner}>
        {community.bannerUrl ? (
          <Image source={{ uri: community.bannerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.bannerFallback} />
        )}
      </View>
      <Row>
        <View style={styles.titleBlock}>
          <AppText variant="title">{community.name}</AppText>
          <AppText color={colors.textMuted}>{community.description}</AppText>
        </View>
      </Row>
      <Row style={styles.badges}>
        <Badge label={`${community.memberIds.length} members`} icon={Users} tone="cyan" />
        {role ? <Badge label={role} icon={Shield} tone={role === 'creator' ? 'lime' : 'neutral'} /> : null}
      </Row>
      <Row>
        <Button label="Open" variant="secondary" onPress={onOpen} />
        <Button
          label={isMember ? 'Leave' : 'Join'}
          variant={isMember ? 'ghost' : 'primary'}
          onPress={isMember ? onLeave : onJoin}
        />
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 92,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised
  },
  bannerFallback: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: `${colors.cyan}44`
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs
  },
  badges: {
    flexWrap: 'wrap'
  }
});
