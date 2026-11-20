import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { AttendanceReportQuery } from '@/types';
import { queryKeys } from '@/services/queryKeys';
import { reportService } from './api';

export const useAttendanceReport = (query: AttendanceReportQuery) =>
  useQuery({
    queryKey: queryKeys.attendanceReport(query),
    queryFn: () => reportService.attendance(query),
    // Mantiene la tabla visible mientras se cargan los nuevos filtros.
    placeholderData: keepPreviousData,
  });
