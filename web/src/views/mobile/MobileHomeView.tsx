import { CameraOutlined, CheckCircleFilled, CloudSyncOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { GeofenceTag } from '@/atoms';
import { useConnectivity } from '@/components/mobile';
import { useAuth } from '@/context/AuthContext';
import { useMyAttendances } from '@/features/attendance';
import { useMyTasks } from '@/features/tasks';
import { EmptyState, SectionTitle, TaskCard } from '@/molecules';
import { paths } from '@/routes/paths';
import { AttendanceType, TaskStatus } from '@/types';
import { firstName, formatTime, formatToday } from '@/utils/format';

/** PROTOTIPO MÓVIL · Inicio del contratista. */
export function MobileHomeView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { offline } = useConnectivity();
  const attendances = useMyAttendances();
  const tasks = useMyTasks();

  const last = attendances.data?.[0];
  const isWorking = last?.type === AttendanceType.CheckIn;
  const openTasks = (tasks.data ?? []).filter(
    (task) => task.status === TaskStatus.Pending || task.status === TaskStatus.InProgress,
  );

  return (
    <div className="tz-m-page">
      <section className="tz-m-hero">
        <span className="tz-m-hero__date">{formatToday()}</span>
        <h1>Hola, {user ? firstName(user.fullName) : ''}</h1>
        {attendances.isLoading ? (
          <Skeleton.Input active size="small" />
        ) : last ? (
          <div className="tz-m-hero__status">
            <CheckCircleFilled />
            <span>
              {isWorking ? 'Entrada' : 'Salida'} registrada a las {formatTime(last.receivedAtServer)} · {last.siteName}
            </span>
          </div>
        ) : (
          <div className="tz-m-hero__status">Aún no registras tu entrada de hoy.</div>
        )}
        {last && (
          <div className="tz-m-hero__tag">
            <GeofenceTag status={last.geofenceStatus} distanceMeters={last.distanceMeters} />
          </div>
        )}
        <Button
          type="primary"
          size="large"
          block
          icon={<CameraOutlined />}
          className="tz-m-hero__cta"
          onClick={() => navigate(paths.mobileAttendance)}
        >
          {isWorking ? 'Registrar salida' : 'Registrar entrada'}
        </Button>
      </section>

      <div className={`tz-m-sync${offline ? ' is-offline' : ''}`}>
        <CloudSyncOutlined />
        <span>
          {offline
            ? 'Sin conexión: tus registros se guardan en el teléfono y se envían al volver la señal.'
            : 'Todo sincronizado. No tienes registros pendientes.'}
        </span>
      </div>

      <SectionTitle
        action={
          <Button type="link" size="small" onClick={() => navigate(paths.mobileTasks)}>
            Ver todas
          </Button>
        }
      >
        Tareas pendientes
      </SectionTitle>
      {tasks.isLoading ? (
        <Skeleton active />
      ) : openTasks.length > 0 ? (
        <div className="tz-stack">
          {openTasks.slice(0, 3).map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => navigate(paths.mobileTask(task.id))} />
          ))}
        </div>
      ) : (
        <EmptyState title="Sin tareas pendientes" description="Cuando te asignen una tarea aparecerá aquí." />
      )}
    </div>
  );
}
