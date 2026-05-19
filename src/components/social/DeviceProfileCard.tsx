import { Check, ChevronDown, Gamepad2, LayoutPanelTop, Rows3, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppText, Badge, Card, GlowCard, PressableScale, Row, Stack, TextField } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import { DEVICE_PROFILES, getDeviceProfile, type DeviceProfile } from '@/lib/devices';

export function DeviceProfileCard({ deviceName }: { deviceName?: string }) {
  const device = getDeviceProfile(deviceName);
  const dual = device.category === 'dual-screen';

  return (
    <GlowCard tone={dual ? 'focus' : 'cyan'} style={[styles.card, { borderColor: `${device.accentColor}66` }]}>
      <Row style={styles.header}>
        <View style={[styles.deviceIcon, { borderColor: `${device.accentColor}66`, backgroundColor: `${device.accentColor}16` }]}>
          {dual ? <Rows3 color={device.accentColor} size={20} /> : <LayoutPanelTop color={device.accentColor} size={20} />}
        </View>
        <Stack gap={2} style={styles.copy}>
          <AppText variant="sectionTitle">{device.name}</AppText>
          <AppText variant="metadata" color={colors.textMuted}>
            {device.badgeLabel} · {device.brand}
          </AppText>
        </Stack>
        <Badge label={device.density} tone="neutral" />
      </Row>
      <AppText color={colors.textSecondary}>{device.layoutHint}</AppText>
      <Row style={styles.badges}>
        <Badge label={device.category.replace('-', ' ')} tone={dual ? 'focus' : 'cyan'} icon={Gamepad2} />
        <Badge label={device.shortDescription} tone="neutral" />
      </Row>
      <Row style={styles.badges}>
        {device.suggestedCommunities.slice(0, 3).map((community) => (
          <Badge key={community} label={community} tone="purple" icon={Sparkles} compact />
        ))}
      </Row>
    </GlowCard>
  );
}

export function DeviceSelect({
  value,
  onChange,
  customValue,
  onCustomChange
}: {
  value: string;
  onChange: (value: string) => void;
  customValue?: string;
  onCustomChange?: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = getDeviceProfile(value);
  const known = DEVICE_PROFILES.some((device) => device.name === value);
  const showCustom = onCustomChange !== undefined && (!known || value === 'Custom handheld' || value === 'Other');

  return (
    <Stack gap={spacing.sm}>
      <PressableScale onPress={() => setOpen((next) => !next)} style={styles.selectButton}>
        <View style={styles.selectText}>
          <AppText variant="metadata" color={colors.textMuted}>Handheld device</AppText>
          <AppText variant="bodyStrong">{customValue?.trim() || active.name}</AppText>
        </View>
        <ChevronDown color={active.accentColor} size={20} />
      </PressableScale>
      {open ? (
        <Card style={styles.menu}>
          {DEVICE_PROFILES.map((device) => (
            <DeviceOption
              key={device.name}
              device={device}
              active={device.name === value}
              onPress={() => {
                onChange(device.name);
                setOpen(false);
              }}
            />
          ))}
        </Card>
      ) : null}
      {showCustom ? (
        <TextField
          label="Name your handheld"
          value={customValue ?? ''}
          onChangeText={(next) => onCustomChange?.(next)}
          placeholder="e.g. RG406H, GKD Pixel, custom build"
          autoCapitalize="words"
        />
      ) : null}
    </Stack>
  );
}

function DeviceOption({
  device,
  active,
  onPress
}: {
  device: DeviceProfile;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} style={[styles.option, active && styles.optionActive]}>
      <View style={styles.optionCopy}>
        <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{device.name}</Text>
        <Text style={styles.optionMeta}>{device.badgeLabel} · {device.shortDescription}</Text>
      </View>
      {active ? <Check color={device.accentColor} size={18} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderStrong
  },
  header: {
    alignItems: 'center'
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  badges: {
    flexWrap: 'wrap'
  },
  selectButton: {
    minHeight: 66,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  selectText: {
    flex: 1
  },
  menu: {
    padding: spacing.xs,
    gap: spacing.xs
  },
  option: {
    minHeight: 58,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  optionActive: {
    backgroundColor: colors.controlActive,
    borderWidth: 1,
    borderColor: colors.borderGlow
  },
  optionCopy: {
    flex: 1
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800'
  },
  optionTitleActive: {
    color: colors.accentCyan
  },
  optionMeta: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600'
  }
});
