import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CloudUploadOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, App, Button, Input, Skeleton } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TaskStatusTag } from '@/atoms';
import { useConnectivity } from '@/components/mobile';
import { useEvidences, useUploadEvidence } from '@/hooks/useEvidences';
import { useTask } from '@/hooks/useTasks';
import { EmptyState, EvidenceCard, PhotoPicker, SectionTitle } from '@/molecules';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services/apiError';
import { ReviewStatus, TaskStatus } from '@/types';
import { formatDue } from '@/utils/format';
import { newId } from '@/utils/id';

/** PROTOTIPO MÓVIL · Detalle de una tarea y carga de evidencias. */
export function MobileTaskDetailView() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { offline } = useConnectivity();
  const task = useTask(taskId);
  const evidences = useEvidences({ taskId });
  const upload = useUploadEvidence();
  const [photo, setPhoto] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const submit = async () => {
    if (!taskId || !photo) return;
    try {
      await upload.mutateAsync({
        clientId: newId(),
        taskId,
        fileDataUrl: photo,
        comment: comment.trim() || undefined,
        capturedAtDevice: new Date().toISOString(),
      });
      message.success(
        offline ? 'Evidencia guardada; se enviará al volver la señal.' : 'Evidencia enviada al supervisor.',
      );
      setPhoto(null);
      setComment('');
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  const back = (
    <Button type="link" icon={<ArrowLeftOutlined />} className="tz-m-back" onClick={() => navigate(paths.mobileTasks)}>
      Mis tareas
    </Button>
  );

  if (task.isLoading) {
    return (
      <div className="tz-m-page">
        {back}
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!task.data) {
    return (
      <div className="tz-m-page">
        {back}
        <EmptyState title="Tarea no encontrada" />
      </div>
    );
  }

  const current = task.data;
  const canUpload = current.status !== TaskStatus.Completed && current.status !== TaskStatus.Cancelled;

  return (
    <div className="tz-m-page">
      {back}
      <section className="tz-m-task">
        <TaskStatusTag status={current.status} />
        <h1>{current.title}</h1>
        <div className="tz-m-task__meta">
          <span>
            <EnvironmentOutlined /> {current.siteName}
          </span>
          <span>
            <CalendarOutlined /> {formatDue(current.dueAt)}
          </span>
          <span>
            <UserOutlined /> Asignada por {current.createdByName}
          </span>
        </div>
        {current.description && <p className="tz-m-task__desc">{current.description}</p>}
      </section>

      {canUpload && (
        <>
          <SectionTitle>Subir evidencia</SectionTitle>
          <PhotoPicker value={photo} onChange={setPhoto} label="Tomar foto del trabajo" sampleLabel={current.title} />
          <Input.TextArea
            rows={2}
            maxLength={500}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Nota opcional para el supervisor"
          />
          <Button
            type="primary"
            size="large"
            block
            icon={<CloudUploadOutlined />}
            disabled={!photo}
            loading={upload.isPending}
            onClick={() => void submit()}
          >
            {offline ? 'Guardar sin conexión' : 'Enviar evidencia'}
          </Button>
        </>
      )}

      <SectionTitle>Evidencias enviadas</SectionTitle>
      {evidences.isLoading ? (
        <Skeleton active />
      ) : evidences.data && evidences.data.length > 0 ? (
        <div className="tz-stack">
          {evidences.data.some((e) => e.reviewStatus === ReviewStatus.Rejected) && (
            <Alert
              type="warning"
              showIcon
              message="Una evidencia fue rechazada. Revisa el comentario y envía una nueva foto."
            />
          )}
          {evidences.data.map((evidence) => (
            <EvidenceCard key={evidence.id} evidence={evidence} hideAuthor />
          ))}
        </div>
      ) : (
        <EmptyState title="Aún no envías evidencias" description="Toma una foto del trabajo terminado." />
      )}
    </div>
  );
}
