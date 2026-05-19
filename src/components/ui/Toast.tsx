import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';

import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VISIBLE_MS = 1100;
const FADE_MS = 200;

export function ToastProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (next: string) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      setMessage(next);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start(() => {
        timer.current = setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: FADE_MS,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true
          }).start(({ finished }) => {
            if (finished) {
              setMessage(null);
            }
          });
        }, VISIBLE_MS);
      });
    },
    [opacity]
  );

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? (
        <Animated.View pointerEvents="none" style={[styles.host, { opacity }]}>
          <LinearGradient
            colors={[`${colors.accentCyan}EE`, `${colors.accentPurple}EE`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pill}
          >
            <View style={styles.iconWrap}>
              <Check color="#0A0F1F" size={16} />
            </View>
            <AppText variant="cardTitle" color="#0A0F1F">
              {message}
            </AppText>
          </LinearGradient>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => undefined };
  }
  return ctx;
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: spacing.xl + 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    shadowColor: colors.accentCyan,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFFCC',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
