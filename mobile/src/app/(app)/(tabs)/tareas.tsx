import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { TaskCard, useMyTasks } from '@/features/tasks';
import { colors } from '@/theme/tokens';
import { TaskStatus } from '@/types';
import { AppText, Card, EmptyState, Screen, SegmentedControl } from '@/ui';

type Filter = 'open' | 'done';

const isOpen = (status: TaskStatus) => status === TaskStatus.Pending || status === TaskStatus.InProgress;

export default function TasksScreen() {
  const tasks = useMyTasks();
  const [filter, setFilter] = useState<Filter>('open');

  const all = tasks.data ?? [];
  const visible = all.filter((task) => (filter === 'open' ? isOpen(task.status) : !isOpen(task.status)));
  const openCount = all.filter((task) => isOpen(task.status)).length;

  return (
    <Screen refreshing={tasks.isRefetching} onRefresh={() => void tasks.refetch()}>
      <AppText variant="title">Mis tareas</AppText>
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { label: `Por hacer (${openCount})`, value: 'open' },
          { label: 'Terminadas', value: 'done' },
        ]}
      />
      {tasks.isLoading ? (
        <ActivityIndicator color={colors.blue700} />
      ) : visible.length > 0 ? (
        visible.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onPress={() => router.push({ pathname: '/tarea/[taskId]', params: { taskId: task.id } })}
          />
        ))
      ) : (
        <Card>
          <EmptyState
            title={filter === 'open' ? 'Nada por hacer' : 'Sin tareas terminadas'}
            description={filter === 'open' ? 'Cuando te asignen una tarea aparecerá aquí.' : undefined}
          />
        </Card>
      )}
    </Screen>
  );
}
