import { env } from '@/config/env';
import { mockApi } from '@/mocks/mockApi';
import type {
  Attendance,
  CheckInRequest,
  Evidence,
  LoginRequest,
  LoginResponse,
  RegisterDeviceTokenRequest,
  Site,
  Task,
  UploadEvidenceRequest,
  User,
} from '@/types';
import { ATTENDANCE_FIELDS, EVIDENCE_FIELDS, SITE_FIELDS, TASK_FIELDS, USER_FIELDS } from './fragments';
import { gql, graphql } from './graphql';
import { uploadImage } from './imageUpload';

/**
 * Capa de servicios de la app. Pantallas, hooks y la cola sin conexión solo usan estos
 * métodos. El contrato GraphQL está en docs/api-graphql.md.
 */
const mocksEnabled = env.useMocks;

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    auth {
      login(input: $input) {
        accessToken
        refreshToken
        user {
          ...UserFields
        }
      }
    }
  }
  ${USER_FIELDS}
`;

const LOGOUT = gql`
  mutation Logout {
    auth {
      logout
    }
  }
`;

export const authService = {
  login: async (input: LoginRequest): Promise<LoginResponse> => {
    if (mocksEnabled) return mockApi.auth.login(input);
    const data = await graphql<{ auth: { login: LoginResponse } }>(LOGIN, { input });
    return data.auth.login;
  },
  logout: async (): Promise<void> => {
    if (mocksEnabled) return mockApi.auth.logout();
    await graphql(LOGOUT);
  },
  restoreSession: (user: User) => {
    if (mocksEnabled) mockApi.auth.restore(user.id);
  },
};

const ACTIVE_SITES = gql`
  query ActiveSites {
    sites {
      active {
        ...SiteFields
      }
    }
  }
  ${SITE_FIELDS}
`;

export const catalogService = {
  sites: async (): Promise<Site[]> => {
    if (mocksEnabled) return mockApi.catalogs.sites();
    return (await graphql<{ sites: { active: Site[] } }>(ACTIVE_SITES)).sites.active;
  },
};

const MY_TASKS = gql`
  query MyTasks {
    tasks {
      mine {
        ...TaskFields
      }
    }
  }
  ${TASK_FIELDS}
`;

const TASK_BY_ID = gql`
  query TaskById($id: ID!) {
    tasks {
      byId(id: $id) {
        ...TaskFields
      }
    }
  }
  ${TASK_FIELDS}
`;

export const taskService = {
  mine: async (): Promise<Task[]> => {
    if (mocksEnabled) return mockApi.tasks.mine();
    return (await graphql<{ tasks: { mine: Task[] } }>(MY_TASKS)).tasks.mine;
  },
  get: async (id: string): Promise<Task> => {
    if (mocksEnabled) return mockApi.tasks.get(id);
    return (await graphql<{ tasks: { byId: Task } }>(TASK_BY_ID, { id })).tasks.byId;
  },
};

const EVIDENCES_BY_TASK = gql`
  query EvidencesByTask($taskId: ID!) {
    evidences {
      byTask(taskId: $taskId) {
        ...EvidenceFields
      }
    }
  }
  ${EVIDENCE_FIELDS}
`;

const REGISTER_EVIDENCE = gql`
  mutation RegisterEvidence($input: RegisterEvidenceInput!) {
    evidences {
      register(input: $input) {
        ...EvidenceFields
      }
    }
  }
  ${EVIDENCE_FIELDS}
`;

export const evidenceService = {
  byTask: async (taskId: string): Promise<Evidence[]> => {
    if (mocksEnabled) return mockApi.evidences.byTask(taskId);
    return (await graphql<{ evidences: { byTask: Evidence[] } }>(EVIDENCES_BY_TASK, { taskId })).evidences.byTask;
  },
  /** Sube la foto a Cloudinary y registra la evidencia con su public_id. */
  upload: async (request: UploadEvidenceRequest): Promise<Evidence> => {
    if (mocksEnabled) return mockApi.evidences.upload(request);
    const fileKey = await uploadImage('EVIDENCE', request.clientId, request.fileUri);
    const { fileUri: _fileUri, ...fields } = request;
    const data = await graphql<{ evidences: { register: Evidence } }>(REGISTER_EVIDENCE, {
      input: { ...fields, fileKey },
    });
    return data.evidences.register;
  },
};

const MY_ATTENDANCES = gql`
  query MyAttendances {
    attendances {
      mine {
        ...AttendanceFields
      }
    }
  }
  ${ATTENDANCE_FIELDS}
`;

const REGISTER_ATTENDANCE = gql`
  mutation RegisterAttendance($input: RegisterAttendanceInput!) {
    attendances {
      register(input: $input) {
        ...AttendanceFields
      }
    }
  }
  ${ATTENDANCE_FIELDS}
`;

export const attendanceService = {
  mine: async (): Promise<Attendance[]> => {
    if (mocksEnabled) return mockApi.attendances.mine();
    return (await graphql<{ attendances: { mine: Attendance[] } }>(MY_ATTENDANCES)).attendances.mine;
  },
  /** Sube la foto a Cloudinary y registra la asistencia con su public_id. */
  checkIn: async (request: CheckInRequest): Promise<Attendance> => {
    if (mocksEnabled) return mockApi.attendances.checkIn(request);
    const photoKey = await uploadImage('ATTENDANCE', request.clientId, request.photoUri);
    const { photoUri: _photoUri, ...fields } = request;
    const data = await graphql<{ attendances: { register: Attendance } }>(REGISTER_ATTENDANCE, {
      input: { ...fields, photoKey },
    });
    return data.attendances.register;
  },
};

const REGISTER_DEVICE_TOKEN = gql`
  mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {
    devices {
      registerToken(input: $input)
    }
  }
`;

export const deviceService = {
  /** Guarda el token de Expo Push del teléfono para recibir notificaciones. */
  registerToken: async (input: RegisterDeviceTokenRequest): Promise<void> => {
    if (mocksEnabled) return;
    await graphql(REGISTER_DEVICE_TOKEN, { input });
  },
};
