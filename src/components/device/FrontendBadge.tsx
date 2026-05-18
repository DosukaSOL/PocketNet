import { MonitorSmartphone } from 'lucide-react-native';

import { Badge } from '@/components/ui';

export function FrontendBadge({ frontend, compact = false }: { frontend?: string; compact?: boolean }) {
  if (!frontend) {
    return null;
  }

  return <Badge label={frontend} tone="purple" icon={MonitorSmartphone} compact={compact} />;
}
