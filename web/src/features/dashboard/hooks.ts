import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { dashboardService } from './api';

export const useDashboardSummary = () => useQuery({ queryKey: queryKeys.dashboard, queryFn: dashboardService.summary });
