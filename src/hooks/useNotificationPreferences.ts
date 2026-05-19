import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

export type NotificationPrefKey =
  | 'notify_posts'
  | 'notify_achievements'
  | 'notify_comments'
  | 'notify_friends';

export type NotificationPreferences = Record<NotificationPrefKey, boolean>;

const DEFAULTS: NotificationPreferences = {
  notify_posts: false,
  notify_achievements: false,
  notify_comments: false,
  notify_friends: false
};

/**
 * Reads / writes the caller's notification preferences for a single target
 * user. Per-row RLS enforces that user_id === auth.uid().
 */
export function useNotificationPreferences(targetId: string | undefined) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase || !user?.id || !targetId || user.id === targetId) {
      setPrefs(DEFAULTS);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase!
        .from('notification_preferences')
        .select('notify_posts, notify_achievements, notify_comments, notify_friends')
        .eq('user_id', user.id)
        .eq('target_id', targetId)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setPrefs({
          notify_posts: Boolean(data.notify_posts),
          notify_achievements: Boolean(data.notify_achievements),
          notify_comments: Boolean(data.notify_comments),
          notify_friends: Boolean(data.notify_friends)
        });
      } else {
        setPrefs(DEFAULTS);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [targetId, user?.id]);

  const setPref = useCallback(
    async (key: NotificationPrefKey, value: boolean) => {
      if (!supabase || !user?.id || !targetId || user.id === targetId) return;
      const next = { ...prefs, [key]: value };
      setPrefs(next);
      await supabase
        .from('notification_preferences')
        .upsert(
          {
            user_id: user.id,
            target_id: targetId,
            ...next,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,target_id' }
        );
    },
    [prefs, targetId, user?.id]
  );

  return { prefs, setPref, loading };
}
