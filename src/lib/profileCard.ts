/**
 * Profile-card export geometry. These values are the single source of truth
 * for designers shipping new border art.
 *
 * COMPACT card (pfp + banner + bio):
 *   - Total canvas:      1080 x 1620 px  (2:3 portrait)
 *   - Outer border:      48 px on all 4 sides
 *   - Inner card area:   984 x 1524 px
 *
 * FULL card (compact + posts + friends + followers + communities + achievements):
 *   - Total canvas:      1080 x 2400 px
 *   - Outer border:      48 px on all 4 sides
 *   - Inner card area:   984 x 2304 px
 *
 * Designers shipping new borders: produce a 1080-wide PNG with a 48px transparent
 * inner cut-out matching the canvas above.
 */

export const PROFILE_CARD_GEOMETRY = {
  compact: {
    width: 1080,
    height: 1620,
    borderThickness: 48,
    innerWidth: 1080 - 48 * 2,
    innerHeight: 1620 - 48 * 2
  },
  full: {
    width: 1080,
    height: 2400,
    borderThickness: 48,
    innerWidth: 1080 - 48 * 2,
    innerHeight: 2400 - 48 * 2
  }
} as const;

export type ProfileCardSize = keyof typeof PROFILE_CARD_GEOMETRY;
export type ProfileCardVariant = ProfileCardSize;

export type ProfileCardBorder = {
  id: string;
  label: string;
  description: string;
  /** Gradient stops painted as a rectangle behind the inner card. */
  gradient: [string, string, ...string[]];
  /** Optional inner-stroke colour (drawn 4px wide inside the border). */
  innerStroke?: string;
  /** Optional corner decoration emoji rendered in each corner of the border. */
  cornerEmoji?: string;
};

export const PROFILE_CARD_BORDERS: ProfileCardBorder[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Subtle slate frame.',
    gradient: ['#0B1220', '#0B1220'],
    innerStroke: 'rgba(255,255,255,0.16)'
  },
  {
    id: 'aurora',
    label: 'Aurora',
    description: 'Cyan → purple gradient.',
    gradient: ['#06B6D4', '#7C3AED'],
    innerStroke: 'rgba(255,255,255,0.4)'
  },
  {
    id: 'sunset',
    label: 'Sunset',
    description: 'Pink → orange.',
    gradient: ['#F472B6', '#F59E0B'],
    innerStroke: 'rgba(255,255,255,0.42)'
  },
  {
    id: 'crt',
    label: 'CRT',
    description: 'Retro green scanlines.',
    gradient: ['#022C22', '#10B981'],
    innerStroke: '#34D399',
    cornerEmoji: '🎮'
  },
  {
    id: 'holo',
    label: 'Holo',
    description: 'Iridescent holographic.',
    gradient: ['#A78BFA', '#22D3EE', '#F472B6', '#FACC15'],
    innerStroke: 'rgba(255,255,255,0.55)'
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Deep navy with starlight.',
    gradient: ['#020617', '#1E293B'],
    innerStroke: '#7C3AED',
    cornerEmoji: '✦'
  }
];

export function getCardBorder(id?: string): ProfileCardBorder {
  return PROFILE_CARD_BORDERS.find((border) => border.id === id) ?? PROFILE_CARD_BORDERS[0];
}
