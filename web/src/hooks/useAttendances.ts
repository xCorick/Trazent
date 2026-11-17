import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceService, dashboardService } from '@/services';
import type { CheckInRequest } from '@/types';
import { queryKeys } from './queryKeys';

export const useTodayAttendances = () =>
  useQuery({ queryKey: queryKeys.attendancesToday, queryFn: attendanceService.today });

export const useMyAttendances = () => useQuery({ queryKey: queryKeys.myAttendances, queryFn: attendanceService.mine });

export const useDashboardSummary = () => useQuery({ queryKey: queryKeys.dashboard, queryFn: dashboardService.summary });

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
