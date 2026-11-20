import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateTaskRequest, TaskQuery } from '@/types';
import { queryKeys } from '@/services/queryKeys';
import { taskService } from './api';

export const useTasks = (query: TaskQuery = {}) =>
  useQuery({ queryKey: queryKeys.tasks(query), queryFn: () => taskService.list(query) });

export const useMyTasks = () => useQuery({ queryKey: queryKeys.myTasks, queryFn: taskService.mine });

export const useTask = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.task(id ?? ''),
    queryFn: () => taskService.get(id as string),
    enabled: Boolean(id),
  });

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateTaskRequest) => taskService.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
