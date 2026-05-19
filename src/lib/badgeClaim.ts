/**
 * Client helpers around the server-side `claim_og_badge` and `award_badge`
 * RPCs. The server is the source of truth; the client just calls these RPCs
 * and trusts the returned booleans.
 */

import { supabase } from './supabase';

export async function claimOgBadge(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('claim_og_badge');
  if (error) return false;
  return Boolean(data);
}

export async function awardBadge(badgeId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('award_badge', { p_badge: badgeId });
  if (error) return false;
  return Boolean(data);
}

/**
 * Best-effort: walk the achievable badges and ask the server to award any the
 * user has already earned. The server enforces eligibility; the client only
 * supplies candidate IDs. Returns the list of badges that were actually
 * awarded by this call.
 */
export async function evaluateAllBadges(): Promise<string[]> {
  const candidates = [
    'pioneer',
    'verified',
    'retro-linked',
    'wordsmith',
    'prolific',
    'centurion',
    'connector',
    'social-butterfly',
    'popular',
    'influencer',
    'community-builder'
  ];
  const awarded: string[] = [];
  for (const id of candidates) {
    const ok = await awardBadge(id);
    if (ok) awarded.push(id);
  }
  return awarded;
}
