import { Github, Globe, Twitch, Youtube } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Linking, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText, Row } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import type { Profile, SocialLinks } from '@/types/domain';

type IconProps = { color: string; size: number };
type IconComponent = ComponentType<IconProps>;

function XIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.244 2.25h3.308l-7.227 8.26 8.5 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.643Z"
        fill={color}
      />
    </Svg>
  );
}

function DiscordIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.2a.074.074 0 0 0-.079.038c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.486 0 12.51 12.51 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-3.76 1.17.07.07 0 0 0-.032.027C2.533 8.046 1.768 11.62 2.143 15.15a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.27 14.27 0 0 0 1.226-1.994.075.075 0 0 0-.041-.105 13.13 13.13 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.197.373.291a.077.077 0 0 1-.006.128 12.32 12.32 0 0 1-1.873.892.076.076 0 0 0-.041.106 16 16 0 0 0 1.226 1.993.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .031-.055c.5-4.087-.838-7.628-3.548-10.752a.061.061 0 0 0-.031-.028ZM8.02 13.001c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"
        fill={color}
      />
    </Svg>
  );
}

type SocialKey = keyof SocialLinks;

type SocialMeta = {
  Icon: IconComponent;
  // Used to build a clickable profile URL when the user saves only a handle.
  handleUrlPrefix?: string;
  label: string;
};

const SOCIAL_META: Record<SocialKey, SocialMeta> = {
  twitter: { Icon: XIcon, handleUrlPrefix: 'https://x.com/', label: 'X' },
  discord: { Icon: DiscordIcon, label: 'Discord' },
  twitch: { Icon: Twitch as unknown as IconComponent, handleUrlPrefix: 'https://twitch.tv/', label: 'Twitch' },
  youtube: { Icon: Youtube as unknown as IconComponent, handleUrlPrefix: 'https://youtube.com/@', label: 'YouTube' },
  github: { Icon: Github as unknown as IconComponent, handleUrlPrefix: 'https://github.com/', label: 'GitHub' },
  website: { Icon: Globe as unknown as IconComponent, label: 'Website' }
};

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function ProfileSocialLinks({ profile }: { profile: Profile }) {
  const entries = (Object.entries(profile.socialLinks) as [SocialKey, string | undefined][])
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .slice(0, 6);

  if (!entries.length) {
    return null;
  }

  return (
    <Row style={styles.row}>
      {entries.map(([key, value]) => {
        const meta = SOCIAL_META[key];
        if (!meta) return null;
        const trimmed = (value as string).trim();
        const linkMode = isUrl(trimmed);
        const handleUrl =
          !linkMode && meta.handleUrlPrefix ? `${meta.handleUrlPrefix}${trimmed.replace(/^@/, '')}` : null;
        const openTarget = linkMode ? trimmed : handleUrl;

        function open() {
          if (!openTarget) return;
          void Linking.openURL(openTarget).catch(() => undefined);
        }

        const Icon = meta.Icon;

        if (linkMode) {
          return (
            <Pressable
              key={key}
              accessibilityRole="link"
              accessibilityLabel={`Open ${meta.label}`}
              onPress={open}
              style={styles.iconOnly}
              hitSlop={6}
            >
              <Icon color={colors.textPrimary} size={18} />
            </Pressable>
          );
        }

        const display = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
        return (
          <Pressable
            key={key}
            accessibilityRole={openTarget ? 'link' : 'text'}
            accessibilityLabel={`${meta.label} ${display}`}
            onPress={openTarget ? open : undefined}
            style={styles.handlePill}
            hitSlop={4}
          >
            <Icon color={colors.textPrimary} size={16} />
            <AppText variant="metadata" color={colors.textSecondary}>
              {display}
            </AppText>
          </Pressable>
        );
      })}
    </Row>
  );
}

const styles = StyleSheet.create({
  row: {
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  iconOnly: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center'
  },
  handlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass
  }
});
