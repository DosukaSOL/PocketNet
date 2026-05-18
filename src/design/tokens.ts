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

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------
// PocketNet supports three palettes. The currently active palette is applied
// to the `colors` and `gradients` exports above by Object.assign at app boot
// (see ThemeProvider). A theme change is persisted and applied on the next
// app launch so existing StyleSheets pick up the new values cleanly.

export type ThemeName = 'pocketnet' | 'dark' | 'light';

type Palette = Partial<typeof colors>;
type GradientSet = Partial<typeof gradients>;

const pocketnetPalette: Palette = { ...colors };
const pocketnetGradients: GradientSet = { ...gradients };

const darkPalette: Palette = {
  background: '#000000',
  backgroundAlt: '#050505',
  backgroundElevated: '#0A0A0A',
  surface: '#101010',
  surfaceStrong: '#161616',
  card: 'rgba(20, 20, 22, 0.92)',
  cardPressed: 'rgba(32, 32, 36, 0.96)',
  control: 'rgba(28, 28, 30, 0.94)',
  controlActive: 'rgba(48, 48, 52, 0.96)',
  surfaceGlass: 'rgba(20, 20, 24, 0.78)',
  surfaceGlow: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.24)',
  borderGlow: 'rgba(255, 255, 255, 0.32)',
  textPrimary: '#F5F5F7',
  textSecondary: '#B8B8BD',
  textMuted: '#7A7A80'
};

const darkGradients: GradientSet = {
  app: ['#000000', '#050505', '#0A0A0A'] as unknown as typeof gradients.app,
  appGlow: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0)'] as unknown as typeof gradients.appGlow,
  hero: ['#0A0A0A', '#050505', '#000000'] as unknown as typeof gradients.hero
};

const lightPalette: Palette = {
  background: '#F4F6FB',
  backgroundAlt: '#EEF1F7',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceStrong: '#F1F4FA',
  card: 'rgba(255, 255, 255, 0.96)',
  cardPressed: 'rgba(232, 238, 248, 0.98)',
  control: 'rgba(244, 246, 251, 0.96)',
  controlActive: 'rgba(224, 232, 246, 0.98)',
  surfaceGlass: 'rgba(255, 255, 255, 0.82)',
  surfaceGlow: 'rgba(67, 220, 255, 0.10)',
  border: 'rgba(20, 28, 48, 0.12)',
  borderStrong: 'rgba(20, 28, 48, 0.24)',
  borderGlow: 'rgba(67, 140, 220, 0.36)',
  textPrimary: '#0B1020',
  textSecondary: '#3C455A',
  textMuted: '#6B7488',
  overlay: 'rgba(20, 28, 48, 0.18)'
};

const lightGradients: GradientSet = {
  app: ['#F8FAFD', '#EEF1F7', '#E6ECF5'] as unknown as typeof gradients.app,
  appGlow: ['rgba(67, 220, 255, 0.10)', 'rgba(168, 114, 255, 0.06)', 'rgba(255, 111, 216, 0.04)'] as unknown as typeof gradients.appGlow,
  hero: ['#FFFFFF', '#F1F4FA', '#E6ECF5'] as unknown as typeof gradients.hero
};

const palettes: Record<ThemeName, { palette: Palette; gradients: GradientSet }> = {
  pocketnet: { palette: pocketnetPalette, gradients: pocketnetGradients },
  dark: { palette: darkPalette, gradients: darkGradients },
  light: { palette: lightPalette, gradients: lightGradients }
};

export function applyTheme(name: ThemeName) {
  const entry = palettes[name];
  Object.assign(colors, pocketnetPalette, entry.palette);
  Object.assign(gradients, pocketnetGradients, entry.gradients);
}

export const themeOptions: { value: ThemeName; label: string; description: string }[] = [
  { value: 'pocketnet', label: 'PocketNet', description: 'OLED-first neon, the default tuned for handhelds.' },
  { value: 'dark', label: 'Dark', description: 'Pure black, minimal chroma. Maximum AMOLED contrast.' },
  { value: 'light', label: 'Light', description: 'High-contrast daylight palette for bright rooms.' }
];
