import { TaskStatus } from '@/types';
import { StatusTag } from './StatusTag';
import type { Tone } from './StatusTag';

const config: Record<TaskStatus, { tone: Tone; label: string }> = {
  [TaskStatus.Pending]: { tone: 'gray', label: 'Pendiente' },
  [TaskStatus.InProgress]: { tone: 'blue', label: 'En progreso' },
  [TaskStatus.Completed]: { tone: 'green', label: 'Completada' },
  [TaskStatus.Cancelled]: { tone: 'red', label: 'Cancelada' },
};

export function TaskStatusTag({ status }: { status: TaskStatus }) {
  const { tone, label } = config[status];
  return <StatusTag tone={tone}>{label}</StatusTag>;
}

export const taskStatusLabel = (status: TaskStatus) => config[status].label;
