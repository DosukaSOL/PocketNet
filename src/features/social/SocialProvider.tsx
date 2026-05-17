import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { createId } from '@/lib/id';
import { communityFromRow, postFromRow, profileFromRow } from '@/lib/mappers';
import { uploadImage } from '@/lib/media';
import {
  previewUserId,
  seedCommunities,
  seedFriendRequests,
  seedFriendships,
  seedNotifications,
  seedPosts,
  seedProfiles
} from '@/lib/mockData';
import {
  canDeleteCommunityPost,
  canManageCommunityRoles,
  canModerateCommunity
} from '@/lib/moderation';
import { supabase } from '@/lib/supabase';
import type {
  Block,
  Community,
  CreateCommunityInput,
  CreatePostInput,
  FriendRequest,
  Friendship,
  ID,
  Notification,
  Post,
  Profile,
  Report,
  ReportTargetType
} from '@/types/domain';

type SocialContextValue = {
  profiles: Profile[];
  posts: Post[];
  communities: Community[];
  friendRequests: FriendRequest[];
  friendships: Friendship[];
  blocks: Block[];
  notifications: Notification[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  getProfile: (id?: ID) => Profile | undefined;
  getCommunity: (id?: ID) => Community | undefined;
  getCommunityPosts: (communityId: ID) => Post[];
  getProfilePosts: (profileId: ID) => Post[];
  getHomeFeed: () => Post[];
  getFriends: () => Profile[];
  getIncomingRequests: () => FriendRequest[];
  getOutgoingRequests: () => FriendRequest[];
  searchUsers: (query: string) => Profile[];
  searchCommunities: (query: string) => Community[];
  createPost: (input: CreatePostInput) => Promise<void>;
  deletePost: (postId: ID) => Promise<void>;
  toggleLike: (postId: ID) => Promise<void>;
  addComment: (postId: ID, body: string) => Promise<void>;
  sendFriendRequest: (toUserId: ID) => Promise<void>;
  acceptFriendRequest: (requestId: ID) => Promise<void>;
  rejectFriendRequest: (requestId: ID) => Promise<void>;
  removeFriend: (profileId: ID) => Promise<void>;
  blockUser: (profileId: ID) => Promise<void>;
  report: (targetType: ReportTargetType, targetId: ID, reason: string, details?: string) => Promise<void>;
  createCommunity: (input: CreateCommunityInput) => Promise<Community>;
  joinCommunity: (communityId: ID) => Promise<void>;
  leaveCommunity: (communityId: ID) => Promise<void>;
  pinPost: (communityId: ID, postId: ID) => Promise<void>;
  setCommunityModerator: (communityId: ID, userId: ID, isModerator: boolean) => Promise<void>;
  banCommunityMember: (communityId: ID, userId: ID) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
};

const SocialContext = createContext<SocialContextValue | undefined>(undefined);

function sortNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function slugify(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function SocialProvider({ children }: PropsWithChildren) {
  const { profile, session, isPreviewMode } = useAuth();
  const currentUserId = profile?.id ?? session?.user.id ?? previewUserId;
  const [profiles, setProfiles] = useState(seedProfiles);
  const [posts, setPosts] = useState(seedPosts);
  const [communities, setCommunities] = useState(seedCommunities);
  const [friendRequests, setFriendRequests] = useState(seedFriendRequests);
  const [friendships, setFriendships] = useState(seedFriendships);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase || isPreviewMode || !session?.user) {
      return;
    }

    setIsLoading(true);

    try {
      const [profilesResult, postsResult, communitiesResult, friendshipsResult, requestsResult] =
        await Promise.all([
          supabase.from('profiles').select('*').order('updated_at', { ascending: false }),
          supabase
            .from('posts')
            .select('*, post_images(*), post_reactions(*), comments(*)')
            .order('created_at', { ascending: false })
            .limit(80),
          supabase
            .from('communities')
            .select('*, community_memberships(*)')
            .order('created_at', { ascending: false }),
          supabase.from('friendships').select('*'),
          supabase.from('friend_requests').select('*').eq('status', 'pending')
        ]);

      if (profilesResult.data) {
        setProfiles(profilesResult.data.map(profileFromRow));
      }

      if (postsResult.data) {
        setPosts(postsResult.data.map(postFromRow));
      }

      if (communitiesResult.data) {
        setCommunities(communitiesResult.data.map(communityFromRow));
      }

      if (friendshipsResult.data) {
        setFriendships(
          friendshipsResult.data.map((row) => ({
            id: String(row.id),
            userAId: String(row.user_a_id),
            userBId: String(row.user_b_id),
            createdAt: String(row.created_at)
          }))
        );
      }

      if (requestsResult.data) {
        setFriendRequests(
          requestsResult.data.map((row) => ({
            id: String(row.id),
            fromUserId: String(row.from_user_id),
            toUserId: String(row.to_user_id),
            status: String(row.status) as FriendRequest['status'],
            createdAt: String(row.created_at)
          }))
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [isPreviewMode, session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setProfiles((items) => {
      const existing = items.some((item) => item.id === profile.id);
      return existing
        ? items.map((item) => (item.id === profile.id ? profile : item))
        : [profile, ...items];
    });
  }, [profile]);

  const getProfile = useCallback(
    (id?: ID) => profiles.find((item) => item.id === id),
    [profiles]
  );

  const getCommunity = useCallback(
    (id?: ID) => communities.find((item) => item.id === id),
    [communities]
  );

  const isBlocked = useCallback(
    (profileId: ID) =>
      blocks.some(
        (block) =>
          (block.blockerId === currentUserId && block.blockedId === profileId) ||
          (block.blockerId === profileId && block.blockedId === currentUserId)
      ),
    [blocks, currentUserId]
  );

  const getCommunityPosts = useCallback(
    (communityId: ID) => sortNewest(posts.filter((post) => post.communityId === communityId)),
    [posts]
  );

  const getProfilePosts = useCallback(
    (profileId: ID) => sortNewest(posts.filter((post) => post.authorId === profileId)),
    [posts]
  );

  const getFriends = useCallback(() => {
    const friendIds = friendships
      .filter((friendship) => [friendship.userAId, friendship.userBId].includes(currentUserId))
      .map((friendship) =>
        friendship.userAId === currentUserId ? friendship.userBId : friendship.userAId
      );

    return profiles.filter((item) => friendIds.includes(item.id) && !isBlocked(item.id));
  }, [currentUserId, friendships, isBlocked, profiles]);

  const getHomeFeed = useCallback(() => {
    const friendIds = getFriends().map((friend) => friend.id);
    const joinedCommunityIds = communities
      .filter((community) => community.memberIds.includes(currentUserId))
      .map((community) => community.id);

    return sortNewest(
      posts.filter(
        (post) =>
          !isBlocked(post.authorId) &&
          (post.authorId === currentUserId ||
            friendIds.includes(post.authorId) ||
            (post.communityId && joinedCommunityIds.includes(post.communityId)))
      )
    );
  }, [communities, currentUserId, getFriends, isBlocked, posts]);

  const getIncomingRequests = useCallback(
    () =>
      friendRequests.filter(
        (request) => request.toUserId === currentUserId && request.status === 'pending'
      ),
    [currentUserId, friendRequests]
  );

  const getOutgoingRequests = useCallback(
    () =>
      friendRequests.filter(
        (request) => request.fromUserId === currentUserId && request.status === 'pending'
      ),
    [currentUserId, friendRequests]
  );

  const searchUsers = useCallback(
    (query: string) => {
      const normalized = normalize(query);
      return profiles.filter(
        (item) =>
          item.id !== currentUserId &&
          !isBlocked(item.id) &&
          (!normalized ||
            item.username.toLowerCase().includes(normalized) ||
            item.displayName.toLowerCase().includes(normalized) ||
            item.favoriteHandheld?.toLowerCase().includes(normalized) ||
            item.favoriteFrontend?.toLowerCase().includes(normalized))
      );
    },
    [currentUserId, isBlocked, profiles]
  );

  const searchCommunities = useCallback(
    (query: string) => {
      const normalized = normalize(query);
      return communities.filter(
        (community) =>
          !normalized ||
          community.name.toLowerCase().includes(normalized) ||
          community.description.toLowerCase().includes(normalized)
      );
    },
    [communities]
  );

  const createPost = useCallback(
    async (input: CreatePostInput) => {
      if (!profile) {
        throw new Error('Create a profile before posting.');
      }

      const body = input.body.trim();
      if (!body && !input.imageUri) {
        throw new Error('Write something or choose an image before posting.');
      }

      const timestamp = new Date().toISOString();
      const imageUrl = input.imageUri
        ? await uploadImage({ bucket: 'post-images', userId: currentUserId, uri: input.imageUri })
        : undefined;

      const optimisticPost: Post = {
        id: createId('post'),
        authorId: currentUserId,
        communityId: input.communityId,
        body,
        imageUrls: imageUrl ? [imageUrl] : [],
        likeIds: [],
        comments: [],
        createdAt: timestamp
      };

      setPosts((items) => [optimisticPost, ...items]);

      if (supabase && session?.user) {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            author_id: currentUserId,
            community_id: input.communityId,
            body,
            created_at: timestamp
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (imageUrl) {
          await supabase.from('post_images').insert({
            post_id: data.id,
            author_id: currentUserId,
            url: imageUrl
          });
        }

        setPosts((items) =>
          items.map((post) =>
            post.id === optimisticPost.id ? { ...optimisticPost, id: String(data.id) } : post
          )
        );
      }
    },
    [currentUserId, profile, session]
  );

  const deletePost = useCallback(
    async (postId: ID) => {
      const target = posts.find((post) => post.id === postId);
      if (!target) {
        return;
      }

      const community = target.communityId ? getCommunity(target.communityId) : undefined;

      if (!canDeleteCommunityPost({ community, userId: currentUserId, postAuthorId: target.authorId })) {
        throw new Error('Only the author or community moderators can delete this post.');
      }

      setPosts((items) => items.filter((post) => post.id !== postId));
      if (supabase && session?.user) {
        await supabase.from('posts').delete().eq('id', postId);
      }
    },
    [currentUserId, getCommunity, posts, session]
  );

  const toggleLike = useCallback(
    async (postId: ID) => {
      const target = posts.find((post) => post.id === postId);
      if (!target) {
        return;
      }

      const hasLiked = target.likeIds.includes(currentUserId);
      setPosts((items) =>
        items.map((post) =>
          post.id === postId
            ? {
                ...post,
                likeIds: hasLiked
                  ? post.likeIds.filter((id) => id !== currentUserId)
                  : [...post.likeIds, currentUserId]
              }
            : post
        )
      );

      if (supabase && session?.user) {
        if (hasLiked) {
          await supabase
            .from('post_reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUserId);
        } else {
          await supabase.from('post_reactions').upsert({
            post_id: postId,
            user_id: currentUserId,
            reaction: 'like'
          });
        }
      }
    },
    [currentUserId, posts, session]
  );

  const addComment = useCallback(
    async (postId: ID, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) {
        return;
      }

      const comment = {
        id: createId('comment'),
        postId,
        authorId: currentUserId,
        body: trimmed,
        createdAt: new Date().toISOString()
      };

      setPosts((items) =>
        items.map((post) =>
          post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
        )
      );

      if (supabase && session?.user) {
        await supabase.from('comments').insert({
          post_id: postId,
          author_id: currentUserId,
          body: trimmed
        });
      }
    },
    [currentUserId, session]
  );

  const sendFriendRequest = useCallback(
    async (toUserId: ID) => {
      if (toUserId === currentUserId || isBlocked(toUserId)) {
        return;
      }

      const exists = friendRequests.some(
        (request) =>
          request.status === 'pending' &&
          ((request.fromUserId === currentUserId && request.toUserId === toUserId) ||
            (request.fromUserId === toUserId && request.toUserId === currentUserId))
      );

      if (exists) {
        return;
      }

      const request: FriendRequest = {
        id: createId('request'),
        fromUserId: currentUserId,
        toUserId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      setFriendRequests((items) => [request, ...items]);
      setNotifications((items) => [
        {
          id: createId('notif'),
          userId: toUserId,
          actorId: currentUserId,
          type: 'friend_request',
          title: 'New friend request',
          body: `${profile?.displayName ?? 'A player'} wants to connect.`,
          createdAt: request.createdAt
        },
        ...items
      ]);

      if (supabase && session?.user) {
        await supabase.from('friend_requests').insert({
          from_user_id: currentUserId,
          to_user_id: toUserId
        });
      }
    },
    [currentUserId, friendRequests, isBlocked, profile, session]
  );

  const acceptFriendRequest = useCallback(
    async (requestId: ID) => {
      const request = friendRequests.find((item) => item.id === requestId);
      if (!request || request.toUserId !== currentUserId) {
        return;
      }

      const friendship: Friendship = {
        id: createId('friend'),
        userAId: request.fromUserId,
        userBId: request.toUserId,
        createdAt: new Date().toISOString()
      };

      setFriendRequests((items) =>
        items.map((item) => (item.id === requestId ? { ...item, status: 'accepted' } : item))
      );
      setFriendships((items) => [friendship, ...items]);

      if (supabase && session?.user) {
        await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
        await supabase.from('friendships').insert({
          user_a_id: request.fromUserId,
          user_b_id: request.toUserId
        });
      }
    },
    [currentUserId, friendRequests, session]
  );

  const rejectFriendRequest = useCallback(
    async (requestId: ID) => {
      setFriendRequests((items) =>
        items.map((request) =>
          request.id === requestId && request.toUserId === currentUserId
            ? { ...request, status: 'rejected' }
            : request
        )
      );

      if (supabase && session?.user) {
        await supabase.from('friend_requests').update({ status: 'rejected' }).eq('id', requestId);
      }
    },
    [currentUserId, session]
  );

  const removeFriend = useCallback(
    async (profileId: ID) => {
      setFriendships((items) =>
        items.filter(
          (friendship) =>
            !(
              [friendship.userAId, friendship.userBId].includes(currentUserId) &&
              [friendship.userAId, friendship.userBId].includes(profileId)
            )
        )
      );

      if (supabase && session?.user) {
        await supabase
          .from('friendships')
          .delete()
          .or(
            `and(user_a_id.eq.${currentUserId},user_b_id.eq.${profileId}),and(user_a_id.eq.${profileId},user_b_id.eq.${currentUserId})`
          );
      }
    },
    [currentUserId, session]
  );

  const blockUser = useCallback(
    async (profileId: ID) => {
      if (profileId === currentUserId) {
        return;
      }

      const block: Block = {
        blockerId: currentUserId,
        blockedId: profileId,
        createdAt: new Date().toISOString()
      };

      setBlocks((items) => [block, ...items]);
      setFriendships((items) =>
        items.filter(
          (friendship) =>
            ![friendship.userAId, friendship.userBId].includes(currentUserId) ||
            ![friendship.userAId, friendship.userBId].includes(profileId)
        )
      );
      setFriendRequests((items) =>
        items.filter(
          (request) =>
            ![request.fromUserId, request.toUserId].includes(currentUserId) ||
            ![request.fromUserId, request.toUserId].includes(profileId)
        )
      );

      if (supabase && session?.user) {
        await supabase.from('blocks').upsert({
          blocker_id: currentUserId,
          blocked_id: profileId
        });
      }
    },
    [currentUserId, session]
  );

  const report = useCallback(
    async (targetType: ReportTargetType, targetId: ID, reason: string, details?: string) => {
      const newReport: Report = {
        id: createId('report'),
        reporterId: currentUserId,
        targetType,
        targetId,
        reason,
        details,
        createdAt: new Date().toISOString()
      };

      setReports((items) => [newReport, ...items]);

      if (supabase && session?.user) {
        await supabase.from('reports').insert({
          reporter_id: currentUserId,
          target_type: targetType,
          target_id: targetId,
          reason,
          details
        });
      }
    },
    [currentUserId, session]
  );

  const createCommunity = useCallback(
    async (input: CreateCommunityInput) => {
      const timestamp = new Date().toISOString();
      const bannerUrl = input.bannerUri
        ? await uploadImage({
            bucket: 'community-banners',
            userId: currentUserId,
            uri: input.bannerUri
          })
        : undefined;
      const community: Community = {
        id: createId('community'),
        slug: slugify(input.name),
        name: input.name.trim(),
        description: input.description.trim(),
        bannerUrl,
        creatorId: currentUserId,
        memberIds: [currentUserId],
        roles: { [currentUserId]: 'creator' },
        createdAt: timestamp
      };

      setCommunities((items) => [community, ...items]);

      if (supabase && session?.user) {
        const { data, error } = await supabase
          .from('communities')
          .insert({
            slug: community.slug,
            name: community.name,
            description: community.description,
            banner_url: bannerUrl,
            creator_id: currentUserId
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        await supabase.from('community_memberships').insert({
          community_id: data.id,
          user_id: currentUserId,
          role: 'creator'
        });

        const persisted = { ...community, id: String(data.id) };
        setCommunities((items) =>
          items.map((item) => (item.id === community.id ? persisted : item))
        );
        return persisted;
      }

      return community;
    },
    [currentUserId, session]
  );

  const joinCommunity = useCallback(
    async (communityId: ID) => {
      setCommunities((items) =>
        items.map((community) =>
          community.id === communityId && !community.memberIds.includes(currentUserId)
            ? {
                ...community,
                memberIds: [...community.memberIds, currentUserId],
                roles: { ...community.roles, [currentUserId]: 'member' }
              }
            : community
        )
      );

      if (supabase && session?.user) {
        await supabase.from('community_memberships').upsert({
          community_id: communityId,
          user_id: currentUserId,
          role: 'member'
        });
      }
    },
    [currentUserId, session]
  );

  const leaveCommunity = useCallback(
    async (communityId: ID) => {
      const community = getCommunity(communityId);
      if (community?.creatorId === currentUserId) {
        throw new Error('Transfer or delete the community before the creator leaves.');
      }

      setCommunities((items) =>
        items.map((item) =>
          item.id === communityId
            ? {
                ...item,
                memberIds: item.memberIds.filter((id) => id !== currentUserId),
                roles: Object.fromEntries(
                  Object.entries(item.roles).filter(([userId]) => userId !== currentUserId)
                )
              }
            : item
        )
      );

      if (supabase && session?.user) {
        await supabase
          .from('community_memberships')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', currentUserId);
      }
    },
    [currentUserId, getCommunity, session]
  );

  const pinPost = useCallback(
    async (communityId: ID, postId: ID) => {
      const community = getCommunity(communityId);
      if (!community || !canModerateCommunity(community, currentUserId)) {
        throw new Error('Only community creators or moderators can pin posts.');
      }

      setCommunities((items) =>
        items.map((item) => (item.id === communityId ? { ...item, pinnedPostId: postId } : item))
      );
      setPosts((items) =>
        items.map((post) =>
          post.communityId === communityId ? { ...post, isPinned: post.id === postId } : post
        )
      );

      if (supabase && session?.user) {
        await supabase.from('communities').update({ pinned_post_id: postId }).eq('id', communityId);
      }
    },
    [currentUserId, getCommunity, session]
  );

  const setCommunityModerator = useCallback(
    async (communityId: ID, userId: ID, isModerator: boolean) => {
      const community = getCommunity(communityId);
      if (!community || !canManageCommunityRoles(community, currentUserId)) {
        throw new Error('Only the community creator can manage moderators.');
      }

      setCommunities((items) =>
        items.map((item) =>
          item.id === communityId
            ? {
                ...item,
                roles: { ...item.roles, [userId]: isModerator ? 'moderator' : 'member' }
              }
            : item
        )
      );

      if (supabase && session?.user) {
        await supabase
          .from('community_memberships')
          .update({ role: isModerator ? 'moderator' : 'member' })
          .eq('community_id', communityId)
          .eq('user_id', userId);
      }
    },
    [currentUserId, getCommunity, session]
  );

  const banCommunityMember = useCallback(
    async (communityId: ID, userId: ID) => {
      const community = getCommunity(communityId);
      if (!community || !canManageCommunityRoles(community, currentUserId)) {
        throw new Error('Only the community creator can ban members.');
      }

      setCommunities((items) =>
        items.map((item) =>
          item.id === communityId
            ? {
                ...item,
                memberIds: item.memberIds.filter((id) => id !== userId),
                roles: { ...item.roles, [userId]: 'banned' }
              }
            : item
        )
      );

      if (supabase && session?.user) {
        await supabase.from('community_memberships').upsert({
          community_id: communityId,
          user_id: userId,
          role: 'banned'
        });
      }
    },
    [currentUserId, getCommunity, session]
  );

  const markNotificationsRead = useCallback(async () => {
    const readAt = new Date().toISOString();
    setNotifications((items) =>
      items.map((notification) =>
        notification.userId === currentUserId ? { ...notification, readAt } : notification
      )
    );

    if (supabase && session?.user) {
      await supabase
        .from('notifications')
        .update({ read_at: readAt })
        .eq('user_id', currentUserId)
        .is('read_at', null);
    }
  }, [currentUserId, session]);

  const value = useMemo<SocialContextValue>(
    () => ({
      profiles,
      posts,
      communities,
      friendRequests,
      friendships,
      blocks,
      notifications: notifications.filter((notification) => notification.userId === currentUserId),
      isLoading,
      refresh,
      getProfile,
      getCommunity,
      getCommunityPosts,
      getProfilePosts,
      getHomeFeed,
      getFriends,
      getIncomingRequests,
      getOutgoingRequests,
      searchUsers,
      searchCommunities,
      createPost,
      deletePost,
      toggleLike,
      addComment,
      sendFriendRequest,
      acceptFriendRequest,
      rejectFriendRequest,
      removeFriend,
      blockUser,
      report,
      createCommunity,
      joinCommunity,
      leaveCommunity,
      pinPost,
      setCommunityModerator,
      banCommunityMember,
      markNotificationsRead
    }),
    [
      acceptFriendRequest,
      addComment,
      banCommunityMember,
      blockUser,
      blocks,
      communities,
      createCommunity,
      createPost,
      currentUserId,
      deletePost,
      friendRequests,
      friendships,
      getCommunity,
      getCommunityPosts,
      getFriends,
      getHomeFeed,
      getIncomingRequests,
      getOutgoingRequests,
      getProfile,
      getProfilePosts,
      isLoading,
      joinCommunity,
      leaveCommunity,
      markNotificationsRead,
      notifications,
      pinPost,
      posts,
      profiles,
      refresh,
      rejectFriendRequest,
      removeFriend,
      report,
      searchCommunities,
      searchUsers,
      sendFriendRequest,
      setCommunityModerator,
      toggleLike
    ]
  );

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function usePocketData() {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('usePocketData must be used inside SocialProvider');
  }
  return context;
}
