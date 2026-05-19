import { router } from 'expo-router';
import { ExternalLink, HelpCircle, Lock, ShieldAlert, X } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, GlowCard, IconButton, Row, Stack } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';

export function AchievementsHelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="How do I show my RetroAchievements"
        hitSlop={8}
        onPress={() => setOpen(true)}
        style={styles.iconButton}
      >
        <HelpCircle color={colors.accentCyan} size={18} />
      </Pressable>
      <AchievementsHelpModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function AchievementsHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal visible={open} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <GlowCard tone="pink" style={styles.card}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Row style={styles.headerRow}>
              <AppText variant="sectionTitle">Show your RetroAchievements</AppText>
              <IconButton icon={X} label="Close" onPress={onClose} />
            </Row>

            <Stack gap={spacing.sm}>
              <AppText color={colors.textSecondary}>
                Your RetroAchievements unlocks only show up in PocketNet once you link your account
                with their official Web API key. Here&apos;s how to grab yours:
              </AppText>

              <Stack gap={6}>
                <Step n={1} text="Open retroachievements.org and sign in." />
                <Step n={2} text="Visit Settings → Keys (or open the Control Panel)." />
                <Step n={3} text='Find the "Web API Key" field and copy the value.' />
                <Step
                  n={4}
                  text="In PocketNet, open Settings → RetroAchievements and paste your username + Web API key, then Save."
                />
              </Stack>

              <Row style={styles.warningRow}>
                <ShieldAlert color={colors.warning} size={18} />
                <Stack gap={2} style={{ flex: 1 }}>
                  <AppText variant="bodyStrong" color={colors.warning}>
                    Never share your Web API key.
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    Anyone with this key can read your RetroAchievements account data. PocketNet
                    stores it encrypted on your device only — we never display it back to anyone,
                    including you.
                  </AppText>
                </Stack>
              </Row>

              <Row style={styles.privacyRow}>
                <Lock color={colors.accentCyan} size={16} />
                <AppText variant="caption" color={colors.textMuted}>
                  Your RA password never leaves your device. Only the username and key are stored.
                </AppText>
              </Row>

              <Row style={styles.actions}>
                <Button
                  label="Open RetroAchievements"
                  icon={ExternalLink}
                  variant="secondary"
                  onPress={() => {
                    void Linking.openURL('https://retroachievements.org/controlpanel.php');
                  }}
                />
                <Button
                  label="Go to Settings"
                  onPress={() => {
                    onClose();
                    router.push('/settings' as never);
                  }}
                />
              </Row>
            </Stack>
          </ScrollView>
        </GlowCard>
      </View>
    </Modal>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <Row style={styles.stepRow}>
      <View style={styles.stepBubble}>
        <AppText variant="bodyStrong" color={colors.accentCyan}>
          {n}
        </AppText>
      </View>
      <AppText style={{ flex: 1 }} color={colors.textSecondary}>
        {text}
      </AppText>
    </Row>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${colors.accentCyan}55`,
    backgroundColor: `${colors.accentCyan}14`
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%'
  },
  scroll: {
    gap: spacing.md
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepRow: {
    alignItems: 'flex-start',
    gap: spacing.sm
  },
  stepBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: `${colors.accentCyan}1A`,
    borderColor: `${colors.accentCyan}55`,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  warningRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.warning}55`,
    backgroundColor: `${colors.warning}12`
  },
  privacyRow: {
    alignItems: 'center',
    gap: 6
  },
  actions: {
    flexWrap: 'wrap',
    gap: spacing.sm
  }
});
