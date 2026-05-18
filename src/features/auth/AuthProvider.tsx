import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { AppState } from 'react-native';

import { profileFromRow, profileToRowPatch } from '@/lib/mappers';
import { previewUserId, seedProfiles } from '@/lib/mockData';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';
import type { Profile, UpdateProfileInput } from '@/types/domain';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isPreviewMode: boolean;
  hasSupabaseConfig: boolean;
  enterPreview: () => void;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setProfile: (profile: Profile) => void;
  patchProfile: (input: UpdateProfileInput) => Promise<Profile>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function defaultPreviewProfile() {
  return seedProfiles.find((profile) => profile.id === previewUserId) ?? seedProfiles[0];
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(!hasSupabaseConfig);

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) {
      setProfile(defaultPreviewProfile());
      return;
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      setProfile(profileFromRow(data));
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!supabase) {
        if (mounted) {
          setProfile(defaultPreviewProfile());
          setIsLoading(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setSession(data.session);

      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }

      setIsLoading(false);
    }

    void bootstrap();

    const authSubscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void loadProfile(nextSession.user.id);
      } else if (!isPreviewMode) {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      authSubscription?.data.subscription.unsubscribe();
    };
  }, [isPreviewMode, loadProfile]);

  const enterPreview = useCallback(() => {
    setIsPreviewMode(true);
    setProfile(defaultPreviewProfile());
  }, []);

  const signIn = useCallback(
    async (identifier: string, password: string) => {
      if (!supabase) {
        enterPreview();
        return;
      }

      const trimmed = identifier.trim();
      let email = trimmed;

      if (!trimmed.includes('@')) {
        const { data, error: lookupError } = await supabase.rpc('email_for_username', {
          p_username: trimmed.toLowerCase()
        });
        if (lookupError) {
          throw lookupError;
        }
        if (!data) {
          throw new Error('No account found for that username.');
        }
        email = data as string;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      setIsPreviewMode(false);
    },
    [enterPreview]
  );

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    if (!supabase) {
      throw new Error('Connect Supabase env values before creating real accounts.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    if (error) {
      throw error;
    }

    if (data.session?.user) {
      setIsPreviewMode(false);
      await loadProfile(data.session.user.id);
    }
  }, [loadProfile]);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      throw new Error('Password reset requires a configured Supabase project.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (supabase && session) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    }

    setSession(null);
    setProfile(hasSupabaseConfig ? null : defaultPreviewProfile());
    setIsPreviewMode(!hasSupabaseConfig);
  }, [session]);

  const patchProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!profile) {
        throw new Error('No active profile to update.');
      }

      const nextProfile: Profile = {
        ...profile,
        ...input,
        avatarUrl: input.avatarUri ?? profile.avatarUrl,
        bannerUrl: input.bannerUri ?? profile.bannerUrl,
        updatedAt: new Date().toISOString()
      };

      setProfile(nextProfile);

      if (supabase && session?.user) {
        const { error } = await supabase
          .from('profiles')
          .update(profileToRowPatch(nextProfile))
          .eq('id', session.user.id);

        if (error) {
          setProfile(profile);
          throw error;
        }
      }

      return nextProfile;
    },
    [profile, session]
  );

  // Presence heartbeat: ping the server every minute and on app foreground so
  // friends can show an "online" dot. Best-effort — failures are silent.
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!supabase || !session?.user || isPreviewMode) {
      return;
    }
    const ping = () => {
      try {
        void Promise.resolve(supabase!.rpc('touch_last_seen')).catch(() => undefined);
      } catch {
        // Swallow — presence is best-effort.
      }
    };
    ping();
    heartbeatRef.current = setInterval(ping, 60_000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        ping();
      }
    });
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      sub.remove();
    };
  }, [isPreviewMode, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isPreviewMode,
      hasSupabaseConfig,
      enterPreview,
      signIn,
      signUp,
      resetPassword,
      signOut,
      setProfile,
      patchProfile
    }),
    [
      enterPreview,
      isLoading,
      isPreviewMode,
      patchProfile,
      profile,
      resetPassword,
      session,
      signIn,
      signOut,
      signUp
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
