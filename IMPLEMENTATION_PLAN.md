# Plan de implementación · Multiempresa en los clientes

Pasos para desarrollar el incremento descrito en `CURRENT_TASK.md`. Cada paso dice qué archivos toca, qué cambia y cómo
comprobar que quedó bien antes de seguir. Los identificadores `D-xx` y `P-xx` son los de `PROJECT_CONTEXT.md`; los
`CA-xx` y `S-xx`, los de `CURRENT_TASK.md`.

## Reglas del plan

- No se toca `Trazent.Api/` ni `db/` (CA-23).
- Todo se desarrolla y prueba en modo simulado. Ningún paso necesita la API real.
- Un commit por paso, con Conventional Commits (`refactor(web): …`, `feat(mobile): …`). Al final de cada paso, el
  proyecto compila y pasa lint y tipos.
- Si un paso obliga a decidir algo que no está en `PROJECT_CONTEXT.md` ni en `CURRENT_TASK.md`, se detiene y se
  pregunta; no se improvisa.
- Las fases 1 a 4 (web) y la fase 5 (móvil) no dependen entre sí y pueden avanzar en paralelo.

## Fase 0 · Preparación

| Paso | Acción                                                                                                             | Verificación                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| 0.1  | `git switch main && git pull`; crear `feature/web-multiempresa` (Adrián) y `feature/mobile-codigo-empresa` (Jorge) | `git branch --show-current`                      |
| 0.2  | `yarn install`; confirmar `VITE_USE_MOCKS=true` en `web/.env` y `EXPO_PUBLIC_USE_MOCKS=true` en `mobile/.env`      | `yarn dev:web` abre el panel con datos simulados |
| 0.3  | Anotar, en `<web>/panel/reportes` con «Últimos 7 días», el número de la tarjeta «Por revisar»                      | Número guardado para CA-06                       |
| 0.4  | Enviar a María S-01 y S-02 para que los confirme; no bloquea los pasos siguientes                                  | Mensaje enviado                                  |

## Fase 1 · Panel web: quitar las vistas piloto (D-19)

| Paso | Archivos                                                                               | Cambio                                                                                                                                                                                                 |
| ---- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1  | `web/src/views/mobile/`, `web/src/components/mobile/`                                  | Borrar ambas carpetas                                                                                                                                                                                  |
| 1.2  | `web/src/routes/AppRouter.tsx`, `web/src/routes/paths.ts`                              | Quitar el bloque «PROTOTIPO MÓVIL», los imports de las vistas, las rutas `mobile*` y `homeFor` (todo rol del panel va a `panel`)                                                                       |
| 1.3  | `web/src/routes/RequireRole.tsx`                                                       | Un usuario sin el rol requerido va al login, no a `homeFor`                                                                                                                                            |
| 1.4  | `web/src/features/attendance`, `evidences`, `tasks` (`api.ts`, `hooks.ts`, `index.ts`) | Quitar lo que solo usaban las vistas piloto: `checkIn`, `mine` y `useCheckIn`, `useMyAttendances`; `upload` y `useUploadEvidence`; `mine` y `useMyTasks`. Quitar sus llaves de `services/queryKeys.ts` |
| 1.5  | `web/src/molecules/PhotoPicker.tsx`, `web/src/utils/image.ts`, `molecules/index.ts`    | Borrar si `rg` confirma que ya nadie los importa                                                                                                                                                       |
| 1.6  | `web/src/mocks/demoAccounts.ts`, `web/src/molecules/DemoAccountList.tsx`               | Quitar la cuenta de contratista y el campo `app`                                                                                                                                                       |
| 1.7  | `web/src/context/AuthContext.tsx`                                                      | Si el login devuelve un usuario con `Role.Contractor`, cerrar la sesión y lanzar `ApiError('Usa la app móvil de Trazent.', 403)`                                                                       |
| 1.8  | `web/src/mocks/mockApi.ts`                                                             | Quitar los métodos que ya no tienen quién los llame (paso 1.4); conservar los datos del contratista en `db.ts`, el panel los muestra                                                                   |

**Verificación de la fase:** CA-01, CA-02 y CA-03; `yarn workspace trazent-web lint`, `typecheck` y `build`.

## Fase 2 · Panel web: `reviewStatus` plano (D-20)

| Paso | Archivos                                                                               | Cambio                                                                                                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1  | `web/src/types/domain.ts`                                                              | Borrar `ReviewDecision` y `AttendanceReview`; en `Attendance`, cambiar `review?` por `reviewStatus: ReviewStatus`, `verificationMethod?: VerificationMethod`, `reviewerName?`, `reviewerComment?`, `reviewedAt?` |
| 2.2  | `web/src/services/fragments.ts`                                                        | En `ATTENDANCE_FIELDS`, cambiar `review { … }` por los cinco campos planos                                                                                                                                       |
| 2.3  | `web/src/components/AttendanceReportTable.tsx`, `web/src/molecules/AttendanceItem.tsx` | Leer `reviewStatus`: `Approved` → «Aceptada», `Rejected` → «Rechazada», `Pending` con `requiresReview` → «Por revisar», `Pending` sin él → «—»                                                                   |
| 2.4  | `web/src/views/panel/ReportsView.tsx`                                                  | `reviewLabel` y el conteo `pending` con `requiresReview && reviewStatus === ReviewStatus.Pending`                                                                                                                |
| 2.5  | `web/src/mocks/db.ts`, `web/src/mocks/mockApi.ts`                                      | Generar asistencias con `reviewStatus` y campos planos; el resumen del dashboard cuenta `requiresReview && reviewStatus === Pending`                                                                             |

**Verificación de la fase:** CA-04, CA-05 y CA-06 (comparar con el número del paso 0.3).

## Fase 3 · Panel web: empresa en la ruta (D-23)

| Paso | Archivos                                                                   | Cambio                                                                                                                                                       |
| ---- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1  | `web/src/utils/companyCode.ts` (nuevo)                                     | `COMPANY_CODE_PATTERN = /^[a-z0-9-]{3,40}$/` y `isValidCompanyCode(code)` (S-02)                                                                             |
| 3.2  | `web/src/context/CompanyContext.tsx` (nuevo)                               | `CompanyProvider` lee `:empresa` con `useParams`, valida el formato (si no es válido, muestra «no encontrado») y expone `useCompany()` → `{ code }`          |
| 3.3  | `web/src/routes/paths.ts`                                                  | Convertir cada ruta en función de la empresa: `paths.login(code)`, `paths.panel(code)`, `paths.panelTasks(code)`, etc. Agregar `paths.root = '/'`            |
| 3.4  | `web/src/routes/AppRouter.tsx`                                             | Estructura: `/` → `CompanyPickerView`; `/:empresa` con `CompanyProvider` y adentro `login` y `panel/*`; `*` → «no encontrado»                                |
| 3.5  | `web/src/views/auth/CompanyPickerView.tsx` (nuevo)                         | Campo «Código de empresa» con la validación de 3.1; al enviar, `navigate(paths.login(code))`                                                                 |
| 3.6  | `PanelLayout.tsx`, `DashboardView.tsx`, `RequireRole.tsx`, `LoginView.tsx` | Reemplazar cada `paths.x` por `paths.x(code)` con `useCompany()`. Comprobar con `rg -n "paths\.[a-zA-Z]+[^(]" web/src` que no quede ninguna ruta sin empresa |
| 3.7  | `web/src/views/auth/LoginView.tsx`                                         | Mostrar la empresa («Empresa: demo») y un enlace «Cambiar empresa» a `/`                                                                                     |

**Verificación de la fase:** CA-07, CA-08 y CA-09.

## Fase 4 · Panel web: la sesión y las peticiones llevan la empresa (D-21, S-01)

| Paso | Archivos                                                          | Cambio                                                                                                                                          |
| ---- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1  | `web/src/types/dto.ts`                                            | `LoginRequest` agrega `companyCode: string`; `LoginResponse` sin cambios                                                                        |
| 4.2  | `web/src/services/tokenStorage.ts`                                | Guardar `companyCode` junto con la sesión y exponer `getCompanyCode()`                                                                          |
| 4.3  | `web/src/services/graphql.ts`                                     | Si hay empresa, agregar el encabezado `X-Company-Code`. Para el login, recibir la empresa como parámetro, porque todavía no hay sesión guardada |
| 4.4  | `web/src/features/auth/api.ts`, `web/src/context/AuthContext.tsx` | El login envía `{ email, password, companyCode }` con el código de `useCompany()`                                                               |
| 4.5  | `web/src/context/AuthContext.tsx`                                 | Al montar o al cambiar la empresa de la URL: si la sesión guardada es de otra empresa, `logout()` y redirigir a `paths.login(code)`             |
| 4.6  | `web/src/mocks/mockApi.ts`                                        | `auth.login` rechaza con `ApiError('Empresa no encontrada.', 404)` si `companyCode !== 'demo'` (S-03)                                           |
| 4.7  | `web/src/mocks/demoAccounts.ts`, `README.md`, `web/README.md`     | Indicar que en modo simulado se entra por `<web>/demo`                                                                                          |

**Verificación de la fase:** CA-10, CA-11, CA-12 y CA-13.

## Fase 5 · App móvil: código de empresa (D-22, S-01) · Jorge

| Paso | Archivos                                                                                   | Cambio                                                                                                                                             |
| ---- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.0  | `mobile/src/types/domain.ts`, `mobile/src/services/fragments.ts`, `mobile/src/mocks/db.ts` | Revisión plana (D-20): el mismo cambio que los pasos 2.1, 2.2 y 2.5 del panel                                                                      |
| 5.1  | `mobile/src/utils/companyCode.ts` (nuevo)                                                  | El mismo patrón y validación que el paso 3.1                                                                                                       |
| 5.2  | `mobile/src/services/companyStorage.ts` (nuevo)                                            | `read()`, `write(code)` y `clear()` con `expo-secure-store`, llave `trazent.company`, y caché en memoria como `tokenStorage`                       |
| 5.3  | `mobile/src/types/dto.ts`                                                                  | `LoginRequest` agrega `companyCode: string`                                                                                                        |
| 5.4  | `mobile/src/services/graphql.ts`                                                           | Agregar `X-Company-Code` con el valor de `companyStorage` en cada petición; así también lo llevan los reenvíos de la outbox                        |
| 5.5  | `mobile/src/services/index.ts` (`authService.login`)                                       | Enviar `companyCode` en el input y, si el login es exitoso, guardarlo con `companyStorage.write`                                                   |
| 5.6  | `mobile/src/features/auth/components/LoginForm.tsx`                                        | Si no hay código guardado, mostrar el campo «Código de empresa» (minúsculas, sin autocorrección); si hay, mostrar «Empresa: X» y «Cambiar empresa» |
| 5.7  | `mobile/src/features/auth/SessionProvider.tsx`                                             | `logout` no borra el código. «Cambiar empresa» lo borra solo si la outbox está vacía; si tiene envíos pendientes, avisa y no cambia                |
| 5.8  | `mobile/src/mocks/mockApi.ts`                                                              | `auth.login` rechaza códigos distintos de `demo` con «Empresa no encontrada» (S-03)                                                                |
| 5.9  | `mobile/README.md`                                                                         | Explicar el código `demo` del modo simulado                                                                                                        |

**Verificación de la fase:** CA-04 (en `mobile/src`) y CA-14 a CA-19; `yarn workspace trazent-mobile lint` y `typecheck`; prueba en el
development build en un teléfono Android.

El paso 5.7 evita perder registros: si la cola tiene envíos pendientes de una empresa, no se puede cambiar a otra hasta
que se sincronicen.

## Fase 6 · Documentación · Adrián

| Paso | Archivo               | Cambio                                                                                                                                                                       |
| ---- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1  | `docs/api-graphql.md` | Ya documenta `X-Company-Code`, `companyCode` y la revisión plana. Solo ajustar si María cambió S-01 o S-02, y quitar el aviso de «pendiente de confirmar» cuando los apruebe |
| 6.2  | `PROJECT_CONTEXT.md`  | Actualizar «Estado actual» y, si María ya respondió, pasar S-01 y S-02 a decisiones aprobadas                                                                                |

**Verificación de la fase:** CA-22.

## Fase 7 · Cierre

| Paso | Acción                                                                                      | Verificación        |
| ---- | ------------------------------------------------------------------------------------------- | ------------------- |
| 7.1  | Desde la raíz: `yarn format:check`, `yarn lint`, `yarn typecheck`, `yarn build:web`         | CA-20               |
| 7.2  | `git diff --stat main` en cada rama                                                         | CA-23               |
| 7.3  | Abrir los dos PR hacia `main` con la plantilla; en «Cómo se probó», listar los CA cubiertos | Plantilla completa  |
| 7.4  | Francisco repite los criterios manuales y comenta el resultado en cada PR                   | Comentario en el PR |
| 7.5  | Aprobación, `ci` en verde y squash merge                                                    | CA-21               |

## Riesgos

| Riesgo                                                         | Mitigación                                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| María elige otro mecanismo para el código (S-01)               | El código solo se arma en `graphql.ts` y `features/auth/api.ts` (web) o `services/` (móvil) |
| Quedan rutas sin empresa en el panel                           | La búsqueda con `rg` del paso 3.6 y el recorrido de CA-07                                   |
| El service worker sirve una versión vieja al probar CA-13      | En DevTools → Application, «Unregister» y recargar; o usar una ventana de incógnito         |
| Un contratista con registros sin sincronizar cambia de empresa | El paso 5.7 lo impide hasta que la cola esté vacía                                          |
