import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { DeviceEventEmitter, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, GlowCard, Row, Stack } from '@/components/ui';
import { colors, gradients, radius, shadows, spacing } from '@/design/tokens';
import { LinearGradient } from 'expo-linear-gradient';

export const TOUR_PENDING_KEY = 'pocketnet:tour-pending';
export const TOUR_DONE_KEY = 'pocketnet:tour-done';
const TOUR_EVENT = 'pocketnet:tour-pending-set';

const MASCOT = require('@/assets/images/pocket-foxy-tour.png');

type Step = {
  title: string;
  body: string;
  cta?: string;
  icon?: string;
};

const STEPS: Step[] = [
  {
    title: 'Hey, I\'m Pocket Foxy!',
    body: 'Welcome to PocketNet — the social hub for handheld gamers. Want a quick 30-second tour? I\'ll show you around.',
    cta: 'Show me'
  },
  {
    title: 'Your handheld feed',
    body: 'The Home tab shows posts from people and communities you follow. Tap a post to like, reply, and drop GIFs in the conversation.',
    icon: '🏠'
  },
  {
    title: 'Find your people',
    body: 'Discover communities for your handheld, frontend, or favorite emulated console. Join a few — that\'s where the good builds and screenshots live.',
    icon: '🧭'
  },
  {
    title: 'Make it yours',
    body: 'Edit your profile to pick an avatar, banner, animated border, and your motion style. The live preview shows changes before you save.',
    icon: '🎨'
  },
  {
    title: 'You\'re set',
    body: 'That\'s the highlights. Pull down on any feed to refresh, hit the + tab to post, and have fun building your PocketCard.',
    cta: 'Let\'s go'
  }
];

export async function markTourPending(): Promise<void> {
  try {
    await AsyncStorage.setItem(TOUR_PENDING_KEY, '1');
  } catch {
    // best-effort
  }
  // Notify any already-mounted AppTour instance so it can flip into the prompt
  // phase without needing a remount. Without this, AppTour's mount-time
  // AsyncStorage read would have already returned null and the tour would
  // never appear for fresh sign-ups.
  try {
    DeviceEventEmitter.emit(TOUR_EVENT);
  } catch {
    // best-effort
  }
}

async function clearTourPending(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOUR_PENDING_KEY);
    await AsyncStorage.setItem(TOUR_DONE_KEY, '1');
  } catch {
    // best-effort
  }
}

export function AppTour({ onFinish }: { onFinish?: () => void }) {
  const [phase, setPhase] = useState<'prompt' | 'tour' | 'closed'>('closed');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(TOUR_PENDING_KEY)
      .then((value) => {
        if (!cancelled && value === '1') setPhase('prompt');
      })
      .catch(() => undefined);
    const sub = DeviceEventEmitter.addListener(TOUR_EVENT, () => {
      if (!cancelled) {
        setStepIndex(0);
        setPhase('prompt');
      }
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  function decline() {
    void clearTourPending();
    setPhase('closed');
    onFinish?.();
  }

  function accept() {
    setStepIndex(0);
    setPhase('tour');
  }

  function next() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      void clearTourPending();
      setPhase('closed');
      onFinish?.();
    }
  }

  if (phase === 'closed') return null;

  if (phase === 'prompt') {
    return (
      <Modal visible animationType="fade" transparent statusBarTranslucent onRequestClose={decline}>
        <View style={styles.backdrop}>
          <GlowCard tone="cyan" style={styles.promptCard}>
            <View style={styles.mascotWrap}>
              <Image source={MASCOT} style={styles.mascot} contentFit="contain" />
            </View>
            <Stack gap={spacing.xs} style={styles.center}>
              <AppText variant="display" style={styles.centerText}>Quick tour?</AppText>
              <AppText color={colors.textSecondary} style={styles.centerText}>
                Pocket Foxy can show you the important bits in about 30 seconds. You can skip if you\u2019d rather just dive in.
              </AppText>
            </Stack>
            <Row style={styles.promptButtons}>
              <Button label="Skip" variant="ghost" onPress={decline} />
              <Button label="Yes, show me" onPress={accept} />
            </Row>
          </GlowCard>
        </View>
      </Modal>
    );
  }

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <Modal visible animationType="slide" transparent statusBarTranslucent onRequestClose={decline}>
      <View style={styles.backdrop}>
        <View style={styles.tourCard}>
          <LinearGradient colors={gradients.hero} style={StyleSheet.absoluteFill} />
          <ScrollView contentContainerStyle={styles.tourScroll}>
            <View style={styles.tourMascotWrap}>
              {isFirst ? (
                <Image source={MASCOT} style={styles.mascotLarge} contentFit="contain" />
              ) : (
                <View style={styles.iconBubble}>
                  <AppText variant="display">{step.icon ?? '✨'}</AppText>
                </View>
              )}
            </View>
            <Stack gap={spacing.sm} style={styles.center}>
              <AppText variant="display" style={styles.centerText}>{step.title}</AppText>
              <AppText color={colors.textSecondary} style={styles.centerText}>
                {step.body}
              </AppText>
            </Stack>
            <View style={styles.dotsRow}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === stepIndex ? styles.dotActive : null]}
                />
              ))}
            </View>
          </ScrollView>
          <Row style={styles.tourButtons}>
            <Pressable accessibilityRole="button" accessibilityLabel="Skip tour" onPress={decline} hitSlop={8}>
              <AppText color={colors.textMuted}>Skip</AppText>
            </Pressable>
            <Button
              label={isLast ? step.cta ?? 'Done' : 'Next'}
              onPress={next}
            />
          </Row>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 13, 0.86)',
    padding: spacing.lg,
    justifyContent: 'center'
  },
  promptCard: {
    gap: spacing.md,
    alignItems: 'stretch'
  },
  promptButtons: {
    justifyContent: 'flex-end'
  },
  mascotWrap: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mascot: {
    width: 160,
    height: 160
  },
  mascotLarge: {
    width: 220,
    height: 220
  },
  center: {
    alignItems: 'center'
  },
  centerText: {
    textAlign: 'center'
  },
  tourCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceStrong,
    minHeight: 420,
    ...shadows.card
  },
  tourScroll: {
    padding: spacing.lg,
    gap: spacing.md
  },
  tourMascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200
  },
  iconBubble: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingTop: spacing.sm
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)'
  },
  dotActive: {
    backgroundColor: colors.accentCyan,
    width: 18
  },
  tourButtons: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  }
});
