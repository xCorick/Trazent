import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { persistPhoto } from '@/device/files';
import { outbox, useOffline } from '@/offline';
import { evidenceService } from '@/services';
import { isRetryable } from '@/services/apiError';
import { queryKeys } from '@/services/queryKeys';
import type { Evidence, UploadEvidenceRequest } from '@/types';

export const useTaskEvidences = (taskId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.taskEvidences(taskId ?? ''),
    queryFn: () => evidenceService.byTask(taskId as string),
    enabled: Boolean(taskId),
  });

export type UploadResult = { queued: false; evidence: Evidence } | { queued: true };

/** Sube una evidencia; sin señal la guarda en la cola local (igual que la asistencia). */
export function useUploadEvidence() {
  const queryClient = useQueryClient();
  const { online, refreshPending } = useOffline();

  const enqueue = async (request: UploadEvidenceRequest): Promise<UploadResult> => {
    const fileUri = await persistPhoto(request.fileUri, request.clientId);
    await outbox.enqueue({ id: request.clientId, kind: 'evidence', payload: { ...request, fileUri } });
    await refreshPending();
    return { queued: true };
  };

  return useMutation({
    mutationFn: async (request: UploadEvidenceRequest): Promise<UploadResult> => {
      if (!online) return enqueue(request);
      try {
        return { queued: false, evidence: await evidenceService.upload(request) };
      } catch (error) {
        if (isRetryable(error)) return enqueue(request);
        throw error;
      }
    },
    onSuccess: (result, request) => {
      if (result.queued) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.taskEvidences(request.taskId) });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
