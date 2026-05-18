import type {
  Community,
  FriendRequest,
  Friendship,
  Notification,
  Post,
  Profile
} from '@/types/domain';

const now = new Date().toISOString();

export const previewUserId = 'preview-user';

export const seedProfiles: Profile[] = [
  {
    id: previewUserId,
    username: 'pocketpilot',
    displayName: 'Pocket Pilot',
    bio: 'Building the cleanest handheld setup one shortcut at a time.',
    region: 'Europe',
    socialLinks: {
      github: 'pocketnet',
      website: 'https://pocketnet.example.com'
    },
    favoriteHandheld: 'AYN Thor',
    favoriteFrontend: 'Cocoon',
    favoriteSystems: ['Nintendo DS', 'PlayStation 2', 'Android'],
    favoriteGames: ['Chrono Trigger', 'Balatro', 'Ridge Racer Type 4'],
    setupNotes: 'Dual-screen profile, compact quick actions, docked capture workflow.',
    currentGame: 'Chrono Trigger',
    currentStatus: 'Testing a clean split-screen dashboard.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'mira',
    username: 'miracade',
    displayName: 'Mira',
    bio: 'Arcade-first, shaders always.',
    region: 'North America',
    socialLinks: { twitch: 'miracade' },
    favoriteHandheld: 'Retroid Pocket 5',
    favoriteFrontend: 'Daijisho',
    favoriteSystems: ['Arcade', 'Dreamcast', 'Game Boy Advance'],
    favoriteGames: ['Dead Cells', 'Metroid Prime'],
    setupNotes: 'Hotkeys mapped for save states, fast-forward, and screenshot capture.',
    currentGame: 'Marvel vs. Capcom 2',
    currentStatus: 'Tuning scanlines tonight.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'ren',
    username: 'rensaves',
    displayName: 'Ren',
    bio: 'ES-DE themes, pocket RPGs, and stubbornly tidy ROM folders.',
    region: 'Japan',
    socialLinks: { youtube: 'rensaves' },
    favoriteHandheld: 'AYANEO Pocket DS',
    favoriteFrontend: 'ES-DE',
    favoriteSystems: ['Nintendo 3DS', 'PSP', 'GameCube'],
    favoriteGames: ['Persona 4 Golden', 'Stardew Valley'],
    setupNotes: 'Per-system bezels and a dedicated screenshots album.',
    currentGame: 'Fantasy Life',
    currentStatus: 'Sharing a setup card soon.',
    createdAt: now,
    updatedAt: now
  }
];

export const seedCommunities: Community[] = [
  {
    id: 'dual-screen-lab',
    slug: 'dual-screen-lab',
    name: 'Dual-Screen Lab',
    description: 'Dual-screen setups, split-display workflows, and clamshell-first play styles.',
    creatorId: previewUserId,
    memberIds: [previewUserId, 'ren'],
    roles: { [previewUserId]: 'creator', ren: 'member' },
    createdAt: now
  },
  {
    id: 'frontend-tuning',
    slug: 'frontend-tuning',
    name: 'Frontend Tuning',
    description: 'Cocoon, Daijisho, ES-DE, Beacon, themes, metadata, and clean launch flows.',
    creatorId: 'mira',
    memberIds: [previewUserId, 'mira'],
    roles: { mira: 'creator', [previewUserId]: 'member' },
    createdAt: now
  }
];

export const seedPosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'mira',
    communityId: 'frontend-tuning',
    body: 'Beacon import is finally clean. Next pass is making every Android native game use the same cover ratio.',
    imageUrls: [],
    likeIds: [previewUserId],
    comments: [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: previewUserId,
        body: 'That ratio consistency makes the whole handheld feel more console-like.',
        createdAt: now
      }
    ],
    createdAt: now
  },
  {
    id: 'post-2',
    authorId: previewUserId,
    communityId: 'dual-screen-lab',
    body: 'The compact device dashboard is becoming my between-games flow: friends, status, screenshot entry, done.',
    imageUrls: [],
    likeIds: ['ren'],
    comments: [],
    isPinned: true,
    createdAt: now
  },
  {
    id: 'post-3',
    authorId: 'ren',
    body: 'Current obsession: making every RPG launch into the exact shader + overlay profile I expect.',
    imageUrls: [],
    likeIds: ['mira', previewUserId],
    comments: [],
    createdAt: now
  }
];

export const seedFriendships: Friendship[] = [
  { id: 'friend-1', userAId: previewUserId, userBId: 'mira', createdAt: now }
];

export const seedFriendRequests: FriendRequest[] = [
  {
    id: 'request-1',
    fromUserId: 'ren',
    toUserId: previewUserId,
    status: 'pending',
    createdAt: now
  }
];

export const seedNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: previewUserId,
    actorId: 'ren',
    type: 'friend_request',
    title: 'New friend request',
    body: 'Ren wants to connect on PocketNet.',
    createdAt: now
  }
];
