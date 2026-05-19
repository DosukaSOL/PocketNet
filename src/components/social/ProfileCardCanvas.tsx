import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LinearGradientPoint } from 'expo-linear-gradient';

import { getCardBorder, PROFILE_CARD_GEOMETRY } from '@/lib/profileCard';
import type { ProfileCardVariant } from '@/lib/profileCard';
import type { Community, Post, Profile } from '@/types/domain';

type Props = {
  profile: Profile;
  variant: ProfileCardVariant;
  borderId: string;
  posts?: Post[];
  friends?: Profile[];
  communities?: Community[];
  followers?: number;
  achievements?: number;
};

/**
 * Off-screen canvas that renders the user's profile card at the EXACT
 * pixel-perfect dimensions defined in `PROFILE_CARD_GEOMETRY`. Anchored at
 * an absolute position far off-screen so it never participates in the visible
 * layout — `captureRef` still produces a clean PNG from its native view tree.
 *
 * Compact: 1080 × 1620 px (inner 984 × 1524 px)
 * Full:    1080 × 2400 px (inner 984 × 2304 px)
 * 48 px border on all sides.
 */
export const ProfileCardCanvas = forwardRef<View, Props>(function ProfileCardCanvas(
  { profile, variant, borderId, posts = [], friends = [], communities = [], followers = 0, achievements = 0 },
  ref
) {
  const geom = PROFILE_CARD_GEOMETRY[variant];
  const border = getCardBorder(borderId);
  const start: LinearGradientPoint = { x: 0, y: 0 };
  const end: LinearGradientPoint = { x: 1, y: 1 };

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.canvas, { width: geom.width, height: geom.height }]}
    >
      <LinearGradient
        colors={border.gradient as unknown as readonly [string, string, ...string[]]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.inner,
          {
            top: geom.borderThickness,
            left: geom.borderThickness,
            width: geom.innerWidth,
            height: geom.innerHeight,
            borderColor: border.innerStroke ?? 'rgba(255,255,255,0.18)'
          }
        ]}
      >
        <View style={styles.banner}>
          {profile.bannerUrl ? (
            <Image source={{ uri: profile.bannerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient
              colors={['#1E1B3A', '#0B0D1C']}
              style={StyleSheet.absoluteFill}
              start={start}
              end={end}
            />
          )}
        </View>
        <View style={styles.avatarWrap}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackLabel}>
                {profile.displayName.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.identity}>
          <Text style={styles.displayName} numberOfLines={1}>{profile.displayName}</Text>
          <Text style={styles.handle}>@{profile.username}</Text>
          {profile.bio ? (
            <Text style={styles.bio} numberOfLines={variant === 'compact' ? 4 : 6}>
              {profile.bio}
            </Text>
          ) : null}
        </View>

        {variant === 'full' ? (
          <View style={styles.stats}>
            <Stat label="Posts" value={posts.length} />
            <Stat label="Followers" value={followers} />
            <Stat label="Friends" value={friends.length} />
            <Stat label="Communities" value={communities.length} />
            <Stat label="Achievements" value={achievements} />
          </View>
        ) : null}

        {variant === 'full' && posts.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent posts</Text>
            <View style={styles.postGrid}>
              {posts.slice(0, 6).map((post) => (
                <View key={post.id} style={styles.postTile}>
                  {post.imageUrls[0] ? (
                    <Image source={{ uri: post.imageUrls[0] }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  ) : (
                    <Text style={styles.postBody} numberOfLines={5}>{post.body}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {variant === 'full' && friends.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <View style={styles.avatarStrip}>
              {friends.slice(0, 8).map((friend) => (
                <View key={friend.id} style={styles.miniAvatarWrap}>
                  {friend.avatarUrl ? (
                    <Image source={{ uri: friend.avatarUrl }} style={styles.miniAvatar} contentFit="cover" />
                  ) : (
                    <View style={[styles.miniAvatar, styles.avatarFallback]}>
                      <Text style={styles.miniAvatarLabel}>{friend.displayName.slice(0, 1).toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {variant === 'full' && communities.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Communities</Text>
            <View style={styles.chips}>
              {communities.slice(0, 6).map((community) => (
                <View key={community.id} style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1}>{community.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.watermark}>PocketNet</Text>
      </View>

      {border.cornerEmoji ? (
        <>
          <Text style={[styles.corner, { top: 12, left: 16 }]}>{border.cornerEmoji}</Text>
          <Text style={[styles.corner, { top: 12, right: 16 }]}>{border.cornerEmoji}</Text>
          <Text style={[styles.corner, { bottom: 12, left: 16 }]}>{border.cornerEmoji}</Text>
          <Text style={[styles.corner, { bottom: 12, right: 16 }]}>{border.cornerEmoji}</Text>
        </>
      ) : null}
    </View>
  );
});

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    backgroundColor: '#0B0D1C'
  },
  inner: {
    position: 'absolute',
    backgroundColor: '#0B0D1C',
    borderRadius: 56,
    borderWidth: 2,
    padding: 64,
    overflow: 'hidden'
  },
  banner: {
    height: 320,
    marginHorizontal: -64,
    marginTop: -64,
    backgroundColor: '#1E1B3A'
  },
  avatarWrap: {
    marginTop: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#0B0D1C',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: 188,
    height: 188,
    borderRadius: 94
  },
  avatarFallback: {
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarFallbackLabel: {
    color: 'white',
    fontSize: 96,
    fontWeight: '700'
  },
  identity: {
    marginTop: 24,
    gap: 8
  },
  displayName: {
    color: 'white',
    fontSize: 64,
    fontWeight: '700'
  },
  handle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 36
  },
  bio: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 30,
    lineHeight: 42,
    marginTop: 16
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 32
  },
  statBlock: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 18,
    minWidth: 160
  },
  statValue: {
    color: 'white',
    fontSize: 44,
    fontWeight: '700'
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 24
  },
  section: { marginTop: 32, gap: 16 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 28,
    fontWeight: '600'
  },
  postGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  postTile: {
    width: 280,
    height: 200,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    padding: 18
  },
  postBody: { color: 'white', fontSize: 22, lineHeight: 30 },
  avatarStrip: { flexDirection: 'row', gap: 16 },
  miniAvatarWrap: { width: 96, height: 96 },
  miniAvatar: { width: 96, height: 96, borderRadius: 48 },
  miniAvatarLabel: { color: 'white', fontSize: 36, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.5)'
  },
  chipText: { color: 'white', fontSize: 22 },
  watermark: {
    position: 'absolute',
    right: 32,
    bottom: 24,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2
  },
  corner: {
    position: 'absolute',
    fontSize: 40
  }
});
