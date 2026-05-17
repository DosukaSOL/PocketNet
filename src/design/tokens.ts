export const colors = {
  background: '#05070D',
  backgroundAlt: '#080C14',
  backgroundElevated: '#0B1020',
  surface: '#101726',
  surfaceStrong: '#151E31',
  card: '#121A2A',
  cardPressed: '#1A263B',
  border: '#26324A',
  borderStrong: '#38506F',
  textPrimary: '#F8FBFF',
  textSecondary: '#B8C4D8',
  textMuted: '#78869D',
  accentCyan: '#24D7FF',
  accentBlue: '#4B7DFF',
  accentPurple: '#A875FF',
  accentPink: '#FF6BCB',
  success: '#39E6A1',
  warning: '#FFD166',
  danger: '#FF526B',
  online: '#3EF5B1',
  offline: '#65748B',
  pending: '#FFC857',
  verified: '#74E5FF',
  thorlinkAccent: '#7C5CFF',
  black: '#000000',
  white: '#FFFFFF'
};

export const gradients = {
  app: [colors.background, colors.backgroundAlt, colors.backgroundElevated] as const,
  card: [colors.card, '#0E1626'] as const,
  hero: ['#102039', '#0B1020', '#080A14'] as const,
  pocket: ['#17243D', '#101726'] as const,
  cyan: ['#24D7FF', '#4B7DFF'] as const,
  purple: ['#7C5CFF', '#24D7FF'] as const,
  danger: ['#351622', '#16101B'] as const,
  thor: ['#0A1833', '#11164A', '#231343'] as const,
  aurora: ['rgba(36, 215, 255, 0.20)', 'rgba(168, 117, 255, 0.14)', 'rgba(255, 107, 203, 0.08)'] as const
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
  avatar: 999,
  card: 20
};

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '900' as const },
  heroTitle: { fontSize: 30, lineHeight: 36, fontWeight: '900' as const },
  screenTitle: { fontSize: 26, lineHeight: 32, fontWeight: '900' as const },
  sectionTitle: { fontSize: 19, lineHeight: 24, fontWeight: '800' as const },
  cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: '800' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '800' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  metadata: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  button: { fontSize: 14, lineHeight: 18, fontWeight: '900' as const },
  badge: { fontSize: 11, lineHeight: 14, fontWeight: '900' as const },
  tabLabel: { fontSize: 11, lineHeight: 14, fontWeight: '800' as const }
};

export const shadows = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8
  },
  glowCyan: {
    shadowColor: colors.accentCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10
  },
  glowPurple: {
    shadowColor: colors.thorlinkAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 10
  }
};

export const motion = {
  pressScale: 0.975,
  fast: 140,
  normal: 220,
  slow: 360
};
