import { mockApi } from '@/mocks/mockApi';
import { DASHBOARD_FIELDS } from '@/services/fragments';
import { gql, graphql } from '@/services/graphql';
import { mocksEnabled } from '@/services/mode';
import type { DashboardSummary } from '@/types';

const SUMMARY = gql`
  query DashboardSummary {
    dashboard {
      summary {
        ...DashboardFields
      }
    }
  }
  ${DASHBOARD_FIELDS}
`;

export const dashboardService = {
  summary: async (): Promise<DashboardSummary> => {
    if (mocksEnabled) return mockApi.dashboard.summary();
    return (await graphql<{ dashboard: { summary: DashboardSummary } }>(SUMMARY)).dashboard.summary;
  },
};
