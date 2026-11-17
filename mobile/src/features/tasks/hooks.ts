import { useQuery } from '@tanstack/react-query';
import { taskService } from '@/services';
import { queryKeys } from '@/services/queryKeys';

export const useMyTasks = () => useQuery({ queryKey: queryKeys.myTasks, queryFn: taskService.mine });

export const useTask = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.task(id ?? ''),
    queryFn: () => taskService.get(id as string),
    enabled: Boolean(id),
  });
