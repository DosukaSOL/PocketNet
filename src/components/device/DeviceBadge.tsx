import { Gamepad2, LayoutPanelTop, Rows3 } from 'lucide-react-native';

import { Badge } from '@/components/ui';
import { getDeviceProfile } from '@/lib/devices';

export function DeviceBadge({ deviceName, compact = false }: { deviceName?: string; compact?: boolean }) {
  const device = getDeviceProfile(deviceName);
  const dual = device.category === 'dual-screen';
  const Icon = dual ? Rows3 : device.category === 'tablet-handheld' ? LayoutPanelTop : Gamepad2;

  return (
    <Badge
      label={deviceName || device.name}
      tone={dual ? 'focus' : 'cyan'}
      icon={Icon}
      compact={compact}
    />
  );
}
