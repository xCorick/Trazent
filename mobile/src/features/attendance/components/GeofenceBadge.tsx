import { GeofenceStatus } from '@/types';
import { Badge } from '@/ui';
import { formatDistance } from '@/utils/format';

interface GeofenceBadgeProps {
  status: GeofenceStatus;
  distanceMeters?: number;
}

export function GeofenceBadge({ status, distanceMeters }: GeofenceBadgeProps) {
  const distance = distanceMeters !== undefined ? ` · ${formatDistance(distanceMeters)}` : '';
  if (status === GeofenceStatus.Inside) {
    return <Badge tone="green" icon="check" label={`Dentro de geocerca${distance}`} />;
  }
  if (status === GeofenceStatus.Outside) {
    return <Badge tone="orange" icon="location" label={`Fuera de geocerca${distance}`} />;
  }
  return <Badge tone="gray" icon="question" label="Ubicación poco precisa" />;
}
