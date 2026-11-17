import type { Tone } from '@/theme/tokens';
import { TaskStatus } from '@/types';
import { Badge } from '@/ui';

const config: Record<TaskStatus, { label: string; tone: Tone }> = {
  [TaskStatus.Pending]: { label: 'Pendiente', tone: 'orange' },
  [TaskStatus.InProgress]: { label: 'En progreso', tone: 'blue' },
  [TaskStatus.Completed]: { label: 'Completada', tone: 'green' },
  [TaskStatus.Cancelled]: { label: 'Cancelada', tone: 'gray' },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, tone } = config[status];
  return <Badge label={label} tone={tone} />;
}
