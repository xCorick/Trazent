# Trazent · Contexto del proyecto

Lectura obligatoria antes de cambiar código en este repositorio, tanto para personas como para agentes de IA. Resume qué
es el sistema, qué entra en la entrega, las reglas que no se negocian y qué decisiones ya están tomadas. El detalle vive
en los documentos enlazados; aquí no se repite.

- **Última actualización:** 2026-11-22
- **Entrega:** 9 de diciembre de 2026
- **Incremento en curso:** ver `CURRENT_TASK.md` · **Pasos:** ver `IMPLEMENTATION_PLAN.md`

---

## 1. Qué es Trazent

Plataforma para empresas que trabajan con contratistas externos. Resuelve tres problemas:

1. **Asistencia verificable.** El contratista registra entrada y salida desde su teléfono con GPS y foto; el sistema
   comprueba si estaba dentro de la geocerca del sitio.
2. **Tareas con evidencia.** El supervisor asigna tareas y el contratista las respalda con fotos que el supervisor
   aprueba o rechaza.
3. **Trabajo sin señal.** Los sitios de obra suelen tener mala cobertura; ninguna captura se pierde por falta de red.

| Rol           | Cliente                   | Qué hace                                                                      |
| ------------- | ------------------------- | ----------------------------------------------------------------------------- |
| Administrador | Panel web (PWA)           | Todo lo del supervisor, más usuarios, sitios y geocercas                      |
| Supervisor    | Panel web (PWA)           | Asigna tareas, revisa evidencias y asistencias, consulta dashboard y reportes |
| Contratista   | App móvil (Android, Expo) | Registra asistencia, consulta sus tareas, sube evidencias y recibe avisos     |

Trazent funciona como SaaS: cada empresa es un _tenant_ con **su propia base de datos**. Las bases nunca se comparten; las
migraciones de `db/` sirven para montar la base de cada empresa nueva.

## 2. Alcance de la entrega

**Dentro:**

- Inicio de sesión con JWT y refresh token rotativo, con permisos por rol.
- Panel web: dashboard, tareas, revisión de evidencias, revisión de asistencias, sitios con geocerca, usuarios y reporte
  de asistencias con exportación CSV. Instalable como PWA.
- App móvil: registro de entrada y salida con GPS y foto, tareas asignadas, evidencias con foto, cola sin conexión con
  sincronización automática y notificaciones push.
- API GraphQL con las operaciones listadas en `docs/api-graphql.md`.
- Base de datos con migraciones versionadas que se aplican a la base de cada empresa.

**Fuera:**

- Registro de empresas por autoservicio, planes y cobros. Dar de alta una empresa es manual: crear su base, aplicar las
  migraciones y registrarla en el catálogo de empresas.
- App para iOS: el código es multiplataforma, pero no se compila ni se prueba para iOS en esta entrega.
- Nómina, cálculo de horas pagables y exportaciones distintas al CSV de asistencias.
- Chat, mapas en vivo o rastreo continuo de ubicación: la ubicación solo se toma al registrar.
- Vistas del contratista en el panel web (`web/src/views/mobile`): fueron un piloto y se eliminan (D-19).

## 3. Equipo y responsables

| Área                          | Responsable                    | Carpeta               |
| ----------------------------- | ------------------------------ | --------------------- |
| Panel web y DevOps (CI, repo) | Adrián González Serrano        | `web/`, `.github/`    |
| App móvil                     | Jorge Alejandro Grijalva Soqui | `mobile/`             |
| API y base de datos           | María G. Cobos Camacho         | `Trazent.Api/`, `db/` |
| Pruebas (QA)                  | Francisco                      | —                     |

Las prioridades y la aceptación final las define el Product Owner del proyecto.

## 4. Mapa del repositorio

| Carpeta / archivo     | Qué contiene                                                          | Documento de referencia                |
| --------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| `web/`                | Panel web: React 19, TypeScript, Vite 5, Ant Design 5, TanStack Query | `web/README.md`                        |
| `mobile/`             | App móvil: Expo SDK 58, React Native 0.88, Expo Router, expo-sqlite   | `mobile/README.md`, `mobile/AGENTS.md` |
| `Trazent.Api/`        | API: ASP.NET Core 10, GraphQL.AspNet, ADO.NET con Npgsql, AutoMapper  | `README.md` sección 3.4                |
| `db/`                 | 13 migraciones y 58 funciones de PostgreSQL 17, `apply-pending.sh`    | `db/README.md`, `db/CONTRIBUTING.md`   |
| `docs/api-graphql.md` | Contrato GraphQL: convenciones, errores, operaciones y tipos          | —                                      |
| `.github/workflows/`  | `ci.yml` (checks del PR) y `db-deploy.yml` (migraciones a Neon)       | `README.md` sección 5                  |
| Raíz                  | Workspaces de Yarn 4, Prettier, Husky y lint-staged                   | `README.md` secciones 1 a 4            |

La arquitectura completa (vistas 4+1, diagramas C4 y UML, patrones y justificación) está en el documento de
arquitectura del equipo. Los diagramas editables se guardan fuera del repositorio.

## 5. Arquitectura en breve

- **Monolito modular cliente-servidor:** dos clientes y una sola API GraphQL que atiende a todas las empresas.
- **Una base de datos por empresa:** la API sabe la empresa por su código (ruta en la web, código guardado en el
  móvil), busca su cadena de conexión en el catálogo de empresas y trabaja solo sobre esa base. `company_id` y la tabla
  `companies` se conservan en cada base aunque sean redundantes; `companies` guarda una sola fila, la de esa empresa.
- **API en N capas:** `Trazent.Api` (controladores GraphQL) → `Trazent.Core` (servicios y repositorios) →
  `Trazent.DataAccess` (conexión), con `Trazent.Infraestructure` (entidades, enums, `Result<T>`) compartido. Las
  dependencias solo bajan.
- **Reglas de negocio críticas en funciones de PostgreSQL:** geocerca, idempotencia por `client_id`, revisiones y
  rotación de tokens. La API las llama con `NpgsqlCommand` y `CommandType.StoredProcedure`.
- **Fotos fuera de la API:** la API firma, el teléfono sube directo a Cloudinary y la API solo guarda la llave.
- **Offline-first:** la app móvil guarda en una cola SQLite (outbox) y reenvía al recuperar la red; la PWA abre desde
  la caché de su service worker.
- **Organización de clientes:** web híbrida (UI atómica en `atoms`, `molecules`, `components`, y datos por dominio en
  `features/<dominio>/{api,hooks}.ts`); móvil por funcionalidad (`features/`, `offline/`, `device/`, `services/`).

## 6. Reglas de trabajo

Estas reglas aplican a todo cambio. Un PR que las rompa no se aprueba.

### Repositorio

- `main` está protegida: todo entra por Pull Request con una aprobación, conversaciones resueltas, el check `ci` en
  verde, squash merge e historial lineal. No hay push directo ni force push.
- Ramas cortas desde `main`: `feature/<historia>`, `fix/<descripción>`, `docs/<tema>`.
- Commits con Conventional Commits y alcance por proyecto: `feat(web): …`, `fix(mobile): …`, `docs: …`.
- Sube siempre `yarn.lock`. Instala dependencias de la app móvil con `npx expo install`.

### Propiedad del código

- **Solo María modifica `Trazent.Api/` y `db/`.** Los demás proponen cambios por escrito (issue, comentario en el PR o
  `docs/api-graphql.md`), no editan esos archivos.
- En `db/` nunca se edita un script ya aplicado: todo cambio es un archivo nuevo en `migrations/` o `functions/`.

### Código

- Ninguna pantalla llama a la red directamente: siempre por la capa de servicios (`features/<x>/api.ts` en web,
  `services/` en móvil).
- En la app móvil, un módulo de `features/` no importa otro módulo de `features/`; lo compartido va en `services/`,
  `ui/` o `device/`.
- Las operaciones GraphQL se nombran en lowerCamelCase, sin `Async`, dentro del campo de su dominio (D-13).
- Los enums del dominio usan el mismo valor numérico que el `smallint` de la base, en los tres proyectos.
- La API elige la base de la empresa por su código y toma `company_id`, `user_id` y rol del token; nunca del input del
  cliente.
- Toda escritura que pueda reintentarse lleva un `clientId` generado en el teléfono.
- Errores de la API con `extensions.code` (`UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`,
  `BAD_USER_INPUT`); la app móvil decide con ese código si reintenta.

### Antes de abrir un PR

| Proyecto | Verificación                                                         |
| -------- | -------------------------------------------------------------------- |
| Todos    | `yarn format:check`                                                  |
| Web      | `yarn workspace trazent-web lint`, `typecheck` y `build`             |
| Móvil    | `yarn workspace trazent-mobile lint` y `typecheck`                   |
| API      | `dotnet build Trazent.Api/Trazent.Api.slnx`                          |
| Base     | `bash db/scripts/apply-pending.sh` sobre una base local, sin errores |

## 7. Restricciones

| Restricción                                                    | Consecuencia                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Entrega el 9 de diciembre de 2026, equipo de cuatro            | Se prioriza lo que usan las pantallas existentes; lo demás queda como extra |
| Solo planes gratuitos (Vercel, Render, Neon, Cloudinary, Expo) | La API en Render se duerme sin tráfico; la primera petición tarda           |
| Señal débil en los sitios de trabajo                           | Toda captura del contratista debe funcionar sin red                         |
| Funciones nativas (cámara, GPS, push) en móvil                 | Se prueba con development build o APK de EAS, no con Expo Go                |
| Secretos                                                       | Nunca en el repositorio: variables de entorno de Render, Vercel y GitHub    |
| Datos personales (ubicación y fotos)                           | Fotos con entrega firmada (no públicas); ubicación solo al registrar        |

## 8. Decisiones aprobadas

| ID   | Decisión                                                                                                                                                         | Motivo                                                        |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| D-01 | Monorepo con Yarn 4 workspaces (`web`, `mobile`), más la API y la base en el mismo repo                                                                          | Un solo flujo de PR y CI para todo el equipo                  |
| D-02 | API en N capas con ASP.NET Core 10                                                                                                                               | Estructura que el equipo ya domina                            |
| D-03 | GraphQL con GraphQL.AspNet                                                                                                                                       | Un esquema tipado para dos clientes; experiencia previa       |
| D-04 | Acceso a datos con ADO.NET (Npgsql), no Dapper ni Entity Framework                                                                                               | Llamada directa a funciones; la lógica ya vive en la base     |
| D-05 | Reglas transaccionales en funciones de PostgreSQL 17, versionadas en `db/`                                                                                       | Atómicas, junto a los datos y probadas en el CI               |
| D-06 | Fotos con subida firmada directa a Cloudinary y entrega `authenticated`                                                                                          | La API no transporta bytes; experiencia previa del equipo     |
| D-07 | Notificaciones con Expo Push Service (entrega por FCM)                                                                                                           | Token desde el SDK de Expo; la API solo hace un POST          |
| D-08 | Enums como `Int` en GraphQL, con el valor del `smallint` de la base                                                                                              | Los clientes ya usan enums numéricos                          |
| D-09 | Web con organización híbrida: UI atómica y `features/<dominio>` para datos                                                                                       | Las pantallas comparten piezas visuales; datos por dominio    |
| D-10 | Móvil por funcionalidad, con outbox SQLite y `clientId` idempotente                                                                                              | Captura sin red sin duplicados                                |
| D-11 | Hosting: Vercel (web), Render con Docker (API), Neon (base), EAS (APK)                                                                                           | Despliegue automático y planes gratuitos                      |
| D-12 | `main` protegida con PR, aprobación y check `ci` obligatorio                                                                                                     | Nada entra sin revisión ni pruebas                            |
| D-13 | Operaciones GraphQL en lowerCamelCase, sin sufijo `Async`, agrupadas por dominio (`tasks.mine`)                                                                  | Un solo estilo en el esquema y en los clientes                |
| D-14 | El conteo «por revisar» del dashboard solo incluye asistencias con `requires_review`; las pendientes tienen su propio conteo                                     | Distinguir lo dudoso de lo que solo falta revisar             |
| D-15 | El contratista solo registra asistencia en sitios a los que está asignado (`site_assignments`)                                                                   | Evita registros en sitios ajenos                              |
| D-16 | Una tarea completada se puede reabrir; al reabrir se limpia `completed_at`                                                                                       | Corregir tareas cerradas por error                            |
| D-17 | La contraseña temporal de un usuario nuevo se debe cambiar en el primer inicio de sesión                                                                         | La contraseña temporal la conoce quien creó la cuenta         |
| D-18 | El correo es único dentro de cada empresa (no en toda la plataforma)                                                                                             | Una persona puede trabajar para varias empresas               |
| D-19 | Se eliminan las vistas de contratista del panel web (`web/src/views/mobile`); fueron un piloto                                                                   | El cliente del contratista es la app móvil                    |
| D-20 | La revisión de asistencia viaja como `reviewStatus` plano (0, 1, 2), igual que en evidencias                                                                     | Mismo formato que la base y que evidencias; la API no traduce |
| D-21 | Una base de datos por empresa; nunca se comparten. `company_id` y `companies` se conservan aunque sean redundantes                                               | Aislamiento total entre clientes del SaaS                     |
| D-22 | La app móvil pide un código de empresa en el primer inicio de sesión y lo guarda                                                                                 | El teléfono no tiene URL que indique la empresa               |
| D-23 | El panel web identifica la empresa por la ruta (`trazent.vercel.app/<empresa>`)                                                                                  | Funciona con el dominio gratuito de Vercel                    |
| D-24 | El token incluye el código de empresa; si el encabezado de la petición no coincide, la API responde `FORBIDDEN`                                                  | Un token de una empresa no sirve en otra                      |
| D-25 | Mientras un usuario tenga contraseña temporal, toda operación distinta de `auth.changePassword` responde `FORBIDDEN`; `auth.login` devuelve `mustChangePassword` | Hace cumplir D-17 desde la API, no solo en los clientes       |
| D-26 | Las fotos se guardan en Cloudinary bajo `trazent/<código de empresa>/...`                                                                                        | Las fotos de cada empresa quedan separadas, como sus bases    |
| D-27 | `DashboardSummary` agrega `pendingAttendances` (todas las asistencias pendientes) junto a `requiresReview`                                                       | Es el conteo aparte que pide D-14                             |

## 9. Decisiones pendientes

Mientras una decisión esté pendiente, no se implementa la parte que depende de ella.

| ID   | Pregunta                                                                                                                  | Decide | Afecta a        |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | ------ | --------------- |
| P-10 | ¿Dónde vive el catálogo de empresas (código → cadena de conexión): una base central pequeña o la configuración de Render? | María  | API, despliegue |

### Cambios que exigen las decisiones aprobadas

Hoy el código no cumple todavía estas decisiones. Cada cambio lo hace el responsable de su carpeta: `db/` y
`Trazent.Api/` María, `web/` y `.github/` Adrián, `mobile/` Jorge.

| Decisión | Cambio necesario                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| D-15     | `register_attendance` debe rechazar el registro si el contratista no tiene asignación en ese sitio                                      |
| D-17     | Nueva columna en `users` que marque «debe cambiar contraseña»; `auth.login` la devuelve y los clientes piden el cambio                  |
| D-21     | La API resuelve la conexión en cada petición (el `DatabaseConnection` actual es una sola cadena fija) a partir del catálogo de empresas |
| D-21     | El módulo `companies` solo consulta y modifica la fila de su propia base; ya no crea ni lista otras empresas                            |
| D-21     | `db-deploy.yml` aplica las migraciones a todas las bases registradas, no solo a una                                                     |
| D-22     | `auth.login` recibe el código de empresa; la app móvil lo pide en el primer inicio de sesión y lo guarda en el teléfono                 |
| D-23     | El panel web toma el código de la ruta (`/:empresa/...`) y lo envía en cada petición a la API                                           |
| D-24     | `auth.login` incluye el código de empresa en el token y la API lo compara con `X-Company-Code` en cada petición                         |
| D-25     | La API bloquea las operaciones con `FORBIDDEN` mientras `mustChangePassword` sea verdadero; los clientes muestran la pantalla de cambio |
| D-26     | `uploads.createSignature` arma `folder` con el código de empresa y el registro valida que la foto esté en esa carpeta                   |
| D-27     | `dashboard.summary` devuelve `pendingAttendances`; el panel lo muestra como conteo aparte de «Por revisar»                              |

D-16 y D-18 ya se cumplen: `change_task_status` limpia `completed_at` cuando el estado deja de ser «Completada», y el
índice `ux_users_email_lower` hace el correo único dentro de cada base, que es una sola empresa.

## 10. Estado actual

| Parte         | Estado                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Base de datos | Completa para el alcance: 10 tablas y 58 funciones; CI listo; el despliegue a Neon todavía apunta a una sola base |
| API           | Solo el módulo `companies`; sin autenticación todavía (ver documento de operaciones para María)                   |
| Panel web     | Todas las pantallas hechas; cliente GraphQL listo; funciona con datos simulados (`VITE_USE_MOCKS=true`)           |
| App móvil     | Pantallas, outbox, subida a Cloudinary y registro de push listos; datos simulados (`EXPO_PUBLIC_USE_MOCKS=true`)  |
| CI/CD         | `ci.yml` y `db-deploy.yml` activos; protección de `main` aplicada                                                 |

Cuando un módulo de la API esté listo, el cliente correspondiente cambia su variable a `false` para probar contra la
API real.

## 11. Glosario

| Término           | Significado                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Geocerca          | Círculo alrededor de un sitio (latitud, longitud y radio en metros) donde la asistencia es válida     |
| Evidencia         | Foto con comentario que respalda el avance de una tarea                                               |
| Outbox            | Cola local en SQLite donde la app guarda lo capturado sin red hasta enviarlo                          |
| `clientId`        | UUID que genera el teléfono al capturar; evita duplicados si el envío se repite                       |
| `requires_review` | Columna generada: verdadera si la asistencia quedó fuera de la geocerca, imprecisa o con GPS simulado |
| Firma de subida   | Permiso temporal que emite la API para que el teléfono suba una foto directo a Cloudinary             |
| Tenant            | Empresa cliente de Trazent, con su propia base de datos                                               |
| Código de empresa | Identificador corto de la empresa (`constructora-a`); con él la API elige su base                     |
