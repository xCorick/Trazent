# Incremento actual · Multiempresa en los clientes

| Campo          | Valor                                                                                  |
| -------------- | -------------------------------------------------------------------------------------- |
| Estado         | Listo para desarrollar                                                                 |
| Responsables   | Adrián González Serrano (`web/`, `docs/`) · Jorge Alejandro Grijalva Soqui (`mobile/`) |
| Revisión       | María G. Cobos Camacho (contrato con la API) · Francisco (QA)                          |
| Ramas          | `feature/web-multiempresa` · `feature/mobile-codigo-empresa`                           |
| Fecha objetivo | 29 de noviembre de 2026 (deja margen antes de la entrega del 9 de diciembre)           |
| Contexto       | `PROJECT_CONTEXT.md` · **Pasos:** `IMPLEMENTATION_PLAN.md`                             |

## 1. Objetivo

Dejar el panel web y la app móvil listos para el modelo SaaS de una base de datos por empresa: que cada cliente sepa a
qué empresa pertenece la sesión y se lo diga a la API en cada petición. De paso se limpia el panel de lo que ya no forma
parte del producto y se alinea la revisión de asistencias con la base.

Al terminar, los dos clientes funcionan igual que hoy con datos simulados, pero ya con el código de empresa en la ruta,
en el inicio de sesión y en cada petición. Cuando la API implemente su parte, no habrá que cambiar los clientes.

## 2. Decisiones que implementa

Todas están aprobadas en `PROJECT_CONTEXT.md`, sección 8.

| ID   | Decisión                                                             | Qué se hace en este incremento                                                      |
| ---- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| D-19 | Se eliminan las vistas de contratista del panel web                  | Borrar `web/src/views/mobile`, `web/src/components/mobile` y lo que solo ellas usan |
| D-20 | La revisión de asistencia viaja como `reviewStatus` plano            | Cambiar tipos, fragmento, componentes y datos simulados del panel y de la app móvil |
| D-21 | Una base de datos por empresa                                        | Solo la parte de los clientes: enviar siempre el código de empresa                  |
| D-22 | La app móvil pide el código de empresa en el primer inicio de sesión | Campo en el login, guardado cifrado y opción para cambiar de empresa                |
| D-23 | El panel identifica la empresa por la ruta                           | Todas las rutas del panel bajo `/:empresa`                                          |

## 3. Pendientes y supuestos

| ID   | Tema                                                                                       | Estado                                | Cómo lo trata este incremento                                                                                            |
| ---- | ------------------------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| P-10 | Dónde vive el catálogo de empresas (código → cadena de conexión)                           | Pendiente, lo decide María            | No bloquea: es interno de la API. Los clientes solo envían el código                                                     |
| S-01 | El código viaja en el encabezado `X-Company-Code` y en `auth.login` como `companyCode`     | Supuesto, falta confirmarlo con María | Se implementa en un solo lugar por cliente (`services/graphql.ts` y `features/auth/api.ts`); si cambia, solo se toca ahí |
| S-02 | Formato del código: minúsculas, números y guiones, de 3 a 40 caracteres (`constructora-a`) | Supuesto                              | Se valida en los clientes antes de enviar                                                                                |
| S-03 | En modo simulado el único código válido es `demo`                                          | Supuesto                              | Los datos simulados rechazan cualquier otro código como lo haría la API                                                  |

Si María rechaza S-01 o S-02, se ajusta el punto indicado y los criterios que lo mencionan; el resto del incremento no
cambia.

## 4. Alcance

### Dentro

**Panel web (Adrián)**

1. Eliminar las vistas piloto del contratista, sus rutas `/movil/*`, sus componentes y los hooks, servicios y utilidades
   que solo ellas usaban. Un contratista que inicie sesión en el panel recibe un mensaje que lo manda a la app móvil.
2. Cambiar la revisión de asistencia de `review { decision … }` a campos planos: `reviewStatus`, `verificationMethod`,
   `reviewerName`, `reviewerComment` y `reviewedAt`.
3. Mover todas las rutas bajo `/:empresa` (`/:empresa/login`, `/:empresa/panel`, `/:empresa/panel/tareas`…) y agregar
   en `/` una pantalla para escribir el código de empresa.
4. Asociar la sesión a la empresa: si la empresa de la URL no es la de la sesión guardada, se cierra la sesión.
5. Enviar el código en `auth.login` y en el encabezado `X-Company-Code` de cada petición.

**App móvil (Jorge)**

6. Pedir el código de empresa en el login cuando no hay uno guardado; guardarlo en `expo-secure-store`.
7. Mostrar la empresa guardada en el login con la opción «Cambiar empresa», que no se permite mientras haya envíos
   pendientes en la cola sin conexión.
8. Enviar el código en `auth.login` y en el encabezado `X-Company-Code` de cada petición, incluidas las que reenvía la
   cola sin conexión.
9. Cambiar `review { … }` por los campos planos de revisión en los tipos, el fragmento y los datos simulados de la app
   (D-20); la app no muestra la revisión de asistencias, así que no cambia ninguna pantalla.

**Documentación (Adrián)**

10. Actualizar la sección «Estado actual» de `PROJECT_CONTEXT.md` al cerrar el incremento. `docs/api-graphql.md` ya
    refleja las nuevas convenciones.

### Fuera

| Tema                                                                                                                                                                                   | Por qué queda fuera                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Cambios en `Trazent.Api/` y `db/` (catálogo, conexión por petición, validar el código)                                                                                                 | Los hace María en su propio incremento; depende de P-10                    |
| `db-deploy.yml` para aplicar migraciones a varias bases                                                                                                                                | Depende de P-10 (de dónde sale la lista de bases)                          |
| Subdominios por empresa                                                                                                                                                                | Se eligió la ruta (D-23)                                                   |
| Conteos del dashboard (D-14, D-27), asignación de sitios (D-15), contraseña temporal (D-17, D-25), validación del token por empresa (D-24) y carpetas de Cloudinary por empresa (D-26) | Son decisiones aprobadas, pero de otros incrementos                        |
| Conectar los clientes a la API real                                                                                                                                                    | La API todavía no tiene estas operaciones; todo se prueba en modo simulado |
| Recordar varias empresas en el mismo teléfono o navegador                                                                                                                              | Se guarda una sola; cambiar de empresa cierra la sesión                    |

## 5. Criterios de aceptación

Cada criterio se comprueba con un comando o con pasos manuales en modo simulado (`VITE_USE_MOCKS=true`,
`EXPO_PUBLIC_USE_MOCKS=true`). En los pasos manuales, `<web>` es `http://localhost:5173`.

### Panel web

| ID    | Criterio                                        | Cómo se verifica                                                                                                                                                                                              |
| ----- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | No queda código de las vistas piloto            | `rg -n "views/mobile\|components/mobile\|/movil\|MobileShell" web/src` no devuelve resultados                                                                                                                 |
| CA-02 | `/movil` ya no existe                           | Abrir `<web>/demo/movil` muestra la página de «no encontrado»                                                                                                                                                 |
| CA-03 | Un contratista no entra al panel                | Iniciar sesión en `<web>/demo/login` con la cuenta de contratista simulada muestra «Usa la app móvil de Trazent» y no abre el panel                                                                           |
| CA-04 | La asistencia ya no usa `review`                | `rg -n "ReviewDecision\|AttendanceReview\|\.review\b\|review \{" web/src mobile/src` no devuelve resultados                                                                                                   |
| CA-05 | La revisión se muestra igual que antes          | En `<web>/demo/panel/reportes`, las filas aceptadas dicen «Aceptada», las rechazadas «Rechazada» y las que requieren revisión sin revisar «Por revisar»                                                       |
| CA-06 | El conteo «Por revisar» del reporte sigue igual | Con los mismos filtros, la tarjeta «Por revisar» muestra el mismo número antes y después del cambio                                                                                                           |
| CA-07 | Todas las rutas del panel llevan la empresa     | Navegar por las seis secciones del menú (como administrador) desde `<web>/demo/panel`: la URL siempre empieza con `/demo/`                                                                                    |
| CA-08 | La raíz pide el código                          | `<web>/` muestra el campo «Código de empresa»; escribir `demo` lleva a `<web>/demo/login`                                                                                                                     |
| CA-09 | El código se valida antes de enviar             | Escribir `Mi Empresa!` en `<web>/` muestra un error de formato y no navega                                                                                                                                    |
| CA-10 | Una empresa desconocida no entra                | En `<web>/otra/login`, iniciar sesión con la cuenta de administrador simulada muestra «Empresa no encontrada»                                                                                                 |
| CA-11 | La sesión pertenece a una empresa               | Con sesión iniciada en `demo`, abrir `<web>/otra/panel` cierra la sesión y lleva a `<web>/otra/login`                                                                                                         |
| CA-12 | Cada petición lleva el código                   | Con `VITE_USE_MOCKS=false`, en DevTools → Network, la petición a `/graphql` del login lleva `X-Company-Code: demo` y `companyCode: "demo"` en las variables (la respuesta puede fallar: la API aún no existe) |
| CA-13 | La PWA instalada abre en la empresa             | En la versión compilada (`yarn build:web` y `preview`), recargar `<preview>/demo/panel/tareas` sin red abre la vista desde caché                                                                              |

### App móvil

| ID    | Criterio                                                           | Cómo se verifica                                                                                                                                      |
| ----- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-14 | Primer inicio pide la empresa                                      | Con la app recién instalada (o datos borrados), el login muestra «Código de empresa», correo y contraseña                                             |
| CA-15 | El código se recuerda                                              | Iniciar sesión con `demo`, cerrar sesión y volver al login: ya no pide el código y muestra «Empresa: demo»                                            |
| CA-16 | Se puede cambiar de empresa                                        | En el login, «Cambiar empresa» vuelve a mostrar el campo vacío. Con un registro pendiente en la cola sin conexión, avisa y no cambia                  |
| CA-17 | El código se valida y se rechaza el desconocido                    | `Mi Empresa!` muestra error de formato; `otra` muestra «Empresa no encontrada»                                                                        |
| CA-18 | Cada petición lleva el código, también las de la cola sin conexión | Con `EXPO_PUBLIC_USE_MOCKS=false`, el log de red de Expo (o un proxy) muestra `X-Company-Code` en el login y en un registro reenviado desde la outbox |
| CA-19 | El código se guarda cifrado                                        | `rg -n "companyCode\|trazent.company" mobile/src` solo muestra lecturas y escrituras con `expo-secure-store`                                          |

### Calidad y documentación

| ID    | Criterio                     | Cómo se verifica                                                                                                                |
| ----- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| CA-20 | Los checks pasan             | `yarn format:check`, `yarn lint`, `yarn typecheck` y `yarn build:web` terminan sin errores                                      |
| CA-21 | El CI pasa                   | El check `ci` está en verde en los dos PR                                                                                       |
| CA-22 | El contrato está actualizado | `docs/api-graphql.md` documenta `X-Company-Code`, `companyCode` en `LoginInput` y los campos planos de revisión de `Attendance` |
| CA-23 | No se tocó la API ni la base | `git diff --stat main` no muestra archivos de `Trazent.Api/` ni de `db/`                                                        |

## 6. Definición de terminado

- Se cumplen CA-01 a CA-23.
- Los dos PR están aprobados por al menos una persona distinta a quien los abrió y fusionados con squash.
- Francisco repitió los criterios manuales (CA-02, CA-03, CA-05 a CA-11, CA-13 a CA-18) y dejó su resultado en el PR.
- S-01 y S-02 quedaron confirmados o ajustados con María, y `PROJECT_CONTEXT.md` lo refleja.
