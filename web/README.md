# Trazent · Prototipo PWA + móvil

Prototipo navegable de Trazent hecho con **React 19 + TypeScript + Vite + Ant Design 5**.
Sirve para presentar el diseño y, a la vez, es la plantilla de la PWA real: la estructura,
los servicios y los tipos ya están listos para conectarse a la API.

- **Panel web (PWA):** administrador y supervisor. Inicio con indicadores, asignación de tareas, revisión de
  evidencias y reportes de asistencia (con exportación a CSV).
- **Administración (solo administrador):** alta, edición y desactivación de usuarios, y sitios de trabajo con su
  geocerca (centro y radio).
- **App del contratista (simulada):** registro de asistencia con foto y ubicación, mis tareas y carga de evidencias.
  Es una web responsiva normal: se ve como app móvil al abrirla en el teléfono o con la vista de dispositivo del
  inspector del navegador (F12 → Ctrl+Shift+M). En producción será React Native + Expo.

## Cómo correrlo

Este proyecto es el workspace `web` del monorepo de Trazent. Las dependencias se instalan **desde la raíz**
(`D:\Trazent`), no desde esta carpeta; el README de la raíz explica la configuración inicial.

```bash
# desde la raíz del monorepo
yarn install
yarn dev:web
```

Abre <http://localhost:5173>. Para probar la vista móvil desde un teléfono en la misma red:
`yarn workspace trazent-web dev --host` y entra a la IP que muestra la terminal.

Comandos de este workspace (desde la raíz, con `yarn workspace trazent-web <comando>`, o desde esta carpeta con `yarn <comando>`):

| Comando             | Qué hace                                                                      |
| ------------------- | ----------------------------------------------------------------------------- |
| `dev`               | Servidor de desarrollo                                                        |
| `build`             | Revisa los tipos y genera la PWA en `dist/` (con service worker y manifiesto) |
| `preview`           | Sirve la versión compilada para probar la instalación como PWA                |
| `typecheck`         | Solo revisa los tipos de TypeScript                                           |
| `lint` / `lint:fix` | Revisa el código con ESLint / corrige lo que se pueda automáticamente         |

El formato (Prettier), Husky, lint-staged y el CI se configuran en la raíz del monorepo.
ESLint (`eslint.config.js`) sí vive aquí, porque cada proyecto tiene sus propias reglas.

## Cuentas de demostración

En la pantalla de inicio de sesión hay accesos rápidos. Todas usan la contraseña `demo1234`.

| Rol           | Correo                   | Abre                                                   |
| ------------- | ------------------------ | ------------------------------------------------------ |
| Administrador | `admin@trazent.mx`       | Panel web con Usuarios y Sitios y geocercas (`/panel`) |
| Supervisor    | `supervisor@trazent.mx`  | Panel web: tareas, evidencias y reportes (`/panel`)    |
| Contratista   | `contratista@trazent.mx` | App del contratista (`/movil`)                         |

| Pantalla           | Ruta                | Administrador | Supervisor |
| ------------------ | ------------------- | :-----------: | :--------: |
| Inicio             | `/panel`            |       ✓       |     ✓      |
| Tareas             | `/panel/tareas`     |       ✓       |     ✓      |
| Evidencias         | `/panel/evidencias` |       ✓       |     ✓      |
| Reportes           | `/panel/reportes`   |       ✓       |     ✓      |
| Usuarios           | `/panel/usuarios`   |       ✓       |            |
| Sitios y geocercas | `/panel/sitios`     |       ✓       |            |

Los datos simulados viven en memoria: se reinician al recargar la página. Lo que hace el contratista
(una evidencia nueva, una asistencia) aparece en el panel del supervisor sin recargar.

**Para la demo:** entra como contratista, sube una evidencia en una tarea, cierra sesión, entra como
supervisor y apruébala o recházala desde _Evidencias_. En el registro de asistencia puedes simular una
ubicación dentro o fuera de la geocerca, y con el botón «En línea» de la cabecera, la pérdida de señal.

**Demo de administración:** entra como administrador, crea un contratista en _Usuarios_ (se muestra su
contraseña temporal), crea un sitio en _Sitios y geocercas_ y asígnale una tarea. Un usuario desactivado ya
no puede iniciar sesión, y un sitio inactivo deja de aparecer al asignar tareas.

## Estructura (diseño atómico)

```
src/
├─ atoms/          Piezas mínimas: Logo, etiquetas de estado, avatar, ícono
├─ molecules/      Combinaciones de átomos: tarjetas, encabezados, selector de foto
├─ components/     Organismos: layout del panel, formularios, tabla, modales
│  └─ mobile/      PROTOTIPO MÓVIL: cabecera de la app y barra inferior
├─ views/          Pantallas completas, una por ruta
│  ├─ auth/        Inicio de sesión
│  ├─ panel/       Panel web
│  └─ mobile/      PROTOTIPO MÓVIL
├─ routes/         Rutas, protección por rol y paths
├─ features/       Datos por dominio: api.ts (llamadas a la API) + hooks.ts (TanStack Query)
│  └─ tasks/ evidences/ attendance/ dashboard/ catalogs/ admin/ reports/ auth/
├─ services/       Compartido: cliente HTTP, errores, sesión, llaves de caché
├─ mocks/          Base de datos y API simulada del prototipo
├─ context/        Sesión del usuario
├─ types/          Modelos del dominio y DTOs de la API
├─ theme/          Colores y tema de Ant Design
├─ utils/          Formatos, geocerca, imágenes, ids
└─ styles/         CSS global y responsivo
```

Organización híbrida:

- **Interfaz con diseño atómico:** `views` → `components` → `molecules` → `atoms`. Las seis pantallas del panel
  comparten la mayoría de sus piezas visuales.
- **Datos por dominio en `src/features`:** cada dominio tiene `api.ts` (llamadas a la API) y `hooks.ts` (lecturas y
  mutaciones con TanStack Query), y se importa desde su carpeta: `import { useTasks } from '@/features/tasks'`.

Las vistas nunca llaman a la API directamente: usan los hooks de `features`, que usan su `api.ts`.

## Pasar a la API real

1. Copia `.env.example` como `.env`.
2. Pon la URL de la API en `VITE_API_URL` y cambia `VITE_USE_MOCKS=false`.
3. Las consultas GraphQL están en el `api.ts` de cada dominio (`src/features`) y siguen el contrato de
   [`docs/api-graphql.md`](../docs/api-graphql.md). Si la API cambia un nombre, solo se ajusta ese archivo.

Los enums de `src/types/domain.ts` usan los mismos valores smallint que la base de datos
(`Role`, `TaskStatus`, `ReviewStatus`, `GeofenceStatus`, etc.), así que la API puede devolverlos tal cual.

Pendientes conocidos para la versión real:

- Renovar el access token con el refresh token ante `UNAUTHENTICATED` (`src/services/graphql.ts`, marcado con TODO).
- Quitar las cuentas de demostración (`src/mocks/demoAccounts.ts`) y, al final, la carpeta `src/mocks`.

## Quitar la parte móvil

Todo lo móvil está marcado con el comentario `PROTOTIPO MÓVIL`:

1. Borra `src/views/mobile/` y `src/components/mobile/`.
2. En `src/routes/AppRouter.tsx`, elimina el bloque de rutas `/movil` y sus imports.
3. En `src/routes/paths.ts`, elimina las rutas `mobile*` y ajusta `homeFor`.
4. En `src/styles/global.css`, elimina la sección «prototipo móvil» (hasta antes de «administración»).

Los átomos y moléculas se quedan: el panel también usa `TaskCard`, `EvidenceCard` y `AttendanceItem`, y `PhotoPicker` servirá para la PWA real.
