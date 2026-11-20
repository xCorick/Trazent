import { mockApi } from '@/mocks/mockApi';
import { ApiError } from '@/services/apiError';
import { EVIDENCE_FIELDS } from '@/services/fragments';
import { gql, graphql } from '@/services/graphql';
import { mocksEnabled } from '@/services/mode';
import type { Evidence, EvidenceQuery, ReviewEvidenceRequest, UploadEvidenceRequest } from '@/types';

const EVIDENCES = gql`
  query Evidences($filter: EvidenceFilterInput) {
    evidences {
      list(filter: $filter) {
        ...EvidenceFields
      }
    }
  }
  ${EVIDENCE_FIELDS}
`;

const REVIEW_EVIDENCE = gql`
  mutation ReviewEvidence($input: ReviewEvidenceInput!) {
    evidences {
      review(input: $input) {
        ...EvidenceFields
      }
    }
  }
  ${EVIDENCE_FIELDS}
`;

export const evidenceService = {
  list: async (filter?: EvidenceQuery): Promise<Evidence[]> => {
    if (mocksEnabled) return mockApi.evidences.list(filter);
    return (await graphql<{ evidences: { list: Evidence[] } }>(EVIDENCES, { filter })).evidences.list;
  },
  /** Solo lo usan las vistas de prototipo del contratista; en producción sube la app móvil. */
  upload: async (request: UploadEvidenceRequest): Promise<Evidence> => {
    if (mocksEnabled) return mockApi.evidences.upload(request);
    throw new ApiError('Las evidencias se suben desde la app móvil.', 400);
  },
  review: async (input: ReviewEvidenceRequest): Promise<Evidence> => {
    if (mocksEnabled) return mockApi.evidences.review(input);
    return (await graphql<{ evidences: { review: Evidence } }>(REVIEW_EVIDENCE, { input })).evidences.review;
  },
};
