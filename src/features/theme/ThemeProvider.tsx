import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { applyTheme, type ThemeName } from '@/design/tokens';

const THEME_STORAGE_KEY = 'pocketnet.theme';
const LAYOUT_STORAGE_KEY = 'pocketnet.layoutPreference';

export type LayoutPreference = 'standard' | 'split-input-bottom' | 'split-input-top' | 'compact';

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (next: ThemeName) => Promise<void>;
  layout: LayoutPreference;
  setLayout: (next: LayoutPreference) => Promise<void>;
  pendingRestart: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeName>('pocketnet');
  const [layout, setLayoutState] = useState<LayoutPreference>('standard');
  const [pendingRestart, setPendingRestart] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedTheme, storedLayout] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(LAYOUT_STORAGE_KEY)
        ]);
        if (cancelled) return;
        if (storedTheme === 'pocketnet' || storedTheme === 'dark' || storedTheme === 'light') {
          applyTheme(storedTheme);
          setThemeState(storedTheme);
        }
        if (
          storedLayout === 'standard' ||
          storedLayout === 'split-input-bottom' ||
          storedLayout === 'split-input-top' ||
          storedLayout === 'compact'
        ) {
          setLayoutState(storedLayout);
        }
      } catch {
        // Non-fatal: fall back to defaults.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback(async (next: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort.
    }
    setThemeState(next);
    setPendingRestart(true);
  }, []);

  const setLayout = useCallback(async (next: LayoutPreference) => {
    try {
      await AsyncStorage.setItem(LAYOUT_STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort.
    }
    setLayoutState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, layout, setLayout, pendingRestart }),
    [theme, setTheme, layout, setLayout, pendingRestart]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeChoice() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeChoice must be used inside ThemeProvider');
  }
  return ctx;
}
