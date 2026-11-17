import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { persistPhoto } from '@/device/files';
import { outbox, useOffline } from '@/offline';
import { attendanceService, catalogService } from '@/services';
import { isRetryable } from '@/services/apiError';
import { queryKeys } from '@/services/queryKeys';
import { AttendanceType } from '@/types';
import type { Attendance, CheckInRequest } from '@/types';

export const useSites = () => useQuery({ queryKey: queryKeys.sites, queryFn: catalogService.sites });

export const useMyAttendances = () => useQuery({ queryKey: queryKeys.myAttendances, queryFn: attendanceService.mine });

export type CheckInDraft = Omit<CheckInRequest, 'capturedOffline'>;

export type CheckInResult = { queued: false; attendance: Attendance } | { queued: true };

/**
 * Registra entrada o salida. Con señal la envía a la API; sin señal (o si el envío
 * falla por la red) la guarda en la cola local y se envía al sincronizar.
 */
export function useCheckIn() {
  const queryClient = useQueryClient();
  const { online, refreshPending } = useOffline();

  const enqueue = async (draft: CheckInDraft): Promise<CheckInResult> => {
    const photoUri = await persistPhoto(draft.photoUri, draft.clientId);
    await outbox.enqueue({
      id: draft.clientId,
      kind: 'check-in',
      payload: { ...draft, photoUri, capturedOffline: true },
    });
    await refreshPending();
    return { queued: true };
  };

  return useMutation({
    mutationFn: async (draft: CheckInDraft): Promise<CheckInResult> => {
      if (!online) return enqueue(draft);
      try {
        const attendance = await attendanceService.checkIn({ ...draft, capturedOffline: false });
        return { queued: false, attendance };
      } catch (error) {
        if (isRetryable(error)) return enqueue(draft);
        throw error;
      }
    },
    onSuccess: (result) => {
      if (!result.queued) void queryClient.invalidateQueries({ queryKey: queryKeys.myAttendances });
    },
  });
}

/**
 * Último movimiento del contratista, contando también lo que está en cola.
 * Decide si toca registrar entrada o salida.
 */
export function useLastMovement() {
  const attendances = useMyAttendances();
  const { pending } = useOffline();

  return useMemo(() => {
    const queued = pending
      .filter((item) => item.kind === 'check-in')
      .map((item) => (item.kind === 'check-in' ? item.payload : null))
      .filter((payload): payload is CheckInRequest => payload !== null)
      .at(-1);
    const last = attendances.data?.[0];

    const lastType = queued?.type ?? last?.type;
    return {
      isLoading: attendances.isLoading,
      last,
      queued,
      nextType: lastType === AttendanceType.CheckIn ? AttendanceType.CheckOut : AttendanceType.CheckIn,
    };
  }, [attendances.data, attendances.isLoading, pending]);
}
