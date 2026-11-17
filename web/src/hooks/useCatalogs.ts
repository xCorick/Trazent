import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/services';
import { queryKeys } from './queryKeys';

export const useSites = () =>
  useQuery({ queryKey: queryKeys.sites, queryFn: catalogService.sites, staleTime: 5 * 60_000 });

export const useContractors = () =>
  useQuery({ queryKey: queryKeys.contractors, queryFn: catalogService.contractors, staleTime: 5 * 60_000 });
