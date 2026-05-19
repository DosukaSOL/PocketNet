/**
 * PocketNet release notes.
 *
 * Append a new entry at the TOP whenever you ship a version. Keep bullets
 * short, snappy, and human-readable so the in-app Updates card stays scannable.
 */

export type ReleaseEntry = {
  version: string;
  date: string;
  title: string;
  highlights: string[];
};

export const RELEASES: ReleaseEntry[] = [
  {
    version: '1.3.3',
    date: '2026-05-21',
    title: 'Live profile preview, GIF replies, community studio, pull-to-refresh',
    highlights: [
      'Edit Profile now shows a live preview of your card as you tweak it — see borders, avatar, banner, and bio before saving',
      'Borders are split into Static and Animated sections — plus brand-new Lightning, Fire, and Glitch animated borders',
      'Upload your own GIF border (recommended 600 × 600, under 4 MB) and have it rotate around your card',
      'Delete your own comments and replies — owner-only, with confirmation',
      'Communities get a real studio: avatar, banner, bio, social links, border presets, and an Edit Community screen for the creator',
      'Per-community notifications toggle — get pinged when new posts land in the communities you care about',
      'Pin / unpin posts as community owner or moderator (owner can still override)',
      'Tenor GIF picker in the reply composer and the post composer — search and tap to insert',
      'Pull-to-refresh on every feed: Home, Discover, Profile, Notifications, Community, User, Settings, Friends, Create',
      'Crop your profile picture and banner when uploading (1:1 for avatars, 3:1 for banners)',
      'Fixed “mime type image/gif is not supported” — animated GIFs now upload everywhere'
    ]
  },
  {
    version: '1.3.2',
    date: '2026-05-20',
    title: 'Reply threads, @mentions, notifications inbox, levels, borders',
    highlights: [
      'Reply directly to comments on any post — threaded replies with the original commenter highlighted',
      'Tag people with @username — they get a real notification, just like X/Twitter',
      'New Notifications inbox: bell icon on Home with unread count, every ping in one place',
      'Friends and Follow now coexist — be friends AND follow, or just one',
      'Pick "Other" on favourite games / handhelds / frontends / systems and type your own',
      'Level up by posting, commenting, getting reactions, following, and joining communities (formula: floor(√(xp/50))+1)',
      'Level badge next to your name, with a level-up notification whenever you climb',
      'New profile border presets + paste your own custom border image URL (animated GIFs supported)',
      'Animated GIF avatars and banners — pick directly from your library',
      '"How do I show my RetroAchievements?" help popover with full instructions + Web API key safety warning',
      'Notifications auto-mark-read when you open the inbox'
    ]
  },
  {
    version: '1.3.1',
    date: '2026-05-19',
    title: 'RA login fix, score sync, notifications, DEV badge',
    highlights: [
      'Fixed RetroAchievements login (403) — we now send a proper User-Agent so the WAF lets us through',
      'Your RA score now syncs to your profile on login and refreshes whenever you open the app',
      'Per-user notification preferences — pick which friends/follows ping you for posts, achievements, comments, or new friends',
      'New DEV badge: locked to @dosuka on the server, with a pulsing glow you can\'t miss',
      'OG and Collector badges fully wired server-side (no more silent failures)'
    ]
  },
  {
    version: '1.3.0',
    date: '2026-05-19',
    title: 'Badges, RA login, profile cleanup',
    highlights: [
      'OG badge for the first 50 sign-ups — limited and permanent',
      'Earnable badges: Verified, Retro Linked, Wordsmith, Prolific, Centurion, Connector, Social Butterfly, Popular, Influencer, Community Builder, Pioneer, Collector',
      'Tap any badge on a profile to see how it was earned',
      'Sign in to RetroAchievements with username + password (no API key required)',
      'Web API key still supported as an advanced option for the full achievement feed',
      'Push notifications toggle no longer crashes on devices without FCM (graceful local fallback)',
      'Profile cleanup: removed the redundant Pocket card and the Dual OLED plate from banners',
      'Replaced the generic shield icon with your earned badges',
      'Servers verify badge eligibility — clients cannot grant badges to themselves'
    ]
  },
  {
    version: '1.2.0',
    date: '2026-05-19',
    title: 'Profiles, achievements, push, exports',
    highlights: [
      'RetroAchievements account link in settings (badge + achievement count on profile)',
      'Profile shows followers, friends, posts, replies, communities, achievements — each tappable',
      'New Replies section on profiles',
      '"Places" renamed to Communities everywhere',
      'Lock your profile (privacy setting) — only friends + followers can view',
      'Export Profile Card as PNG with selectable borders (basic / animated / retro)',
      'Toggle "Full card" to also export posts, friends, followers, communities, achievements',
      'Push notifications: opt-in at signup, toggle anytime in settings',
      'Tap any avatar or name on a post to open that user\'s profile',
      'Messages tab now scrolls properly',
      'Bigger BrandMark on Home',
      'Updates section in settings — patch notes inside the app',
      'Sessions survive APK updates (no re-login)'
    ]
  },
  {
    version: '1.1.0',
    date: '2026-05-19',
    title: 'For You + Explore + follows',
    highlights: [
      'For You Page + Explore segmented feeds on Home',
      'Follow system (new follows table with RLS)',
      '"Other" custom inputs in onboarding pickers',
      'Multi-handheld picker',
      'Branded "Posted" toast',
      'GIF button in the composer',
      'Profile stats moved to Profile tab',
      'Discover button states: Add → Requested → Friend / Accept',
      'Username uniqueness error: "Username already taken, try a different name"'
    ]
  },
  {
    version: '1.0.0',
    date: '2026-05-19',
    title: 'First stable release',
    highlights: [
      'Direct messages (private, RLS-locked)',
      'Multi-step onboarding wizard',
      'Friends list with online status',
      'Presence heartbeat (last_seen_at)',
      'Banner upload in onboarding',
      'Orientation fix for dual-screen handhelds'
    ]
  }
];
