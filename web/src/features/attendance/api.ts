import { mockApi } from '@/mocks/mockApi';
import { ApiError } from '@/services/apiError';
import { ATTENDANCE_FIELDS } from '@/services/fragments';
import { gql, graphql } from '@/services/graphql';
import { mocksEnabled } from '@/services/mode';
import type { Attendance, CheckInRequest } from '@/types';

const TODAY = gql`
  query TodayAttendances {
    attendances {
      today {
        ...AttendanceFields
      }
    }
  }
  ${ATTENDANCE_FIELDS}
`;

const MINE = gql`
  query MyAttendances {
    attendances {
      mine {
        ...AttendanceFields
      }
    }
  }
  ${ATTENDANCE_FIELDS}
`;

export const attendanceService = {
  today: async (): Promise<Attendance[]> => {
    if (mocksEnabled) return mockApi.attendances.today();
    return (await graphql<{ attendances: { today: Attendance[] } }>(TODAY)).attendances.today;
  },
  mine: async (): Promise<Attendance[]> => {
    if (mocksEnabled) return mockApi.attendances.mine();
    return (await graphql<{ attendances: { mine: Attendance[] } }>(MINE)).attendances.mine;
  },
  /** Solo lo usan las vistas de prototipo del contratista; en producción registra la app móvil. */
  checkIn: async (request: CheckInRequest): Promise<Attendance> => {
    if (mocksEnabled) return mockApi.attendances.checkIn(request);
    throw new ApiError('La asistencia se registra desde la app móvil.', 400);
  },
};
