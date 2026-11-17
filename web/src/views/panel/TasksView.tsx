import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Segmented } from 'antd';
import { useMemo, useState } from 'react';
import { TaskFormModal, TaskTable } from '@/components';
import { useContractors, useSites } from '@/hooks/useCatalogs';
import { useCreateTask, useTasks } from '@/hooks/useTasks';
import { PageHeader } from '@/molecules';
import { errorMessage } from '@/services/apiError';
import { TaskStatus } from '@/types';
import type { CreateTaskRequest } from '@/types';

type Filter = 'all' | 'pending' | 'progress' | 'done';

const filterOptions: { label: string; value: Filter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'En progreso', value: 'progress' },
  { label: 'Completadas', value: 'done' },
];

const statusByFilter: Record<Exclude<Filter, 'all'>, TaskStatus> = {
  pending: TaskStatus.Pending,
  progress: TaskStatus.InProgress,
  done: TaskStatus.Completed,
};

export function TasksView() {
  const { message } = App.useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const tasks = useTasks();
  const sites = useSites();
  const contractors = useContractors();
  const createTask = useCreateTask();

  const visibleTasks = useMemo(() => {
    const all = tasks.data ?? [];
    return filter === 'all' ? all : all.filter((task) => task.status === statusByFilter[filter]);
  }, [tasks.data, filter]);

  const handleCreate = async (request: CreateTaskRequest) => {
    try {
      const task = await createTask.mutateAsync(request);
      message.success(`Tarea asignada a ${task.assignedToName}.`);
      setModalOpen(false);
      return true;
    } catch (err) {
      message.error(errorMessage(err));
      return false;
    }
  };

  return (
    <div className="tz-page">
      <PageHeader
        title="Tareas"
        subtitle="Asigna actividades a los contratistas y da seguimiento a sus evidencias."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Asignar tarea
          </Button>
        }
      />

      <Card className="tz-card">
        <div className="tz-toolbar">
          <Segmented options={filterOptions} value={filter} onChange={(value) => setFilter(value as Filter)} />
          <span className="tz-muted">{visibleTasks.length} tareas</span>
        </div>
        <TaskTable tasks={visibleTasks} loading={tasks.isLoading} />
      </Card>

      <TaskFormModal
        open={modalOpen}
        sites={sites.data ?? []}
        contractors={contractors.data ?? []}
        loading={createTask.isPending}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
