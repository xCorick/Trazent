# Contrato de la API GraphQL

Propuesta del contrato que esperan el panel web y la app móvil. Los nombres siguen el estilo que ya usa la API
(un controlador con `[GraphRoute("<dominio>")]` agrupa sus queries y mutations bajo ese campo), por ejemplo:

```graphql
query {
  tasks {
    mine {
      id
      title
      status
    }
  }
}
```

Si algún nombre cambia en la API, solo se ajusta el `api.ts` del dominio en la web (`web/src/features/*/api.ts`)
o `mobile/src/services/index.ts`.

## Convenciones

| Tema              | Regla                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint          | `POST <API_URL>/graphql`                                                                                                                              |
| Autenticación     | `Authorization: Bearer <accessToken>` en todo excepto `auth.login`                                                                                    |
| Empresa y usuario | **Nunca** llegan en el input: la API los toma del token (`company_id`, `user_id`)                                                                     |
| Nombres de campos | camelCase, iguales a `src/types/domain.ts` de web y móvil (`radiusMeters`, `capturedAtDevice`)                                                        |
| Enums del dominio | Como **`Int`** (el mismo `smallint` de la base), no como enum de GraphQL: los clientes usan enums numéricos (`Role.Admin = 0`)                        |
| Identificadores   | `ID` (UUID como texto)                                                                                                                                |
| Fechas            | Texto ISO 8601 con zona horaria (`2026-11-20T15:04:05Z`)                                                                                              |
| Fotos             | Se guardan como llave de Cloudinary (`photo_key`, `file_key`); al consultarlas la API devuelve `photoUrl` / `fileUrl` como **URL de entrega firmada** |

## Errores

Cada error lleva un código en `errors[].extensions.code`. Los clientes lo traducen a un estatus HTTP para decidir si
reintentan (la cola sin conexión del móvil reintenta solo 401, 408, 429 y 5xx).

| `extensions.code` | Cuándo                                               | Equivale a | ¿El móvil reintenta?           |
| ----------------- | ---------------------------------------------------- | ---------- | ------------------------------ |
| `UNAUTHENTICATED` | Token ausente o vencido                              | 401        | Sí, al volver a iniciar sesión |
| `FORBIDDEN`       | El rol no puede hacer la operación                   | 403        | No                             |
| `NOT_FOUND`       | El registro no existe o no es de la empresa          | 404        | No                             |
| `CONFLICT`        | Choque de datos (por ejemplo, correo repetido)       | 409        | No                             |
| `BAD_USER_INPUT`  | Validación fallida (mensaje legible para el usuario) | 422        | No                             |
| cualquier otro    | Error inesperado del servidor                        | 500        | Sí                             |

Un `clientId` repetido **no es error**: la operación devuelve el registro que ya existía (idempotencia).

## Operaciones

| Dominio     | Operación                                                                      | Tipo     | Quién la usa             | Función de base de datos                                         |
| ----------- | ------------------------------------------------------------------------------ | -------- | ------------------------ | ---------------------------------------------------------------- |
| auth        | `login(input: LoginInput!)` → `{ accessToken refreshToken user }`              | mutation | web, móvil               | `get_user_for_login`, `create_refresh_token`                     |
| auth        | `refresh(refreshToken: String!)` → `{ accessToken refreshToken user }`         | mutation | web, móvil               | `rotate_refresh_token`                                           |
| auth        | `logout` → `Boolean`                                                           | mutation | web, móvil               | `revoke_refresh_token`                                           |
| dashboard   | `summary` → `DashboardSummary`                                                 | query    | web                      | `get_attendance_dashboard`, `get_task_dashboard`                 |
| sites       | `active` → `[Site]`                                                            | query    | web, móvil               | `get_sites_by_company` (activos) / `get_my_sites`                |
| sites       | `list` → `[Site]` (incluye inactivos)                                          | query    | web (admin)              | `get_sites_by_company`                                           |
| sites       | `create(input: CreateSiteInput!)` / `update(input: UpdateSiteInput!)` → `Site` | mutation | web (admin)              | `create_site`, `update_site`, `change_site_status`               |
| users       | `list` → `[User]`                                                              | query    | web (admin)              | `get_users_by_company`                                           |
| users       | `activeContractors` → `[User]`                                                 | query    | web                      | `get_contractors_by_company`                                     |
| users       | `create(input: CreateUserInput!)` → `{ user temporaryPassword }`               | mutation | web (admin)              | `create_user`, `create_contractor`                               |
| users       | `update(input: UpdateUserInput!)` → `User`                                     | mutation | web (admin)              | `update_user_profile`, `update_contractor`, `change_user_status` |
| tasks       | `list(filter: TaskFilterInput)` → `[Task]`                                     | query    | web                      | `get_tasks_by_company`                                           |
| tasks       | `mine` → `[Task]`                                                              | query    | móvil                    | `get_my_tasks`                                                   |
| tasks       | `byId(id: ID!)` → `Task`                                                       | query    | web, móvil               | `get_task_by_id`                                                 |
| tasks       | `create(input: CreateTaskInput!)` → `Task`                                     | mutation | web                      | `create_task`                                                    |
| evidences   | `list(filter: EvidenceFilterInput)` → `[Evidence]`                             | query    | web                      | `get_evidences_by_company`                                       |
| evidences   | `byTask(taskId: ID!)` → `[Evidence]`                                           | query    | móvil                    | `get_evidences_by_task`                                          |
| evidences   | `register(input: RegisterEvidenceInput!)` → `Evidence`                         | mutation | móvil                    | `register_evidence`                                              |
| evidences   | `review(input: ReviewEvidenceInput!)` → `Evidence`                             | mutation | web                      | `review_evidence`                                                |
| attendances | `today` → `[Attendance]`                                                       | query    | web                      | `get_attendances_by_company` (hoy)                               |
| attendances | `mine` → `[Attendance]`                                                        | query    | móvil                    | `get_my_attendances`                                             |
| attendances | `register(input: RegisterAttendanceInput!)` → `Attendance`                     | mutation | móvil                    | `register_attendance`                                            |
| attendances | `review(input: ReviewAttendanceInput!)` → `Attendance`                         | mutation | web (pantalla pendiente) | `review_attendance`                                              |
| reports     | `attendance(filter: AttendanceReportInput!)` → `[Attendance]`                  | query    | web                      | `get_attendances_by_company`                                     |
| uploads     | `createSignature(input: UploadSignatureInput!)` → `UploadSignature`            | mutation | móvil                    | — (firma con Cloudinary)                                         |
| devices     | `registerToken(input: RegisterDeviceTokenInput!)` → `Boolean`                  | mutation | móvil                    | `register_device_token`                                          |

## Tipos de entrada

```graphql
input LoginInput {
  email: String!
  password: String!
}

input TaskFilterInput {
  status: Int
  assignedToId: ID
}
input CreateTaskInput {
  siteId: ID!
  assignedToId: ID!
  title: String!
  description: String
  dueAt: String
}

input EvidenceFilterInput {
  status: Int
  taskId: ID
}
input RegisterEvidenceInput {
  clientId: ID!
  taskId: ID!
  fileKey: String!
  comment: String
  capturedAtDevice: String!
}
input ReviewEvidenceInput {
  evidenceId: ID!
  approve: Boolean!
  comment: String
} # rechazo exige comment
input RegisterAttendanceInput {
  clientId: ID!
  siteId: ID!
  type: Int!
  capturedAtDevice: String!
  latitude: Float!
  longitude: Float!
  accuracyMeters: Float
  isMocked: Boolean!
  photoKey: String!
  capturedOffline: Boolean!
}
input ReviewAttendanceInput {
  attendanceId: ID!
  accept: Boolean!
  verificationMethod: Int!
  comment: String
}
input AttendanceReportInput {
  from: String!
  to: String!
  siteId: ID
  userId: ID
} # fechas YYYY-MM-DD
input CreateUserInput {
  fullName: String!
  email: String!
  role: Int!
  phoneNumber: String
  specialty: String
}
input UpdateUserInput {
  id: ID!
  fullName: String
  email: String
  role: Int
  phoneNumber: String
  specialty: String
  status: Int
}
input CreateSiteInput {
  name: String!
  address: String
  latitude: Float!
  longitude: Float!
  radiusMeters: Int!
}
input UpdateSiteInput {
  id: ID!
  name: String
  address: String
  latitude: Float
  longitude: Float
  radiusMeters: Int
  isActive: Boolean
}

enum UploadKind {
  ATTENDANCE
  EVIDENCE
}
input UploadSignatureInput {
  kind: UploadKind!
  clientId: ID!
}
input RegisterDeviceTokenInput {
  token: String!
  platform: Int!
} # 0 Android, 1 iOS, 2 Web
```

Los tipos de salida (`User`, `Site`, `Task`, `Evidence`, `Attendance`, `DashboardSummary`) tienen exactamente los
campos que piden los fragmentos de `web/src/services/fragments.ts` y `mobile/src/services/fragments.ts`.

## Subida de fotos a Cloudinary (subida firmada directa)

La foto nunca pasa por la API: la API firma, el teléfono sube directo a Cloudinary y después registra con la llave.

1. **`uploads.createSignature`** devuelve:

   ```graphql
   type UploadSignature {
     cloudName: String!
     apiKey: String!
     timestamp: Int! # segundos Unix; la firma vale 1 hora
     signature: String! # sobre folder, public_id, timestamp y type, con el API secret
     folder: String! # p. ej. trazent/<companyId>/attendances
     publicId: String! # derivado del clientId: repetir la subida sobrescribe la misma foto
     deliveryType: String! # "authenticated": las fotos no son públicas
   }
   ```

   La API arma `folder` y `publicId` (el cliente no los elige) y firma exactamente esos campos con `CloudinaryDotNet`.

2. **El móvil hace `POST` multipart** a `https://api.cloudinary.com/v1_1/<cloudName>/image/upload` con `file`,
   `api_key`, `timestamp`, `signature`, `folder`, `public_id` y `type`.
3. **`attendances.register` / `evidences.register`** reciben `photoKey` / `fileKey` (el `public_id`). Antes de
   registrar, la API consulta el recurso en Cloudinary (que exista, que sea imagen, tamaño máximo) y responde
   `BAD_USER_INPUT` si no cumple.
4. **Al consultar**, la API convierte la llave en una URL de entrega firmada (`photoUrl`, `fileUrl`). El panel puede
   pedir una miniatura con transformación (por ejemplo, ancho 400 y `q_auto`).

Variables de entorno de la API: `Cloudinary__CloudName`, `Cloudinary__ApiKey`, `Cloudinary__ApiSecret`.

## Notificaciones push (Expo Push Service)

1. Al iniciar sesión, el móvil manda su token de Expo con `devices.registerToken`.
2. Cuando ocurre un evento para el contratista (le asignan una tarea, le rechazan una evidencia), la API busca sus
   tokens (`get_device_tokens_by_user`) y hace `POST https://exp.host/--/api/v2/push/send`.
3. Una tarea periódica revisa los recibos de Expo y borra los tokens con `DeviceNotRegistered`
   (`delete_device_token`, `delete_stale_device_tokens`).
