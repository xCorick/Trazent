import { CheckCircleOutlined, EnvironmentOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeofenceStatus } from '@/types';
import { formatDistance } from '@/utils/format';
import { StatusTag } from './StatusTag';

interface GeofenceTagProps {
  status: GeofenceStatus;
  distanceMeters?: number;
}

export function GeofenceTag({ status, distanceMeters }: GeofenceTagProps) {
  const distance = distanceMeters !== undefined ? ` · ${formatDistance(distanceMeters)}` : '';

  if (status === GeofenceStatus.Inside) {
    return <StatusTag tone="green" icon={<CheckCircleOutlined />}>{`Dentro de geocerca${distance}`}</StatusTag>;
  }
  if (status === GeofenceStatus.Outside) {
    return <StatusTag tone="orange" icon={<EnvironmentOutlined />}>{`Fuera de geocerca${distance}`}</StatusTag>;
  }
  return (
    <StatusTag tone="gray" icon={<QuestionCircleOutlined />}>
      Ubicación poco precisa
    </StatusTag>
  );
}
