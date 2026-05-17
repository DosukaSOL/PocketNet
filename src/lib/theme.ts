import { colors as tokenColors, radius, shadows, spacing, typography } from '@/design/tokens';

export const colors = {
  ...tokenColors,
  text: tokenColors.textPrimary,
  textMuted: tokenColors.textSecondary,
  textDim: tokenColors.textMuted,
  cyan: tokenColors.accentCyan,
  blue: tokenColors.accentBlue,
  lime: tokenColors.success,
  coral: tokenColors.accentPink,
  violet: tokenColors.accentPurple,
  yellow: tokenColors.warning,
  surfaceAlt: tokenColors.surfaceStrong,
  surfaceRaised: tokenColors.backgroundElevated
};

export { radius, spacing };

export const font = {
  tiny: typography.badge.fontSize,
  small: typography.caption.fontSize,
  body: typography.body.fontSize,
  title: typography.sectionTitle.fontSize,
  heading: typography.screenTitle.fontSize
};

export const shadow = shadows.card;
