import { Segmented, Skeleton } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyTasks } from '@/hooks/useTasks';
import { EmptyState, TaskCard } from '@/molecules';
import { paths } from '@/routes/paths';
import { TaskStatus } from '@/types';

type Filter = 'open' | 'done';

/** PROTOTIPO MÓVIL · Lista de tareas del contratista. */
export function MobileTasksView() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('open');
  const tasks = useMyTasks();

  const visible = useMemo(
    () =>
      (tasks.data ?? []).filter((task) =>
        filter === 'open'
          ? task.status === TaskStatus.Pending || task.status === TaskStatus.InProgress
          : task.status === TaskStatus.Completed,
      ),
    [tasks.data, filter],
  );

  return (
    <div className="tz-m-page">
      <h1 className="tz-m-title">Mis tareas</h1>
      <Segmented
        block
        value={filter}
        onChange={(value) => setFilter(value as Filter)}
        options={[
          { label: 'Por hacer', value: 'open' },
          { label: 'Completadas', value: 'done' },
        ]}
      />
      {tasks.isLoading ? (
        <Skeleton active />
      ) : visible.length > 0 ? (
        <div className="tz-stack">
          {visible.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => navigate(paths.mobileTask(task.id))} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={filter === 'open' ? 'Nada pendiente' : 'Sin tareas completadas'}
          description={filter === 'open' ? 'Buen trabajo, no tienes tareas por hacer.' : undefined}
        />
      )}
    </div>
  );
}
