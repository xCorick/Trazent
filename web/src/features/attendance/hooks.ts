import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CheckInRequest } from '@/types';
import { queryKeys } from '@/services/queryKeys';
import { attendanceService } from './api';

export const useTodayAttendances = () =>
  useQuery({ queryKey: queryKeys.attendancesToday, queryFn: attendanceService.today });

export const useMyAttendances = () => useQuery({ queryKey: queryKeys.myAttendances, queryFn: attendanceService.mine });

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CheckInRequest) => attendanceService.checkIn(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendances'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
