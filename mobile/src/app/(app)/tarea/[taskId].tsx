import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { EvidenceItem, useTaskEvidences, useUploadEvidence } from '@/features/evidences';
import { TaskStatusBadge, useTask } from '@/features/tasks';
import { useOffline } from '@/offline';
import { errorMessage } from '@/services/apiError';
import { colors, spacing } from '@/theme/tokens';
import { TaskStatus } from '@/types';
import type { UploadEvidenceRequest } from '@/types';
import { AppButton, AppText, Card, EmptyState, Icon, PhotoField, Screen, SectionTitle, TextField } from '@/ui';
import type { IconName } from '@/ui';
import { formatDue } from '@/utils/format';
import { newId } from '@/utils/id';

function Meta({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={15} color={colors.blue700} />
      <AppText variant="small" tone="muted">
        {children}
      </AppText>
    </View>
  );
}

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { online, pending } = useOffline();
  const task = useTask(taskId);
  const evidences = useTaskEvidences(taskId);
  const upload = useUploadEvidence();
  const [photo, setPhoto] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const queued = pending
    .map((item) => (item.kind === 'evidence' && item.payload.taskId === taskId ? item.payload : null))
    .filter((payload): payload is UploadEvidenceRequest => payload !== null);

  const submit = async () => {
    if (!taskId || !photo) return;
    try {
      const result = await upload.mutateAsync({
        clientId: newId(),
        taskId,
        fileUri: photo,
        comment: comment.trim() || undefined,
        capturedAtDevice: new Date().toISOString(),
      });
      setPhoto(null);
      setComment('');
      Alert.alert(
        result.queued ? 'Evidencia guardada' : 'Evidencia enviada',
        result.queued ? 'Se enviará al volver la señal.' : 'Tu supervisor ya puede revisarla.',
      );
    } catch (error) {
      Alert.alert('No se pudo subir', errorMessage(error));
    }
  };

  if (task.isLoading) {
    return (
      <Screen withHeader>
        <ActivityIndicator color={colors.blue700} />
      </Screen>
    );
  }

  if (!task.data) {
    return (
      <Screen withHeader>
        <Card>
          <EmptyState
            title="Tarea no encontrada"
            description={errorMessage(task.error, 'Vuelve a tu lista de tareas.')}
          />
        </Card>
      </Screen>
    );
  }

  const { data } = task;
  const canUpload = data.status === TaskStatus.Pending || data.status === TaskStatus.InProgress;
  const sent = evidences.data ?? [];

  return (
    <Screen
      withHeader
      refreshing={task.isRefetching || evidences.isRefetching}
      onRefresh={() => {
        void task.refetch();
        void evidences.refetch();
      }}
    >
      <Card>
        <TaskStatusBadge status={data.status} />
        <AppText variant="heading">{data.title}</AppText>
        <Meta icon="pin">{data.siteName}</Meta>
        <Meta icon="calendar">{formatDue(data.dueAt)}</Meta>
        <Meta icon="user">{`Asignada por ${data.createdByName}`}</Meta>
        {data.description && <AppText style={styles.description}>{data.description}</AppText>}
      </Card>

      {canUpload && (
        <>
          <SectionTitle>Subir evidencia</SectionTitle>
          <Card>
            <PhotoField value={photo} onChange={setPhoto} label="Tomar foto de la evidencia" />
            <TextField
              label="Comentario (opcional)"
              value={comment}
              onChangeText={setComment}
              placeholder="Ej. Foto después de terminar"
              multiline
              maxLength={500}
            />
            <AppButton
              label={online ? 'Enviar evidencia' : 'Guardar sin conexión'}
              icon={online ? 'upload' : 'cloudOff'}
              disabled={!photo}
              loading={upload.isPending}
              onPress={() => void submit()}
            />
          </Card>
        </>
      )}

      <SectionTitle>{`Evidencias (${sent.length + queued.length})`}</SectionTitle>
      <Card>
        {evidences.isLoading ? (
          <ActivityIndicator color={colors.blue700} />
        ) : sent.length + queued.length === 0 ? (
          <EmptyState icon="photo" title="Sin evidencias" description="Las fotos que subas aparecerán aquí." />
        ) : (
          <>
            {queued.map((item) => (
              <EvidenceItem
                key={item.clientId}
                queued
                evidence={{ fileUrl: item.fileUri, capturedAtDevice: item.capturedAtDevice, comment: item.comment }}
              />
            ))}
            {sent.map((evidence) => (
              <EvidenceItem key={evidence.id} evidence={evidence} />
            ))}
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  description: { marginTop: spacing.xs },
});
