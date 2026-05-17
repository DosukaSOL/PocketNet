import {
  canDeleteCommunityPost,
  canManageCommunityRoles,
  canModerateCommunity
} from '@/lib/moderation';
import type { Community } from '@/types/domain';

const community: Community = {
  id: 'community',
  slug: 'thor-lab',
  name: 'Thor Lab',
  description: 'Dual-screen handheld setups.',
  creatorId: 'creator',
  memberIds: ['creator', 'mod', 'member'],
  roles: {
    creator: 'creator',
    mod: 'moderator',
    member: 'member'
  },
  createdAt: new Date().toISOString()
};

describe('community moderation permissions', () => {
  it('allows creators and moderators to moderate community posts', () => {
    expect(canModerateCommunity(community, 'creator')).toBe(true);
    expect(canModerateCommunity(community, 'mod')).toBe(true);
    expect(canModerateCommunity(community, 'member')).toBe(false);
  });

  it('allows only creators to manage roles', () => {
    expect(canManageCommunityRoles(community, 'creator')).toBe(true);
    expect(canManageCommunityRoles(community, 'mod')).toBe(false);
  });

  it('lets authors delete their own posts and moderators delete community posts', () => {
    expect(canDeleteCommunityPost({ community, userId: 'member', postAuthorId: 'member' })).toBe(true);
    expect(canDeleteCommunityPost({ community, userId: 'mod', postAuthorId: 'member' })).toBe(true);
    expect(canDeleteCommunityPost({ community, userId: 'other', postAuthorId: 'member' })).toBe(false);
  });
});
