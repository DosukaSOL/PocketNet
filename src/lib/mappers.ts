import type { Community, CommunityRole, Post, Profile } from '@/types/domain';

type ProfileRow = Record<string, unknown>;
type PostRow = Record<string, unknown>;
type CommunityRow = Record<string, unknown>;

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function stringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  );
}

export function profileFromRow(row: ProfileRow): Profile {
  return {
    id: String(row.id),
    username: String(row.username ?? ''),
    displayName: String(row.display_name ?? row.username ?? ''),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    bannerUrl: row.banner_url ? String(row.banner_url) : undefined,
    bio: row.bio ? String(row.bio) : undefined,
    region: row.region ? String(row.region) : undefined,
    socialLinks: stringRecord(row.social_links),
    favoriteHandheld: row.favorite_handheld ? String(row.favorite_handheld) : undefined,
    favoriteHandhelds: stringArray(row.favorite_handhelds),
    favoriteFrontend: row.favorite_frontend ? String(row.favorite_frontend) : undefined,
    favoriteSystems: stringArray(row.favorite_systems),
    favoriteGames: stringArray(row.favorite_games),
    customHandhelds: stringArray(row.custom_handhelds),
    customFrontends: stringArray(row.custom_frontends),
    customSystems: stringArray(row.custom_systems),
    customGames: stringArray(row.custom_games),
    setupNotes: row.setup_notes ? String(row.setup_notes) : undefined,
    currentGame: row.current_game ? String(row.current_game) : undefined,
    currentStatus: row.current_status ? String(row.current_status) : undefined,
    raUsername: row.ra_username ? String(row.ra_username) : undefined,
    raPoints: row.ra_points != null ? Number(row.ra_points) : undefined,
    raSoftcorePoints: row.ra_softcore_points != null ? Number(row.ra_softcore_points) : undefined,
    raSyncedAt: row.ra_synced_at ? String(row.ra_synced_at) : undefined,
    isPrivate: Boolean(row.is_private),
    cardBorder: row.card_border ? String(row.card_border) : 'classic',
    customBorderUrl: row.custom_border_url ? String(row.custom_border_url) : undefined,
    xp: row.xp != null ? Number(row.xp) : 0,
    level: row.level != null ? Number(row.level) : 1,
    badges: stringArray(row.badges),
    lastSeenAt: row.last_seen_at ? String(row.last_seen_at) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export function profileToRowPatch(profile: Partial<Profile>) {
  return {
    username: profile.username,
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl,
    banner_url: profile.bannerUrl,
    bio: profile.bio,
    region: profile.region,
    social_links: profile.socialLinks,
    favorite_handheld: profile.favoriteHandheld,
    favorite_handhelds: profile.favoriteHandhelds,
    favorite_frontend: profile.favoriteFrontend,
    favorite_systems: profile.favoriteSystems,
    favorite_games: profile.favoriteGames,
    custom_handhelds: profile.customHandhelds,
    custom_frontends: profile.customFrontends,
    custom_systems: profile.customSystems,
    custom_games: profile.customGames,
    setup_notes: profile.setupNotes,
    current_game: profile.currentGame,
    current_status: profile.currentStatus,
    ra_username: profile.raUsername,
    ra_points: profile.raPoints,
    ra_softcore_points: profile.raSoftcorePoints,
    ra_synced_at: profile.raSyncedAt,
    is_private: profile.isPrivate,
    card_border: profile.cardBorder,
    custom_border_url: profile.customBorderUrl,
    updated_at: new Date().toISOString()
  };
}

export function postFromRow(row: PostRow): Post {
  const imageRows = Array.isArray(row.post_images) ? row.post_images : [];
  const reactionRows = Array.isArray(row.post_reactions) ? row.post_reactions : [];
  const commentRows = Array.isArray(row.comments) ? row.comments : [];

  return {
    id: String(row.id),
    authorId: String(row.author_id),
    communityId: row.community_id ? String(row.community_id) : undefined,
    body: String(row.body ?? ''),
    imageUrls: imageRows
      .map((image) => (image && typeof image === 'object' ? String((image as PostRow).url ?? '') : ''))
      .filter(Boolean),
    likeIds: reactionRows
      .map((reaction) =>
        reaction && typeof reaction === 'object' ? String((reaction as PostRow).user_id ?? '') : ''
      )
      .filter(Boolean),
    comments: commentRows
      .map((comment) => ({
        id: String((comment as PostRow).id),
        postId: String((comment as PostRow).post_id),
        authorId: String((comment as PostRow).author_id),
        body: String((comment as PostRow).body ?? ''),
        parentCommentId: (comment as PostRow).parent_comment_id
          ? String((comment as PostRow).parent_comment_id)
          : undefined,
        createdAt: String((comment as PostRow).created_at)
      }))
      .filter((comment) => comment.id),
    isPinned: Boolean(row.is_pinned),
    createdAt: String(row.created_at)
  };
}

export function communityFromRow(row: CommunityRow, currentUserId?: string): Community {
  const memberships = Array.isArray(row.community_memberships) ? row.community_memberships : [];
  const roles = Object.fromEntries(
    memberships.map((membership) => [
      String((membership as CommunityRow).user_id),
      String((membership as CommunityRow).role) as CommunityRole
    ])
  ) as Record<string, CommunityRole>;

  const myMembership = currentUserId
    ? memberships.find((m) => String((m as CommunityRow).user_id) === currentUserId)
    : undefined;

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description ?? ''),
    bannerUrl: row.banner_url ? String(row.banner_url) : undefined,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    bio: row.bio ? String(row.bio) : undefined,
    socialLinks: stringRecord(row.social_links),
    cardBorder: row.card_border ? String(row.card_border) : 'classic',
    customBorderUrl: row.custom_border_url ? String(row.custom_border_url) : undefined,
    notifyOnPost: Boolean(myMembership && (myMembership as CommunityRow).notify_on_post),
    creatorId: String(row.creator_id),
    memberIds: memberships
      .filter((membership) => String((membership as CommunityRow).role) !== 'banned')
      .map((membership) => String((membership as CommunityRow).user_id)),
    roles,
    pinnedPostId: row.pinned_post_id ? String(row.pinned_post_id) : undefined,
    createdAt: String(row.created_at)
  };
}
