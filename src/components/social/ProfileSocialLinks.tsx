import { Link as LinkIcon } from 'lucide-react-native';

import { Badge, Row } from '@/components/ui';
import type { Profile } from '@/types/domain';

export function ProfileSocialLinks({ profile }: { profile: Profile }) {
  const links = Object.entries(profile.socialLinks).filter(([, value]) => Boolean(value));

  if (!links.length) {
    return null;
  }

  return (
    <Row style={{ flexWrap: 'wrap' }}>
      {links.slice(0, 5).map(([name]) => (
        <Badge key={name} label={name} tone="neutral" icon={LinkIcon} compact />
      ))}
    </Row>
  );
}
