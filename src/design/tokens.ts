export const colors = {
  background: '#04060D',
  backgroundAlt: '#070B16',
  backgroundElevated: '#0B1222',
  surface: '#101827',
  surfaceStrong: '#162033',
  card: 'rgba(17, 25, 40, 0.88)',
  cardPressed: 'rgba(27, 39, 60, 0.96)',
  control: 'rgba(24, 35, 54, 0.92)',
  controlActive: 'rgba(38, 59, 88, 0.96)',
  surfaceGlass: 'rgba(18, 29, 48, 0.72)',
  surfaceGlow: 'rgba(33, 216, 255, 0.14)',
  border: 'rgba(141, 167, 204, 0.16)',
  borderStrong: 'rgba(145, 215, 255, 0.34)',
  borderGlow: 'rgba(67, 220, 255, 0.48)',
  textPrimary: '#F8FBFF',
  textSecondary: '#C3CEE2',
  textMuted: '#7E8BA4',
  accent: '#43DCFF',
  accentCyan: '#43DCFF',
  accentBlue: '#5F8BFF',
  accentPurple: '#A872FF',
  accentViolet: '#A872FF',
  accentPink: '#FF6FD8',
  accentMagenta: '#FF6FD8',
  accentWarm: '#FFD27A',
  success: '#54E9AA',
  warning: '#FFD27A',
  danger: '#FF5D7A',
  online: '#54E9AA',
  offline: '#66738B',
  pending: '#FFD27A',
  verified: '#8DE7FF',
  focus: '#FFD27A',
  overlay: 'rgba(2, 4, 10, 0.68)',
  black: '#000000',
  white: '#FFFFFF'
};

export const gradients = {
  app: ['#03050C', '#071225', '#0B1022'] as const,
  appGlow: ['rgba(67, 220, 255, 0.18)', 'rgba(168, 114, 255, 0.10)', 'rgba(255, 111, 216, 0.05)'] as const,
  card: ['rgba(24, 35, 58, 0.92)', 'rgba(13, 19, 33, 0.94)'] as const,
  glass: ['rgba(30, 48, 76, 0.74)', 'rgba(12, 18, 32, 0.72)'] as const,
  hero: ['#10264A', '#111B3E', '#080B18'] as const,
  pocket: ['#12314E', '#121B3D', '#0B0F1D'] as const,
  cyan: ['#43DCFF', '#5F8BFF'] as const,
  purple: ['#A872FF', '#43DCFF'] as const,
  magenta: ['#FF6FD8', '#A872FF'] as const,
  danger: ['rgba(255, 93, 122, 0.24)', 'rgba(33, 12, 20, 0.92)'] as const,
  focus: ['rgba(255, 210, 122, 0.18)', 'rgba(67, 220, 255, 0.10)', 'rgba(12, 18, 32, 0.92)'] as const,
  aurora: ['rgba(67, 220, 255, 0.20)', 'rgba(168, 114, 255, 0.14)', 'rgba(255, 111, 216, 0.10)'] as const
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 34,
  xxxl: 42,
  pill: 999,
  avatar: 999,
  card: 26
};

export const typography = {
  display: { fontSize: 36, lineHeight: 42, fontWeight: '900' as const },
  heroTitle: { fontSize: 32, lineHeight: 38, fontWeight: '900' as const },
  screenTitle: { fontSize: 27, lineHeight: 33, fontWeight: '900' as const },
  sectionTitle: { fontSize: 20, lineHeight: 25, fontWeight: '900' as const },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: '900' as const },
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
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 28,
    elevation: 10
  },
  glowCyan: {
    shadowColor: colors.accentCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 10
  },
  glowPurple: {
    shadowColor: colors.accentPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 24,
    elevation: 10
  }
};

export const motion = {
  pressScale: 0.968,
  fast: 130,
  normal: 220,
  slow: 360,
  entrance: 280,
  shimmer: 900
};
