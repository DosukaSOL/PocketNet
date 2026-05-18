import { colors } from '@/design/tokens';

export type DeviceLayout = 'dual-screen' | 'wide-handheld' | 'compact-handheld' | 'tablet-handheld' | 'phone';

export type DeviceProfile = {
  name: string;
  brand: string;
  category: DeviceLayout;
  shortDescription: string;
  accentColor: string;
  badgeLabel: string;
  layoutHint: string;
  density: 'compact' | 'balanced' | 'spacious';
  suggestedCommunities: string[];
  iconName: 'dual-screen' | 'gamepad' | 'compact' | 'tablet' | 'phone';
};

export const DEVICE_PROFILES: DeviceProfile[] = [
  {
    name: 'AYN Thor',
    brand: 'AYN',
    category: 'dual-screen',
    shortDescription: 'Dual-OLED clamshell for DS/3DS-style play and split-screen workflows.',
    accentColor: colors.focus,
    badgeLabel: 'Dual OLED',
    layoutHint: 'Compact social cards with quick actions tuned for a secondary display.',
    density: 'compact',
    suggestedCommunities: ['Dual-Screen Setups', 'Cocoon Themes', 'DS & 3DS Players'],
    iconName: 'dual-screen'
  },
  {
    name: 'AYN Odin 2',
    brand: 'AYN',
    category: 'wide-handheld',
    shortDescription: 'Wide Android handheld for high-end emulation, streaming, and Android games.',
    accentColor: colors.accentBlue,
    badgeLabel: 'Wide Power',
    layoutHint: 'Media-forward feed with thumb-friendly action rails.',
    density: 'balanced',
    suggestedCommunities: ['Odin Owners', 'High-End Emulation', 'Android Game Setups'],
    iconName: 'gamepad'
  },
  {
    name: 'AYN Odin 3',
    brand: 'AYN',
    category: 'wide-handheld',
    shortDescription: 'Premium wide handheld for modern Android gaming and emulation.',
    accentColor: colors.accentCyan,
    badgeLabel: 'Premium Wide',
    layoutHint: 'Balanced density with stronger media previews and console-like navigation.',
    density: 'balanced',
    suggestedCommunities: ['Odin Owners', 'Android Performance', 'Frontend Tuning'],
    iconName: 'gamepad'
  },
  {
    name: 'AYN Odin 2 Portal',
    brand: 'AYN',
    category: 'wide-handheld',
    shortDescription: 'OLED-forward Odin profile for wide-screen Android gaming and streaming.',
    accentColor: colors.accentBlue,
    badgeLabel: 'OLED Wide',
    layoutHint: 'Media-rich cards with generous touch targets and wide-display scanning.',
    density: 'balanced',
    suggestedCommunities: ['Odin Owners', 'OLED Setups', 'Streaming Handhelds'],
    iconName: 'gamepad'
  },
  {
    name: 'Retroid Pocket 5',
    brand: 'Retroid',
    category: 'compact-handheld',
    shortDescription: 'Pocketable OLED handheld where compact cards and readable metadata matter.',
    accentColor: colors.accentMagenta,
    badgeLabel: 'Pocket OLED',
    layoutHint: 'Shorter cards, compact badges, and fast vertical scanning.',
    density: 'compact',
    suggestedCommunities: ['Retroid Players', 'Pocket Setups', 'Daijisho Themes'],
    iconName: 'compact'
  },
  {
    name: 'Retroid Pocket Flip 2',
    brand: 'Retroid',
    category: 'compact-handheld',
    shortDescription: 'Compact clamshell Android handheld for pocket-first play.',
    accentColor: colors.accentMagenta,
    badgeLabel: 'Clamshell',
    layoutHint: 'Compact vertical rhythm with large touch targets.',
    density: 'compact',
    suggestedCommunities: ['Retroid Players', 'Clamshell Setups', 'Pocket Emulation'],
    iconName: 'compact'
  },
  {
    name: 'Retroid Pocket Mini',
    brand: 'Retroid',
    category: 'compact-handheld',
    shortDescription: 'Small Android handheld profile for pocket-first play and fast social scanning.',
    accentColor: colors.accentMagenta,
    badgeLabel: 'Mini OLED',
    layoutHint: 'Compact density, shorter copy, and large primary actions for small displays.',
    density: 'compact',
    suggestedCommunities: ['Retroid Players', 'Pocket Setups', 'Mini Handhelds'],
    iconName: 'compact'
  },
  {
    name: 'AYANEO Pocket DS',
    brand: 'AYANEO',
    category: 'dual-screen',
    shortDescription: 'Dual-screen Android handheld for second-screen play and reference panels.',
    accentColor: colors.focus,
    badgeLabel: 'Dual Screen',
    layoutHint: 'Compact dashboard surfaces with clear top-context and bottom-action hierarchy.',
    density: 'compact',
    suggestedCommunities: ['Dual-Screen Setups', 'AYANEO Pocket', 'ES-DE Themes'],
    iconName: 'dual-screen'
  },
  {
    name: 'AYANEO Pocket S',
    brand: 'AYANEO',
    category: 'wide-handheld',
    shortDescription: 'High-end Android handheld with a premium single-screen layout.',
    accentColor: colors.accentPurple,
    badgeLabel: 'Premium',
    layoutHint: 'Spacious profile cards and media-led community discovery.',
    density: 'spacious',
    suggestedCommunities: ['AYANEO Pocket', 'OLED Setups', 'Android Flagship Gaming'],
    iconName: 'gamepad'
  },
  {
    name: 'AYANEO Pocket Air',
    brand: 'AYANEO',
    category: 'wide-handheld',
    shortDescription: 'OLED Android handheld for balanced emulation and cloud play.',
    accentColor: colors.accentPurple,
    badgeLabel: 'OLED Wide',
    layoutHint: 'Balanced density with rich media cards and clear navigation.',
    density: 'balanced',
    suggestedCommunities: ['AYANEO Pocket', 'OLED Setups', 'Beacon Libraries'],
    iconName: 'gamepad'
  },
  {
    name: 'ANBERNIC RG556',
    brand: 'ANBERNIC',
    category: 'wide-handheld',
    shortDescription: 'Android handheld with a wide OLED display and emulator-first audience.',
    accentColor: colors.accentBlue,
    badgeLabel: 'Android OLED',
    layoutHint: 'Readable feed cards with fast access to setup and frontend identity.',
    density: 'balanced',
    suggestedCommunities: ['ANBERNIC Android', 'ES-DE Android', 'Frontend Tuning'],
    iconName: 'gamepad'
  },
  {
    name: 'Logitech G Cloud',
    brand: 'Logitech G',
    category: 'wide-handheld',
    shortDescription: 'Cloud-first Android handheld with a roomy landscape display.',
    accentColor: colors.success,
    badgeLabel: 'Cloud Handheld',
    layoutHint: 'Relaxed feed rhythm with quick status and streaming-community shortcuts.',
    density: 'spacious',
    suggestedCommunities: ['Cloud Gaming', 'Streaming Handhelds', 'Android Game Setups'],
    iconName: 'gamepad'
  },
  {
    name: 'Razer Edge',
    brand: 'Razer',
    category: 'tablet-handheld',
    shortDescription: 'Android gaming tablet profile for high-refresh cloud and native play.',
    accentColor: colors.success,
    badgeLabel: 'High Refresh',
    layoutHint: 'Large cards, strong media previews, and clear controller-friendly actions.',
    density: 'spacious',
    suggestedCommunities: ['Cloud Gaming', 'Android Performance', 'Controller Setups'],
    iconName: 'tablet'
  },
  {
    name: 'Steam Deck',
    brand: 'Valve',
    category: 'tablet-handheld',
    shortDescription: 'Large handheld PC profile for players who also use Android handhelds.',
    accentColor: colors.accentCyan,
    badgeLabel: 'Large Handheld',
    layoutHint: 'Spacious cards, large media previews, and relaxed profile rhythm.',
    density: 'spacious',
    suggestedCommunities: ['Steam Deck', 'Cross-Device Setups', 'Cloud Saves'],
    iconName: 'tablet'
  },
  {
    name: 'Android phone/tablet',
    brand: 'Android',
    category: 'phone',
    shortDescription: 'Touch-first Android device for players using controllers, telescopic grips, or tablets.',
    accentColor: colors.success,
    badgeLabel: 'Android',
    layoutHint: 'Balanced mobile layout with standard touch density.',
    density: 'balanced',
    suggestedCommunities: ['Android Gaming', 'Controller Setups', 'Cloud Gaming'],
    iconName: 'phone'
  },
  {
    name: 'Custom handheld',
    brand: 'Custom',
    category: 'wide-handheld',
    shortDescription: 'A custom or less common Android handheld setup.',
    accentColor: colors.accentWarm,
    badgeLabel: 'Custom',
    layoutHint: 'Balanced default layout with editable setup identity.',
    density: 'balanced',
    suggestedCommunities: ['Custom Setups', 'Android Handhelds', 'Frontend Tuning'],
    iconName: 'gamepad'
  }
];

export const HANDHELDS = DEVICE_PROFILES.map((device) => device.name);

export function getDeviceProfile(name?: string) {
  return DEVICE_PROFILES.find((device) => device.name === name) ?? DEVICE_PROFILES.at(-1)!;
}

export function isDualScreenDevice(name?: string) {
  return getDeviceProfile(name).category === 'dual-screen';
}
