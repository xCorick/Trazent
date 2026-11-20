import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { EvidenceQuery, ReviewEvidenceRequest, UploadEvidenceRequest } from '@/types';
import { queryKeys } from '@/services/queryKeys';
import { evidenceService } from './api';

export const useEvidences = (query: EvidenceQuery = {}) =>
  useQuery({ queryKey: queryKeys.evidences(query), queryFn: () => evidenceService.list(query) });

function useInvalidateEvidenceData() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['evidences'] });
    void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

export function useUploadEvidence() {
  const invalidate = useInvalidateEvidenceData();
  return useMutation({
    mutationFn: (request: UploadEvidenceRequest) => evidenceService.upload(request),
    onSuccess: invalidate,
  });
}

export function useReviewEvidence() {
  const invalidate = useInvalidateEvidenceData();
  return useMutation({
    mutationFn: (request: ReviewEvidenceRequest) => evidenceService.review(request),
    onSuccess: invalidate,
  });
}
