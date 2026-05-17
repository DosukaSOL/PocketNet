import { Image } from 'expo-image';
import { RadioTower, Shield, Users } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Button, Card, Row, Stack } from '@/components/ui';
import { colors, gradients, radius, spacing } from '@/design/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Community } from '@/types/domain';

export function CommunityCard({
  community,
  onOpen,
  onJoin,
  onLeave,
  featured = false
}: {
  community: Community;
  onOpen?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  featured?: boolean;
}) {
  const { profile } = useAuth();
  const isMember = Boolean(profile && community.memberIds.includes(profile.id));
  const role = profile ? community.roles[profile.id] : undefined;

  return (
    <Card pressable onPress={onOpen} elevated={featured} style={featured ? styles.featured : undefined}>
      <View style={styles.banner}>
        {community.bannerUrl ? (
          <Image source={{ uri: community.bannerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.bannerFallback} />
        )}
        <View style={styles.bannerShade} />
        <View style={styles.communityIcon}>
          <RadioTower color={colors.accentCyan} size={20} />
        </View>
      </View>

      <Stack gap={spacing.xs}>
        <AppText variant="sectionTitle">{community.name}</AppText>
        <AppText color={colors.textSecondary} numberOfLines={3}>
          {community.description}
        </AppText>
      </Stack>

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
  featured: {
    borderColor: `${colors.accentCyan}55`
  },
  banner: {
    height: 116,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceStrong
  },
  bannerFallback: {
    flex: 1,
    backgroundColor: gradients.hero[0]
  },
  bannerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 7, 13, 0.28)'
  },
  communityIcon: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.accentCyan}66`,
    backgroundColor: 'rgba(8, 12, 20, 0.82)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badges: {
    flexWrap: 'wrap'
  }
});
