import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { siteService, userService } from '@/services';
import type { CreateUserRequest, SaveSiteRequest, UpdateSiteRequest, UpdateUserRequest } from '@/types';
import { queryKeys } from './queryKeys';

/** Hooks de las pantallas de administración (usuarios, sitios y geocercas). */

export const useUsers = () => useQuery({ queryKey: queryKeys.users, queryFn: userService.list });

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.users });
    void queryClient.invalidateQueries({ queryKey: queryKeys.contractors });
  };
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (request: CreateUserRequest) => userService.create(request),
    onSuccess: invalidate,
  });
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (request: UpdateUserRequest) => userService.update(request),
    onSuccess: invalidate,
  });
}

export const useAllSites = () => useQuery({ queryKey: queryKeys.allSites, queryFn: siteService.list });

function useInvalidateSites() {
  const queryClient = useQueryClient();
  return () => {
    // Invalida tanto la lista completa como el catálogo de sitios activos.
    void queryClient.invalidateQueries({ queryKey: ['sites'] });
    void queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };
}

export function useCreateSite() {
  const invalidate = useInvalidateSites();
  return useMutation({ mutationFn: (request: SaveSiteRequest) => siteService.create(request), onSuccess: invalidate });
}

export function useUpdateSite() {
  const invalidate = useInvalidateSites();
  return useMutation({
    mutationFn: (request: UpdateSiteRequest) => siteService.update(request),
    onSuccess: invalidate,
  });
}
