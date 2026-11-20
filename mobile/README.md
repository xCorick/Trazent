# Trazent · App del contratista

App móvil de Trazent hecha con **Expo SDK 58 + React Native 0.88 + TypeScript + Expo Router**.
Por ahora funciona con **datos simulados**: mismas cuentas, sitios y tareas que el panel web.

## Cómo correrla

Las dependencias se instalan **desde la raíz del monorepo** (`D:\Trazent`):

```bash
yarn install
yarn workspace trazent-mobile typecheck
```

La app usa módulos nativos (cámara, GPS, SQLite, almacén seguro), así que necesita un
**development build**; Expo Go no basta.

```bash
cd mobile
npx expo run:android          # build local (requiere Android Studio)
# o en la nube:
npx eas-cli@latest build --profile development --platform android
npx expo start                # después, para desarrollar con recarga en vivo
```

Copia `.env.example` como `.env` para configurar la API.

## Cuenta de demostración

`contratista@trazent.mx` / `demo1234`, o el botón «Entrar con la cuenta de demostración».
Los administradores y supervisores no pueden entrar: usan el panel web.

**Para la demo:**

- En _Asistencia_ puedes simular una ubicación dentro o fuera de la geocerca, o usar el GPS real.
- En _Perfil_, «Simular sin conexión» guarda los registros en el teléfono. Al desactivarlo se envían solos.

## Estructura

```
src/
├─ app/                 SOLO rutas (Expo Router). Cada archivo es una pantalla
│  ├─ _layout.tsx       Proveedores y protección: sin sesión solo existe /login
│  ├─ login.tsx
│  └─ (app)/            Pantallas con sesión
│     ├─ _layout.tsx    Stack + cola sin conexión (OfflineProvider)
│     ├─ (tabs)/        Pestañas nativas: Inicio, Asistencia, Mis tareas, Perfil
│     └─ tarea/[taskId].tsx
├─ features/            Lógica por funcionalidad: hooks + componentes propios
│  ├─ auth/  attendance/  tasks/  evidences/
├─ offline/             SQLite, cola de envíos (outbox) y sincronización
├─ device/              Cámara, GPS y archivos. Las pantallas no llaman a Expo directamente
├─ services/            Cliente HTTP, servicios de la API y llaves de TanStack Query
├─ ui/                  Componentes genéricos (atoms / molecules)
├─ mocks/               API y datos simulados
├─ types/               Modelos y DTOs (mismos enums smallint que la web y la DB)
├─ theme/  utils/  config/
```

**Reglas de dependencias:**

- El flujo es `app` → `features` → `ui` / `services` / `device` / `offline`.
- Una feature no importa a otra.
- Nada que no sea pantalla va dentro de `src/app`.

## Sin conexión (patrón outbox)

Al registrar una asistencia o subir una evidencia sin señal (o si el envío falla por la red):

1. La foto se copia a la carpeta de documentos del teléfono, de donde el sistema no la borra.
2. La operación se guarda en la tabla `outbox` de SQLite, con su `clientId` (UUID).
3. Al volver la señal o al abrir la app, `offline/sync.ts` envía la cola en orden.
4. La API usa el `clientId` para no duplicar si un envío se repite.

Si la API rechaza un registro con un error 4xx, este queda marcado en _Perfil_ para que el usuario lo revise.

## Pasar a la API real

1. En `.env`, pon `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_USE_MOCKS=false`.
2. Las consultas GraphQL están en `src/services/index.ts` y siguen el contrato de
   [`docs/api-graphql.md`](../docs/api-graphql.md). Si la API cambia un nombre, solo se ajusta ahí.
3. Las fotos se suben directo a Cloudinary con una firma que da la API (`src/services/imageUpload.ts`); a la API
   solo llega su `public_id`. La cola sin conexión no cambia: el servicio hace los tres pasos al sincronizar.
4. Pendiente: renovar el token con el refresh token ante `UNAUTHENTICATED` (`src/services/graphql.ts`).

## Notificaciones push

La app registra su token de **Expo Push Service** al iniciar sesión (`src/features/notifications`). Para que funcione:

1. Vincula el proyecto a EAS una vez: `npx eas-cli@latest init` en `mobile/` (agrega el `projectId` a `app.json`).
2. Crea un proyecto en Firebase y sube a EAS las credenciales de FCM V1 (`npx eas-cli@latest credentials`).
3. Compila un development build nuevo: Expo Go no recibe notificaciones en Android.
