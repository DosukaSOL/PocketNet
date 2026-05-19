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
