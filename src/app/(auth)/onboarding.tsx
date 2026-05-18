import { router } from 'expo-router';
import { CheckCircle2, Gamepad2, MonitorSmartphone, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ChipPicker } from '@/components/ChipPicker';
import { DeviceProfileCard, DeviceSelect } from '@/components/social/DeviceProfileCard';
import { AppText, Badge, Button, GlowCard, Row, Screen, Stack, TextArea } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { FRONTENDS, SYSTEMS } from '@/lib/catalog';
import { isDualScreenDevice } from '@/lib/devices';
import { colors, spacing } from '@/design/tokens';

export default function OnboardingScreen() {
  const { profile, patchProfile } = useAuth();
  const [favoriteHandheld, setFavoriteHandheld] = useState(profile?.favoriteHandheld ?? 'AYN Thor');
  const [favoriteFrontend, setFavoriteFrontend] = useState(profile?.favoriteFrontend ?? 'Cocoon');
  const [favoriteSystems, setFavoriteSystems] = useState(profile?.favoriteSystems ?? []);
  const [setupNotes, setSetupNotes] = useState(profile?.setupNotes ?? '');
  const [saving, setSaving] = useState(false);

  async function finish() {
    try {
      setSaving(true);
      await patchProfile({
        favoriteHandheld,
        favoriteFrontend,
        favoriteSystems,
        setupNotes,
        isThorUser: isDualScreenDevice(favoriteHandheld)
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Could not save onboarding', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <Stack gap={spacing.xs}>
        <Badge label="Pocket Profile" tone="cyan" icon={Sparkles} />
        <AppText variant="display">Build your handheld identity</AppText>
        <AppText color={colors.textSecondary}>
          These badges make PocketNet useful at a glance: device, frontend, systems, and setup context.
        </AppText>
      </Stack>

      <GlowCard tone="cyan">
        <Row>
          <Gamepad2 color={colors.accentCyan} size={20} />
          <Stack gap={2}>
            <AppText variant="sectionTitle">Choose your handheld</AppText>
            <AppText variant="metadata" color={colors.textMuted}>
              PocketNet adapts density, quick actions, and dashboard shape from this choice.
            </AppText>
          </Stack>
        </Row>
        <DeviceSelect value={favoriteHandheld} onChange={setFavoriteHandheld} />
        <DeviceProfileCard deviceName={favoriteHandheld} />
      </GlowCard>
      <GlowCard tone="purple">
        <Row>
          <MonitorSmartphone color={colors.accentPurple} size={20} />
          <AppText variant="sectionTitle">Favorite frontend</AppText>
        </Row>
        <ChipPicker options={FRONTENDS} value={favoriteFrontend} onChange={(value) => setFavoriteFrontend(String(value))} />
      </GlowCard>
      <GlowCard tone="cyan">
        <AppText variant="sectionTitle">Systems</AppText>
        <ChipPicker options={SYSTEMS} value={favoriteSystems} multi onChange={(value) => setFavoriteSystems(value as string[])} />
      </GlowCard>
      <GlowCard tone="focus">
        <TextArea
          label="Setup notes"
          value={setupNotes}
          onChangeText={setSetupNotes}
          placeholder="Controls, frontend, shaders, dock, capture workflow..."
        />
      </GlowCard>
      <Button label="Finish setup" icon={CheckCircle2} loading={saving} onPress={() => void finish()} />
    </Screen>
  );
}
