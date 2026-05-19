import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { fetchRecentAchievements, verifyRaAccount, type RaAchievement } from '@/lib/retroachievements';
import { supabase } from '@/lib/supabase';

type State = {
  achievements: RaAchievement[];
  points: number;
  loading: boolean;
  error?: string;
};

const initial: State = { achievements: [], points: 0, loading: false };

/**
 * Fetch a target user's RetroAchievements data using the *viewer's* stored
 * RA web API key. Returns an empty result if the viewer hasn't linked their
 * own RA account or if the target hasn't claimed an RA username.
 */
export function useRetroAchievements(targetRaUsername?: string) {
  const { profile } = useAuth();
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase || !profile?.id || !targetRaUsername) {
        setState(initial);
        return;
      }
      const { data, error } = await supabase
        .from('user_secrets')
        .select('ra_web_api_key, ra_token, ra_username')
        .eq('user_id', profile.id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !profile.raUsername) {
        setState({ ...initial, error: 'Link your RetroAchievements account in settings to view achievements.' });
        return;
      }

      // Username+password login path: we have a token but no API key. We can
      // verify the link is still alive but cannot fetch detailed achievements
      // — the connect endpoint does not surface them. Surface a friendly
      // message inviting the user to optionally add a Web API key for the
      // full feed.
      if (!data?.ra_web_api_key && data?.ra_token) {
        setState({
          ...initial,
          error:
            'Add a Web API key in settings to unlock the full achievement feed. Your RA account is linked.'
        });
        return;
      }

      if (!data?.ra_web_api_key) {
        setState({ ...initial, error: 'Link your RetroAchievements account in settings to view achievements.' });
        return;
      }
      const creds = {
        kind: 'apiKey' as const,
        username: profile.raUsername,
        apiKey: String(data.ra_web_api_key)
      };
      setState((prev) => ({ ...prev, loading: true, error: undefined }));
      try {
        const [summary, recent] = await Promise.all([
          verifyRaAccount(creds, targetRaUsername),
          fetchRecentAchievements(creds, targetRaUsername, 50)
        ]);
        if (cancelled) return;
        setState({
          achievements: recent,
          points: summary.totalPoints,
          loading: false
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          achievements: [],
          points: 0,
          loading: false,
          error: err instanceof Error ? err.message : 'Could not load achievements.'
        });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, profile?.raUsername, targetRaUsername]);

  return state;
}
