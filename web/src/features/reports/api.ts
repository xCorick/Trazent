import { mockApi } from '@/mocks/mockApi';
import { ATTENDANCE_FIELDS } from '@/services/fragments';
import { gql, graphql } from '@/services/graphql';
import { mocksEnabled } from '@/services/mode';
import type { Attendance, AttendanceReportQuery } from '@/types';

const ATTENDANCE_REPORT = gql`
  query AttendanceReport($filter: AttendanceReportInput!) {
    reports {
      attendance(filter: $filter) {
        ...AttendanceFields
      }
    }
  }
  ${ATTENDANCE_FIELDS}
`;

export const reportService = {
  attendance: async (filter: AttendanceReportQuery): Promise<Attendance[]> => {
    if (mocksEnabled) return mockApi.reports.attendance(filter);
    return (await graphql<{ reports: { attendance: Attendance[] } }>(ATTENDANCE_REPORT, { filter })).reports.attendance;
  },
};
