export type ID = string;

export type SocialLinks = {
  twitter?: string;
  discord?: string;
  twitch?: string;
  youtube?: string;
  github?: string;
  website?: string;
};

export type Profile = {
  id: ID;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  region?: string;
  socialLinks: SocialLinks;
  favoriteHandheld?: string;
  favoriteHandhelds: string[];
  favoriteFrontend?: string;
  favoriteSystems: string[];
  favoriteGames: string[];
  customHandhelds: string[];
  customFrontends: string[];
  customSystems: string[];
  customGames: string[];
  setupNotes?: string;
  currentGame?: string;
  currentStatus?: string;
  raUsername?: string;
  raPoints?: number;
  raSoftcorePoints?: number;
  raSyncedAt?: string;
  isPrivate: boolean;
  cardBorder: string;
  customBorderUrl?: string;
  xp?: number;
  level?: number;
  badges: string[];
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Follow = {
  followerId: ID;
  followeeId: ID;
  createdAt: string;
};

export type Comment = {
  id: ID;
  postId: ID;
  authorId: ID;
  body: string;
  parentCommentId?: ID;
  createdAt: string;
};

export type Post = {
  id: ID;
  authorId: ID;
  communityId?: ID;
  body: string;
  imageUrls: string[];
  likeIds: ID[];
  comments: Comment[];
  isPinned?: boolean;
  createdAt: string;
};

export type FriendRequest = {
  id: ID;
  fromUserId: ID;
  toUserId: ID;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

export type Friendship = {
  id: ID;
  userAId: ID;
  userBId: ID;
  createdAt: string;
};

export type CommunityRole = 'creator' | 'moderator' | 'member' | 'banned';

export type Community = {
  id: ID;
  slug: string;
  name: string;
  description: string;
  bannerUrl?: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks: SocialLinks;
  cardBorder: string;
  customBorderUrl?: string;
  notifyOnPost: boolean;
  creatorId: ID;
  memberIds: ID[];
  roles: Record<ID, CommunityRole>;
  pinnedPostId?: ID;
  createdAt: string;
};

export type UpdateCommunityInput = {
  name?: string;
  description?: string;
  bio?: string;
  cardBorder?: string;
  customBorderUrl?: string;
  socialLinks?: SocialLinks;
  avatarUri?: string;
  bannerUri?: string;
  /** Pass empty string to clear; undefined to leave unchanged. */
  avatarUrl?: string;
  bannerUrl?: string;
};

export type Notification = {
  id: ID;
  userId: ID;
  actorId?: ID;
  type:
    | 'friend_request'
    | 'friend_accept'
    | 'follow'
    | 'post_like'
    | 'post_comment'
    | 'comment_reply'
    | 'mention'
    | 'community_join'
    | 'community_post'
    | 'achievement'
    | 'level_up'
    | 'moderation';
  title: string;
  body: string;
  postId?: ID;
  commentId?: ID;
  communityId?: ID;
  readAt?: string;
  createdAt: string;
};

export type ReportTargetType = 'user' | 'post' | 'comment' | 'community';

export type Report = {
  id: ID;
  reporterId: ID;
  targetType: ReportTargetType;
  targetId: ID;
  reason: string;
  details?: string;
  createdAt: string;
};

export type Block = {
  blockerId: ID;
  blockedId: ID;
  createdAt: string;
};

export type CreatePostInput = {
  body: string;
  communityId?: ID;
  imageUri?: string;
};

export type UpdateProfileInput = Partial<
  Pick<
    Profile,
    | 'username'
    | 'displayName'
    | 'bio'
    | 'region'
    | 'socialLinks'
    | 'favoriteHandheld'
    | 'favoriteHandhelds'
    | 'favoriteFrontend'
    | 'favoriteSystems'
    | 'favoriteGames'
    | 'customHandhelds'
    | 'customFrontends'
    | 'customSystems'
    | 'customGames'
    | 'setupNotes'
    | 'currentGame'
    | 'currentStatus'
    | 'raUsername'
    | 'isPrivate'
    | 'cardBorder'
    | 'customBorderUrl'
    | 'raPoints'
    | 'raSoftcorePoints'
    | 'raSyncedAt'
  >
> & {
  avatarUri?: string;
  bannerUri?: string;
};

export type CreateCommunityInput = {
  name: string;
  description: string;
  bannerUri?: string;
};

export type DirectMessage = {
  id: ID;
  threadId: ID;
  senderId: ID;
  body: string;
  readAt?: string;
  createdAt: string;
};

export type DirectThread = {
  id: ID;
  participantAId: ID;
  participantBId: ID;
  lastMessageAt?: string;
  createdAt: string;
  lastMessage?: DirectMessage;
  unreadCount: number;
};

export type SupabaseTableName =
  | 'profiles'
  | 'friendships'
  | 'friend_requests'
  | 'blocks'
  | 'posts'
  | 'post_images'
  | 'comments'
  | 'post_reactions'
  | 'communities'
  | 'community_memberships'
  | 'notifications'
  | 'reports';
