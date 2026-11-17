import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AttendanceHistoryItem, TodayCard, useMyAttendances } from '@/features/attendance';
import { useSession } from '@/features/auth';
import { TaskCard, useMyTasks } from '@/features/tasks';
import { useOffline } from '@/offline';
import { colors } from '@/theme/tokens';
import { TaskStatus } from '@/types';
import { AppButton, Banner, Card, EmptyState, Screen, SectionTitle } from '@/ui';
import { firstName } from '@/utils/format';

export default function HomeScreen() {
  const { user } = useSession();
  const { online, pending, syncing } = useOffline();
  const tasks = useMyTasks();
  const attendances = useMyAttendances();

  const openTasks = (tasks.data ?? []).filter(
    (task) => task.status === TaskStatus.Pending || task.status === TaskStatus.InProgress,
  );

  const refresh = () => {
    void tasks.refetch();
    void attendances.refetch();
  };

  let syncText: string;
  if (!online) syncText = 'Sin conexión: tus registros se guardan en el teléfono y se envían al volver la señal.';
  else if (syncing) syncText = 'Enviando registros pendientes…';
  else if (pending.length > 0) syncText = `${pending.length} registro(s) pendiente(s) de enviar.`;
  else syncText = 'Todo sincronizado.';

  return (
    <Screen refreshing={tasks.isRefetching || attendances.isRefetching} onRefresh={refresh}>
      <TodayCard
        greeting={`Hola, ${user ? firstName(user.fullName) : ''}`}
        onRegister={() => router.navigate('/asistencia')}
      />

      <Banner
        tone={!online ? 'orange' : pending.length > 0 ? 'blue' : 'green'}
        icon={!online ? 'cloudOff' : syncing ? 'sync' : 'cloud'}
      >
        {syncText}
      </Banner>

      <SectionTitle
        action={<AppButton label="Ver todas" variant="ghost" size="md" onPress={() => router.navigate('/tareas')} />}
      >
        Tareas pendientes
      </SectionTitle>
      {tasks.isLoading ? (
        <ActivityIndicator color={colors.blue700} />
      ) : openTasks.length > 0 ? (
        openTasks
          .slice(0, 3)
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => router.push({ pathname: '/tarea/[taskId]', params: { taskId: task.id } })}
            />
          ))
      ) : (
        <Card>
          <EmptyState title="Sin tareas pendientes" description="Cuando te asignen una tarea aparecerá aquí." />
        </Card>
      )}

      <SectionTitle>Mis últimos registros</SectionTitle>
      <Card>
        {attendances.isLoading ? (
          <ActivityIndicator color={colors.blue700} />
        ) : attendances.data?.length ? (
          <View>
            {attendances.data.slice(0, 4).map((attendance) => (
              <AttendanceHistoryItem key={attendance.id} attendance={attendance} />
            ))}
          </View>
        ) : (
          <EmptyState icon="clock" title="Sin registros" description="Tu primera entrada aparecerá aquí." />
        )}
      </Card>
    </Screen>
  );
}
