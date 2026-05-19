/**
 * Badge catalog for PocketNet.
 *
 * Each badge has an id (server-side allow-list source of truth), a display
 * label, a short description for the tooltip card, an emoji used as the visual
 * marker on the profile header, and a tone for the colored ring.
 *
 * Order matters — earlier entries render first on the profile header.
 */

export type BadgeTone = 'cyan' | 'purple' | 'pink' | 'focus' | 'warning' | 'lime';

export type BadgeDefinition = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  tone: BadgeTone;
  /** Server-evaluated condition explained for the user. */
  howTo: string;
};

export const BADGES: BadgeDefinition[] = [
  {
    id: 'og',
    label: 'OG',
    description: 'One of the first 50 PocketNet accounts.',
    emoji: '⚡',
    tone: 'warning',
    howTo: 'Awarded to the first 50 sign-ups. Limited and permanent.'
  },
  {
    id: 'pioneer',
    label: 'Pioneer',
    description: 'One of the first 200 PocketNet accounts.',
    emoji: '🚀',
    tone: 'focus',
    howTo: 'Awarded to the first 200 sign-ups.'
  },
  {
    id: 'verified',
    label: 'Verified Setup',
    description: 'Completed an onboarding setup with avatar, banner, bio, and handheld.',
    emoji: '✅',
    tone: 'cyan',
    howTo: 'Set an avatar, banner, bio, and primary handheld.'
  },
  {
    id: 'retro-linked',
    label: 'Retro Linked',
    description: 'Connected a RetroAchievements account.',
    emoji: '🎮',
    tone: 'warning',
    howTo: 'Link your RetroAchievements account in Settings.'
  },
  {
    id: 'wordsmith',
    label: 'Wordsmith',
    description: 'Shared a first post.',
    emoji: '✍️',
    tone: 'purple',
    howTo: 'Post anything on PocketNet.'
  },
  {
    id: 'prolific',
    label: 'Prolific',
    description: 'Shared 10+ posts.',
    emoji: '🔥',
    tone: 'pink',
    howTo: 'Reach 10 posts.'
  },
  {
    id: 'centurion',
    label: 'Centurion',
    description: 'Shared 100+ posts.',
    emoji: '💯',
    tone: 'lime',
    howTo: 'Reach 100 posts.'
  },
  {
    id: 'connector',
    label: 'Connector',
    description: 'Made 5+ friends.',
    emoji: '🤝',
    tone: 'cyan',
    howTo: 'Reach 5 friends.'
  },
  {
    id: 'social-butterfly',
    label: 'Social Butterfly',
    description: 'Made 25+ friends.',
    emoji: '🦋',
    tone: 'purple',
    howTo: 'Reach 25 friends.'
  },
  {
    id: 'popular',
    label: 'Popular',
    description: 'Picked up 10+ followers.',
    emoji: '⭐️',
    tone: 'warning',
    howTo: 'Reach 10 followers.'
  },
  {
    id: 'influencer',
    label: 'Influencer',
    description: 'Picked up 100+ followers.',
    emoji: '🌟',
    tone: 'pink',
    howTo: 'Reach 100 followers.'
  },
  {
    id: 'community-builder',
    label: 'Community Builder',
    description: 'Joined or built 3+ communities.',
    emoji: '🏘️',
    tone: 'cyan',
    howTo: 'Join or create 3 communities.'
  },
  {
    id: 'collector',
    label: 'Collector',
    description: 'Has 3+ favorite handhelds set on profile.',
    emoji: '🧰',
    tone: 'focus',
    howTo: 'Add 3 or more handhelds to your favourites.'
  }
];

const BADGE_MAP = new Map(BADGES.map((badge) => [badge.id, badge]));

export function getBadge(id: string): BadgeDefinition | undefined {
  return BADGE_MAP.get(id);
}

export function visibleBadges(ids: string[] | undefined): BadgeDefinition[] {
  if (!ids?.length) return [];
  const seen = new Set<string>();
  const out: BadgeDefinition[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const badge = BADGE_MAP.get(id);
    if (badge) out.push(badge);
  }
  // Keep catalogue order for stable rendering
  return out.sort((a, b) => BADGES.findIndex((b2) => b2.id === a.id) - BADGES.findIndex((b2) => b2.id === b.id));
}
