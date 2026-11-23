# Contrato de la API GraphQL

Contrato que esperan el panel web y la app móvil. Un controlador con `[GraphRoute("<dominio>")]` agrupa sus queries y
mutations bajo ese campo, por ejemplo:

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

Si algún nombre cambia en la API, solo se ajusta el `api.ts` del dominio en la web (`web/src/features/*/api.ts`) o
`mobile/src/services/index.ts`. Las decisiones citadas (`D-xx`, `P-xx`) están en `PROJECT_CONTEXT.md`; los supuestos
(`S-xx`), en `CURRENT_TASK.md`.

> **Pendiente de confirmar con María:** cómo viaja el código de empresa (S-01) y su formato (S-02). Lo marcado con
> _(S-01)_ o _(S-02)_ en este documento es una propuesta; los clientes la implementan en un solo archivo para poder
> cambiarla sin costo.

## Multiempresa

Trazent es un SaaS con **una base de datos por empresa** (D-21). Las bases nunca se comparten.

1. El cliente conoce el **código de empresa** antes de iniciar sesión: el panel lo toma de la ruta
   (`trazent.vercel.app/<código>/...`, D-23) y la app móvil lo pide en el primer inicio de sesión y lo guarda (D-22).
2. Cada petición lleva el código en el encabezado `X-Company-Code` _(S-01)_. `auth.login` además lo recibe en
   `LoginInput.companyCode`, porque todavía no hay token.
3. La API busca el código en el catálogo de empresas, obtiene la cadena de conexión de su base y ejecuta la operación
   solo sobre esa base. Dónde vive el catálogo está pendiente (P-10).
4. El token emitido por `auth.login` incluye el código de empresa. Si el encabezado no coincide con el del token, la API
   responde `FORBIDDEN` (D-24).
5. `company_id` y la tabla `companies` se conservan en cada base aunque sean redundantes; `companies` tiene una sola
   fila, la de esa empresa.

Formato del código _(S-02)_: minúsculas, números y guiones, de 3 a 40 caracteres (`^[a-z0-9-]{3,40}$`). Un código con
formato inválido o que no está en el catálogo responde `NOT_FOUND` con el mensaje «Empresa no encontrada».

## Convenciones

| Tema              | Regla                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint          | `POST <API_URL>/graphql`                                                                                                                              |
| Empresa           | Encabezado `X-Company-Code` en todas las peticiones _(S-01)_                                                                                          |
| Autenticación     | `Authorization: Bearer <accessToken>` en todo excepto `auth.login` y `auth.refresh`                                                                   |
| Usuario y empresa | **Nunca** llegan en el input: la API toma `user_id`, rol y `company_id` del token                                                                     |
| Nombres           | **lowerCamelCase**, sin sufijo `Async`, dentro del campo de su dominio: `tasks.mine`, `sites.create`, `auth.changePassword` (D-13)                    |
| Campos            | camelCase, iguales a `src/types/domain.ts` de web y móvil (`radiusMeters`, `capturedAtDevice`)                                                        |
| Enums del dominio | Como **`Int`** (el mismo `smallint` de la base), no como enum de GraphQL: los clientes usan enums numéricos (`Role.Admin = 0`)                        |
| Revisiones        | Campos planos `reviewStatus`, `reviewerName`, `reviewerComment`, `reviewedAt` en evidencias y asistencias; nunca un objeto `review` (D-20)            |
| Identificadores   | `ID` (UUID como texto)                                                                                                                                |
| Fechas            | Texto ISO 8601 con zona horaria (`2026-11-20T15:04:05Z`)                                                                                              |
| Fotos             | Se guardan como llave de Cloudinary (`photo_key`, `file_key`); al consultarlas la API devuelve `photoUrl` / `fileUrl` como **URL de entrega firmada** |

### Enums

| Campo                                   | Valores                                                  |
| --------------------------------------- | -------------------------------------------------------- |
| `role`                                  | 0 administrador · 1 supervisor · 2 contratista           |
| `status` (usuario)                      | 0 activo · 1 inactivo · 2 suspendido                     |
| `status` (tarea)                        | 0 pendiente · 1 en progreso · 2 completada · 3 cancelada |
| `reviewStatus` (evidencia y asistencia) | 0 pendiente · 1 aprobada o aceptada · 2 rechazada        |
| `verificationMethod` (asistencia)       | 0 evidencia en la app · 1 en persona · 2 otro            |
| `type` (asistencia)                     | 0 entrada · 1 salida                                     |
| `geofenceStatus`                        | 0 dentro · 1 fuera · 2 poco precisa                      |
| `syncStatus`                            | 0 en línea · 1 sincronizada desde sin conexión           |
| `platform` (dispositivo)                | 0 Android · 1 iOS · 2 web                                |

## Errores

Cada error lleva un código en `errors[].extensions.code`. Los clientes lo traducen a un estatus HTTP para decidir si
reintentan (la cola sin conexión del móvil reintenta solo 401, 408, 429 y 5xx).

| `extensions.code` | Cuándo                                                                    | Equivale a | ¿El móvil reintenta?           |
| ----------------- | ------------------------------------------------------------------------- | ---------- | ------------------------------ |
| `UNAUTHENTICATED` | Token ausente o vencido                                                   | 401        | Sí, al volver a iniciar sesión |
| `FORBIDDEN`       | El rol no puede hacer la operación, o la empresa no coincide con el token | 403        | No                             |
| `NOT_FOUND`       | El registro no existe, o el código de empresa no está en el catálogo      | 404        | No                             |
| `CONFLICT`        | Choque de datos (por ejemplo, correo repetido en la empresa)              | 409        | No                             |
| `BAD_USER_INPUT`  | Validación fallida (mensaje legible para el usuario)                      | 422        | No                             |
| cualquier otro    | Error inesperado del servidor                                             | 500        | Sí                             |

Un `clientId` repetido **no es error**: la operación devuelve el registro que ya existía (idempotencia).

## Reglas de negocio que la API debe respetar

| Regla                                                                                                                                                                                                              | Decisión   | Respuesta si no se cumple |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------- |
| El contratista solo registra asistencia en sitios a los que está asignado                                                                                                                                          | D-15       | `FORBIDDEN`               |
| Un rechazo de evidencia o de asistencia exige comentario                                                                                                                                                           | —          | `BAD_USER_INPUT`          |
| Una tarea completada se puede reabrir; al reabrir se limpia `completedAt`                                                                                                                                          | D-16       | —                         |
| Un usuario con contraseña temporal debe cambiarla antes de usar el sistema: `auth.login` devuelve `mustChangePassword: true` y las demás operaciones responden `FORBIDDEN` hasta que llame a `auth.changePassword` | D-17, D-25 | `FORBIDDEN`               |
| El correo es único dentro de la empresa                                                                                                                                                                            | D-18       | `CONFLICT`                |
| En el dashboard, `requiresReview` cuenta solo asistencias con `requires_review` sin revisar; `pendingAttendances` cuenta todas las pendientes                                                                      | D-14, D-27 | —                         |

## Operaciones

| Dominio     | Operación                                                                                   | Tipo     | Quién la usa | Función de base de datos                                         |
| ----------- | ------------------------------------------------------------------------------------------- | -------- | ------------ | ---------------------------------------------------------------- |
| auth        | `login(input: LoginInput!)` → `{ accessToken refreshToken mustChangePassword user }`        | mutation | web, móvil   | `get_user_for_login`, `create_refresh_token`                     |
| auth        | `refresh(refreshToken: String!)` → `{ accessToken refreshToken mustChangePassword user }`   | mutation | web, móvil   | `rotate_refresh_token`                                           |
| auth        | `logout` → `Boolean`                                                                        | mutation | web, móvil   | `revoke_refresh_token`                                           |
| auth        | `changePassword(input: ChangePasswordInput!)` → `Boolean`                                   | mutation | web, móvil   | `change_user_password`                                           |
| companies   | `mine` → `Company` (la fila de la empresa de la base)                                       | query    | web (admin)  | `get_company_by_id`                                              |
| companies   | `update(input: UpdateCompanyInput!)` → `Company`                                            | mutation | web (admin)  | `update_company`                                                 |
| dashboard   | `summary` → `DashboardSummary`                                                              | query    | web          | `get_attendance_dashboard`, `get_task_dashboard`                 |
| sites       | `active` → `[Site]`                                                                         | query    | web, móvil   | `get_sites_by_company` (activos) / `get_my_sites`                |
| sites       | `list` → `[Site]` (incluye inactivos)                                                       | query    | web (admin)  | `get_sites_by_company`                                           |
| sites       | `create(input: CreateSiteInput!)` / `update(input: UpdateSiteInput!)` → `Site`              | mutation | web (admin)  | `create_site`, `update_site`, `change_site_status`               |
| sites       | `assignments(siteId: ID!)` → `[SiteAssignment]`                                             | query    | web          | `get_site_assignments`                                           |
| sites       | `assign(input: SiteAssignmentInput!)` / `unassign(input: SiteAssignmentInput!)` → `Boolean` | mutation | web          | `assign_site_user`, `unassign_site_user`                         |
| users       | `list` → `[User]`                                                                           | query    | web (admin)  | `get_users_by_company`                                           |
| users       | `activeContractors` → `[User]`                                                              | query    | web          | `get_contractors_by_company`                                     |
| users       | `create(input: CreateUserInput!)` → `{ user temporaryPassword }`                            | mutation | web (admin)  | `create_user`, `create_contractor`                               |
| users       | `update(input: UpdateUserInput!)` → `User`                                                  | mutation | web (admin)  | `update_user_profile`, `update_contractor`, `change_user_status` |
| tasks       | `list(filter: TaskFilterInput)` → `[Task]`                                                  | query    | web          | `get_tasks_by_company`                                           |
| tasks       | `mine` → `[Task]`                                                                           | query    | móvil        | `get_my_tasks`                                                   |
| tasks       | `byId(id: ID!)` → `Task`                                                                    | query    | web, móvil   | `get_task_by_id`                                                 |
| tasks       | `create(input: CreateTaskInput!)` → `Task`                                                  | mutation | web          | `create_task`                                                    |
| tasks       | `changeStatus(input: ChangeTaskStatusInput!)` → `Task` (incluye reabrir)                    | mutation | web          | `change_task_status`                                             |
| evidences   | `list(filter: EvidenceFilterInput)` → `[Evidence]`                                          | query    | web          | `get_evidences_by_company`                                       |
| evidences   | `byTask(taskId: ID!)` → `[Evidence]`                                                        | query    | móvil        | `get_evidences_by_task`                                          |
| evidences   | `register(input: RegisterEvidenceInput!)` → `Evidence`                                      | mutation | móvil        | `register_evidence`                                              |
| evidences   | `review(input: ReviewEvidenceInput!)` → `Evidence`                                          | mutation | web          | `review_evidence`                                                |
| attendances | `today` → `[Attendance]`                                                                    | query    | web          | `get_attendances_by_company` (hoy)                               |
| attendances | `mine` → `[Attendance]`                                                                     | query    | móvil        | `get_my_attendances`                                             |
| attendances | `register(input: RegisterAttendanceInput!)` → `Attendance`                                  | mutation | móvil        | `register_attendance`                                            |
| attendances | `review(input: ReviewAttendanceInput!)` → `Attendance`                                      | mutation | web          | `review_attendance`                                              |
| reports     | `attendance(filter: AttendanceReportInput!)` → `[Attendance]`                               | query    | web          | `get_attendances_by_company`                                     |
| uploads     | `createSignature(input: UploadSignatureInput!)` → `UploadSignature`                         | mutation | móvil        | — (firma con Cloudinary)                                         |
| devices     | `registerToken(input: RegisterDeviceTokenInput!)` → `Boolean`                               | mutation | móvil        | `register_device_token`                                          |

## Tipos de entrada

```graphql
input LoginInput {
  companyCode: String! # (S-01, S-02)
  email: String!
  password: String!
}
input ChangePasswordInput {
  currentPassword: String!
  newPassword: String!
}

input UpdateCompanyInput {
  name: String
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
input ChangeTaskStatusInput {
  taskId: ID!
  status: Int!
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
} # rechazo exige comment
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
input SiteAssignmentInput {
  siteId: ID!
  userId: ID!
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

## Tipos de salida

Los tipos de salida tienen los campos que piden los fragmentos de `web/src/services/fragments.ts` y
`mobile/src/services/fragments.ts`. Los que cambiaron con las nuevas convenciones:

```graphql
type Attendance {
  id: ID!
  clientId: ID!
  userId: ID!
  userName: String!
  siteId: ID!
  siteName: String!
  type: Int!
  capturedAtDevice: String!
  receivedAtServer: String!
  latitude: Float!
  longitude: Float!
  accuracyMeters: Float
  distanceMeters: Float!
  isMocked: Boolean!
  photoUrl: String
  geofenceStatus: Int!
  syncStatus: Int!
  requiresReview: Boolean!
  reviewStatus: Int! # plano, igual que Evidence (D-20)
  verificationMethod: Int
  reviewerName: String
  reviewerComment: String
  reviewedAt: String
}

type DashboardSummary {
  attendancesToday: Int!
  insideGeofence: Int!
  requiresReview: Int! # solo asistencias con requires_review sin revisar (D-14)
  pendingAttendances: Int! # todas las asistencias pendientes de revisión (D-27)
  pendingEvidences: Int!
  activeTasks: Int!
}

type LoginPayload {
  accessToken: String!
  refreshToken: String!
  mustChangePassword: Boolean! # (D-17, D-25)
  user: User!
}
```

## Subida de fotos a Cloudinary (subida firmada directa)

La foto nunca pasa por la API: la API firma, el teléfono sube directo a Cloudinary y después registra con la llave.

1. **`uploads.createSignature`** devuelve:

   ```graphql
   type UploadSignature {
     cloudName: String!
     apiKey: String!
     timestamp: Int! # segundos Unix; la firma vale 1 hora
     signature: String! # sobre folder, public_id, timestamp y type, con el API secret
     folder: String! # trazent/<companyCode>/attendances o /evidences (D-26)
     publicId: String! # derivado del clientId: repetir la subida sobrescribe la misma foto
     deliveryType: String! # "authenticated": las fotos no son públicas
   }
   ```

   La API arma `folder` y `publicId` (el cliente no los elige) y firma exactamente esos campos con `CloudinaryDotNet`.
   La carpeta lleva el código de empresa para que las fotos de cada empresa queden separadas.

2. **El móvil hace `POST` multipart** a `https://api.cloudinary.com/v1_1/<cloudName>/image/upload` con `file`,
   `api_key`, `timestamp`, `signature`, `folder`, `public_id` y `type`.
3. **`attendances.register` / `evidences.register`** reciben `photoKey` / `fileKey` (el `public_id`). Antes de
   registrar, la API consulta el recurso en Cloudinary (que exista, que sea imagen, que esté en la carpeta de la
   empresa del token y tamaño máximo) y responde `BAD_USER_INPUT` si no cumple.
4. **Al consultar**, la API convierte la llave en una URL de entrega firmada (`photoUrl`, `fileUrl`). El panel puede
   pedir una miniatura con transformación (por ejemplo, ancho 400 y `q_auto`).

Variables de entorno de la API: `Cloudinary__CloudName`, `Cloudinary__ApiKey`, `Cloudinary__ApiSecret`.

## Notificaciones push (Expo Push Service)

1. Al iniciar sesión, el móvil manda su token de Expo con `devices.registerToken`. El token se guarda en la base de la
   empresa con la que inició sesión.
2. Cuando ocurre un evento para el contratista (le asignan una tarea, le revisan una evidencia), la API busca sus
   tokens (`get_device_tokens_by_user`) y hace `POST https://exp.host/--/api/v2/push/send`. Si Expo falla, la operación
   que disparó el aviso no se revierte; solo se registra el error.
3. Una tarea periódica recorre las bases del catálogo, revisa los recibos de Expo y borra los tokens con
   `DeviceNotRegistered` (`delete_device_token`, `delete_stale_device_tokens`).
