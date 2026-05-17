import { router } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ChipPicker } from '@/components/ChipPicker';
import { AppText, Button, Card, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { FRONTENDS, HANDHELDS, SYSTEMS } from '@/lib/catalog';
import { colors } from '@/lib/theme';

export default function OnboardingScreen() {
  const { profile, patchProfile } = useAuth();
  const [favoriteHandheld, setFavoriteHandheld] = useState(profile?.favoriteHandheld ?? 'AYN Thor');
  const [favoriteFrontend, setFavoriteFrontend] = useState(profile?.favoriteFrontend ?? 'Cocoon');
  const [favoriteSystems, setFavoriteSystems] = useState(profile?.favoriteSystems ?? []);
  const [setupNotes, setSetupNotes] = useState(profile?.setupNotes ?? '');

  async function finish() {
    try {
      await patchProfile({
        favoriteHandheld,
        favoriteFrontend,
        favoriteSystems,
        setupNotes,
        isThorUser: favoriteHandheld === 'AYN Thor'
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Could not save onboarding', error instanceof Error ? error.message : 'Try again.');
    }
  }

  return (
    <Screen scroll>
      <AppText variant="heading">Pocket Profile</AppText>
      <AppText color={colors.textMuted}>Set the badges that make your profile useful to other handheld players.</AppText>
      <Card>
        <AppText variant="title">Favorite handheld</AppText>
        <ChipPicker options={HANDHELDS} value={favoriteHandheld} onChange={(value) => setFavoriteHandheld(String(value))} />
      </Card>
      <Card>
        <AppText variant="title">Favorite frontend</AppText>
        <ChipPicker options={FRONTENDS} value={favoriteFrontend} onChange={(value) => setFavoriteFrontend(String(value))} />
      </Card>
      <Card>
        <AppText variant="title">Systems</AppText>
        <ChipPicker options={SYSTEMS} value={favoriteSystems} multi onChange={(value) => setFavoriteSystems(value as string[])} />
      </Card>
      <Card>
        <TextField
          label="Setup notes"
          multiline
          value={setupNotes}
          onChangeText={setSetupNotes}
          placeholder="Controls, frontend, shaders, dock, capture workflow..."
        />
      </Card>
      <Button label="Finish setup" icon={CheckCircle2} onPress={() => void finish()} />
    </Screen>
  );
}
