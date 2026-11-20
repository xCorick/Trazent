# Trazent

Plataforma para gestionar asistencias, tareas y evidencias de contratistas externos. Este repositorio es un
**monorepo** con todos los proyectos del sistema:

| Carpeta        | Proyecto                                                                         | Responsable                    |
| -------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| `web/`         | Panel web para administrador y supervisor (React + Vite + Ant Design, PWA)       | Adrián González Serrano        |
| `mobile/`      | App del contratista (React Native + Expo SDK 58)                                 | Jorge Alejandro Grijalva Soqui |
| `Trazent.Api/` | API GraphQL (ASP.NET Core 10 + GraphQL.AspNet + Npgsql, funciones de PostgreSQL) | María G. Cobos Camacho         |
| `db/`          | Migraciones y funciones de PostgreSQL 17                                         | María G. Cobos Camacho         |

---

## 1. Qué instalar

Instala solo lo que necesites para el proyecto en el que vas a trabajar.

| Herramienta                                            | Versión         | Web | Móvil | API | DB  | Para qué                                                            |
| ------------------------------------------------------ | --------------- | :-: | :---: | :-: | :-: | ------------------------------------------------------------------- |
| [Git](https://git-scm.com)                             | reciente        |  ✓  |   ✓   |  ✓  |  ✓  | Control de versiones. En Windows incluye **Git Bash**               |
| [Node.js](https://nodejs.org)                          | **22.13 o más** |  ✓  |   ✓   |     |     | Ejecuta web y móvil (Expo 58 no funciona con versiones anteriores)  |
| Yarn 4 (con Corepack)                                  | 4.16.0          |  ✓  |   ✓   |     |     | Instala las dependencias de web y móvil                             |
| [.NET SDK](https://dot.net)                            | **10**          |     |       |  ✓  |     | Compila y ejecuta la API                                            |
| [PostgreSQL](https://www.postgresql.org/download/)     | **17**          |     |       |  ✓  |  ✓  | Base de datos local y el comando `psql` (lo usa `apply-pending.sh`) |
| [Android Studio](https://developer.android.com/studio) | reciente        |     |   ✓   |     |     | SDK de Android, emulador y JDK para compilar la app                 |
| Cuenta de [Expo](https://expo.dev)                     | —               |     |   ✓   |     |     | Builds en la nube con EAS (alternativa a compilar local)            |
| [VS Code](https://code.visualstudio.com)               | —               |  ✓  |   ✓   |  ✓  |  ✓  | Editor recomendado; al abrir la carpeta sugiere las extensiones     |

**Yarn 4** no se instala con npm. Se activa una sola vez con Corepack:

```bash
npm install -g corepack   # solo si el comando corepack no existe (Node 25+ ya no lo incluye)
corepack enable
yarn --version            # debe mostrar 4.16.0 dentro de la carpeta del proyecto
```

**PostgreSQL en Windows:** agrega `C:\Program Files\PostgreSQL\17\bin` a la variable de entorno `Path` y reinicia la
terminal; `psql --version` debe responder.

## 2. Clonar e instalar

```bash
git clone <url-del-repositorio> Trazent
cd Trazent
yarn install
```

`yarn install` se corre **siempre desde la raíz**: instala web y móvil con un solo `yarn.lock` y activa los hooks
de Git (Husky). La API y la base de datos no usan Yarn.

## 3. Ejecutar cada proyecto

Cada proyecto puede usar datos simulados, así que **web y móvil funcionan sin la API**.
Para usarlos con la API real, primero levanta la base de datos y la API (secciones 3.3 y 3.4).

### 3.1 Panel web (`web/`)

```bash
cp web/.env.example web/.env      # opcional: VITE_USE_MOCKS=false para usar la API real
yarn dev:web                      # http://localhost:5173
```

Cuentas de demostración (contraseña `demo1234`): `admin@trazent.mx`, `supervisor@trazent.mx` y
`contratista@trazent.mx`. Más detalles en [`web/README.md`](web/README.md).

### 3.2 App del contratista (`mobile/`)

La app usa cámara, GPS, SQLite y almacenamiento seguro, así que necesita un **development build**: **Expo Go no sirve**.
El development build se compila una vez y luego solo se usa `yarn dev:mobile`.

```bash
cp mobile/.env.example mobile/.env

# Opción A: compilar en tu computadora (Android Studio instalado y un emulador o teléfono con depuración USB)
cd mobile
npx expo run:android

# Opción B: compilar en la nube con EAS (no necesita Android Studio)
cd mobile
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android   # instala el APK que genera

# Después, para desarrollar (desde la raíz):
yarn dev:mobile
```

Cuenta de demostración: `contratista@trazent.mx` / `demo1234`. En un **teléfono físico**, `localhost` es el propio
teléfono: en `mobile/.env` usa la IP de tu computadora. Más detalles en [`mobile/README.md`](mobile/README.md).

### 3.3 Base de datos (`db/`)

```bash
createdb -U postgres trazent_dev       # una sola vez (base local vacía)
cd db
cp .env.example .env                    # datos de conexión: local o Neon
bash scripts/apply-pending.sh           # en Windows, desde Git Bash
```

`apply-pending.sh` aplica solo las migraciones y funciones que faltan, controladas por la tabla `schema_migrations`.
En VS Code también está la tarea **«db: apply-pending»**. Cómo crear migraciones y funciones nuevas:
[`db/README.md`](db/README.md).

### 3.4 API (`Trazent.Api/`)

La API lee la cadena de conexión `ConnectionStrings:ApplicationDBServer`. Para trabajar en local, crea
`Trazent.Api/Trazent.Api/appsettings.Development.json`. No se sube al repositorio.

```json
{
  "ConnectionStrings": {
    "ApplicationDBServer": "Host=localhost;Port=5432;Database=trazent_dev;Username=postgres;Password=<tu-contraseña>"
  }
}
```

```bash
cd Trazent.Api
dotnet restore Trazent.Api.slnx
dotnet run --project Trazent.Api/Trazent.Api.csproj    # http://localhost:57930
```

GraphiQL queda en `http://localhost:57930/ui/playground`. Para que un teléfono físico la alcance, agrega
`--urls http://0.0.0.0:57930` y usa la IP de tu computadora en `mobile/.env`.

En Render, la cadena de conexión va como variable de entorno `ConnectionStrings__ApplicationDBServer`
(Neon exige `SSL Mode=Require`). La imagen se construye con `Trazent.Api/dockerfile`.

El contrato que esperan la web y el móvil (operaciones, errores, subida de fotos a Cloudinary y notificaciones con
Expo Push Service) está en [`docs/api-graphql.md`](docs/api-graphql.md). Las credenciales de Cloudinary van como
`Cloudinary__CloudName`, `Cloudinary__ApiKey` y `Cloudinary__ApiSecret`.

## 4. Comandos de la raíz

| Comando             | Qué hace                                      |
| ------------------- | --------------------------------------------- |
| `yarn dev:web`      | Servidor de desarrollo del panel web          |
| `yarn dev:mobile`   | Servidor de desarrollo de Expo                |
| `yarn build:web`    | Build de producción del panel web (PWA)       |
| `yarn lint`         | ESLint de web y móvil                         |
| `yarn typecheck`    | Revisión de tipos de web y móvil              |
| `yarn format`       | Da formato con Prettier a todo el repositorio |
| `yarn format:check` | Solo verifica el formato (lo usa el CI)       |

Para un comando de un solo proyecto: `yarn workspace trazent-web <comando>` o `yarn workspace trazent-mobile <comando>`.

## 5. Flujo de trabajo y checks

- **Ramas:** solo `main`, siempre liberable, y ramas cortas `feature/<historia>` o `fix/<descripción>` que entran por
  Pull Request.
- **Commits:** Conventional Commits, por ejemplo `feat(web): asignar tareas desde el panel`.
- **Al hacer commit:** Husky ejecuta lint-staged (`lint-staged.config.js`). Corre ESLint, Prettier y tipos solo del
  proyecto que cambió, y si algo falla, el commit se cancela.
- **En cada Pull Request:** GitHub Actions (`.github/workflows/ci.yml`) corre solo los jobs de las carpetas que cambiaron.

| Job      | Revisa                                                                           |
| -------- | -------------------------------------------------------------------------------- |
| `format` | Prettier en todo el repositorio                                                  |
| `web`    | ESLint, tipos y build                                                            |
| `mobile` | ESLint y tipos (el APK lo genera EAS Build)                                      |
| `api`    | `dotnet build` de la solución                                                    |
| `db`     | Aplica todas las migraciones y funciones sobre un PostgreSQL 17 vacío, dos veces |
| `ci`     | Resumen: es el único check que exige la protección de `main`                     |

- **Al fusionar a `main`:** `.github/workflows/db-deploy.yml` aplica las migraciones pendientes en Neon, con los
  secretos `NEON_PGHOST`, `NEON_PGUSER`, `NEON_PGPASSWORD` y `NEON_PGDATABASE`.
- **Versiones:** al cerrar cada ciclo se crea una etiqueta `vX.Y.Z` sobre `main`.

## 6. Seguridad de dependencias

`.yarnrc.yml` usa `node_modules` tradicional (compatible con Expo) y no ejecuta los scripts de instalación de las
dependencias, salvo las permitidas en `dependenciesMeta`. Yarn 4 además espera unos días antes de aceptar versiones
recién publicadas. Sube siempre `yarn.lock`; el CI instala con `--immutable`.

## 7. Problemas comunes

| Síntoma                                           | Solución                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `yarn` instala la versión 1                       | Corre `corepack enable` y abre otra terminal                                 |
| El CI falla en `yarn install --immutable`         | Corre `yarn install` en local y sube el `yarn.lock` actualizado              |
| `psql: command not found`                         | Agrega la carpeta `bin` de PostgreSQL al `Path`                              |
| La app móvil se cierra al abrir cámara o GPS      | Estás en Expo Go: usa el development build (sección 3.2)                     |
| El teléfono no conecta con la API                 | Usa la IP de tu computadora y corre la API con `--urls http://0.0.0.0:57930` |
| El navegador bloquea las llamadas a la API (CORS) | Agrega `http://localhost:5173` a `Cors:AllowedOrigins` en `appsettings.json` |
| El hook de commit no corre                        | Después de `git init`, corre `yarn husky`                                    |
