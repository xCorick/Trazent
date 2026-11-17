import { Grid, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { TaskStatusTag, UserAvatar } from '@/atoms';
import { EmptyState, TaskCard } from '@/molecules';
import type { Task } from '@/types';
import { formatDue } from '@/utils/format';

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
}

const columns: TableColumnsType<Task> = [
  {
    title: 'Tarea',
    dataIndex: 'title',
    render: (_, task) => (
      <div className="tz-cell-task">
        <strong>{task.title}</strong>
        {task.description && <span>{task.description}</span>}
      </div>
    ),
  },
  {
    title: 'Contratista',
    dataIndex: 'assignedToName',
    width: 200,
    render: (name: string) => (
      <span className="tz-cell-user">
        <UserAvatar name={name} size={28} />
        {name}
      </span>
    ),
  },
  { title: 'Sitio', dataIndex: 'siteName', width: 150 },
  { title: 'Fecha límite', dataIndex: 'dueAt', width: 190, render: (dueAt?: string) => formatDue(dueAt) },
  { title: 'Evidencias', dataIndex: 'evidenceCount', width: 110, align: 'center' },
  { title: 'Estado', dataIndex: 'status', width: 140, render: (_, task) => <TaskStatusTag status={task.status} /> },
];

/** Tabla en pantallas medianas y tarjetas en teléfonos. */
export function TaskTable({ tasks, loading }: TaskTableProps) {
  const screens = Grid.useBreakpoint();

  if (!screens.md) {
    if (!loading && tasks.length === 0) return <EmptyState title="Sin tareas" description="Asigna la primera tarea." />;
    return (
      <div className="tz-stack">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} showAssignee />
        ))}
      </div>
    );
  }

  return (
    <Table<Task>
      rowKey="id"
      columns={columns}
      dataSource={tasks}
      loading={loading}
      pagination={{ pageSize: 8, hideOnSinglePage: true }}
      className="tz-table"
      locale={{ emptyText: <EmptyState title="Sin tareas" description="Asigna la primera tarea." /> }}
    />
  );
}
