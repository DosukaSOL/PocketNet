import type { Community, ID } from '@/types/domain';

export function getCommunityRole(community: Community, userId?: ID) {
  if (!userId) {
    return undefined;
  }
  return community.roles[userId];
}

export function canModerateCommunity(community: Community, userId?: ID) {
  const role = getCommunityRole(community, userId);
  return role === 'creator' || role === 'moderator';
}

export function canManageCommunityRoles(community: Community, userId?: ID) {
  return getCommunityRole(community, userId) === 'creator';
}

export function canDeleteCommunityPost(args: {
  community?: Community;
  userId?: ID;
  postAuthorId: ID;
}) {
  if (!args.userId) {
    return false;
  }

  if (args.userId === args.postAuthorId) {
    return true;
  }

  if (!args.community) {
    return false;
  }

  return canModerateCommunity(args.community, args.userId);
}
