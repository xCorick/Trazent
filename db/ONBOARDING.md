# 👋 Bienvenido al repositorio de Base de Datos

Este repositorio contiene **todo lo necesario** para trabajar con la base de datos PostgreSQL del proyecto.

---

## 🚀 ¿Qué contiene este repo?

- Migraciones incrementales (`/migrations`)
- Procedimientos almacenados y funciones (`/functions`)
- Herramientas para gestionar cambios (`apply-pending.sh`, `new-sql.sh`)
- Documentación y procesos del equipo

---

## ✅ ¿Qué debo hacer para empezar?

1. Clona el monorepo de Trazent y entra a la carpeta de la base de datos:
   ```bash
   git clone <url-del-repositorio> Trazent
   cd Trazent/db
   cp .env.example .env   # y llena los datos de tu base
   ```

2. Dale permisos a los scripts (en Git Bash o Linux):
   ```bash
   chmod +x scripts/*.sh
   ```

3. Crea una base local de prueba si no tienes una ya:
   ```bash
   createdb nombre_base_prueba
   ```

4. Ejecuta todos los scripts para levantar la base:
   ```bash
   bash scripts/apply-pending.sh
   ```

---

## ✍️ ¿Cómo agrego un cambio a la base de datos?

1. Ejecuta:
   ```bash
   (cd scripts && bash new-sql.sh)
   ```
   - Selecciona si quieres una migración o un SP/función.
   - Escribe un nombre claro para generar el archivo.

2. Escribe tu SQL dentro del archivo generado.

3. Prueba que funcione:
   ```bash
   bash scripts/apply-pending.sh
   ```

4. Haz commit y push:
   ```bash
   git add migrations/tu_archivo.sql
   git commit -m "feat(migrations): descripción del cambio"
   git push origin feature/mi-cambio
   ```

5. Crea un Pull Request hacia `main`.

---

## 🧠 Reglas importantes

- ❌ No modifiques scripts ya existentes.
- ✅ Siempre crea un archivo nuevo.
- ✅ Prueba todo localmente antes de hacer push.
- ✅ Usa commits claros y con prefijo (`feat`, `fix`, `chore`).

---

## 🔖 ¿Qué prefijos debo usar en mis commits?

| Prefijo       | Uso                                                          |
|---------------|--------------------------------------------------------------|
| `feat`        | Nueva funcionalidad o estructura (ej. nueva tabla, columna)  |
| `fix`         | Corrección de error en una función o migración               |
| `chore`       | Cambios menores o de mantenimiento                           |
| `refactor`    | Refactorización sin cambiar comportamiento                   |
| `docs`        | Cambios en la documentación                                  |

### Ejemplos:

```bash
git commit -m "feat(migrations): add tracking_number column to orders"
git commit -m "fix(functions): correct discount calculation logic"
git commit -m "chore(seed): update initial roles data"
```

---

## 🖥️ Configurar `psql` en Windows (si no lo reconoce en terminal)

Si puedes usar SQL Shell pero al correr `bash scripts/apply-pending.sh` te aparece el error:

```
psql: command not found
```

Significa que `psql` no está en la variable de entorno `PATH`.

### ✅ ¿Cómo agregarlo al PATH?

1. Encuentra la ruta de instalación de PostgreSQL, por ejemplo:
   ```
   C:\Program Files\PostgreSQL\17\bin
   ```

2. Abre el Panel de control → Sistema → Configuración avanzada del sistema.

3. Haz clic en **Variables de entorno...**

4. En la sección de **Variables del sistema**, busca y selecciona la variable llamada `Path`, luego haz clic en **Editar**.

5. Clic en **Nuevo**, y agrega:
   ```
   C:\Program Files\PostgreSQL\17\bin
   ```

6. Acepta los cambios y **reinicia tu terminal** (Git Bash, CMD o PowerShell).

7. Verifica que funciona ejecutando:
   ```bash
   psql --version
   ```

## ⚙️ Validación automática en CI

Cada Pull Request ejecutará un workflow de GitHub Actions que:

Levanta una base PostgreSQL 17 vacía.

Corre bash scripts/apply-pending.sh para aplicar todas las migraciones y funciones.

Verifica que no haya errores de sintaxis ni de ejecución.

✅ Esto garantiza que los scripts puedan reconstruir una base limpia correctamente.

⚠️ El entorno real (dev/staging/prod) usará apply-pending.sh sobre una base existente, aplicando solo las migraciones nuevas registradas en schema_migrations.

## 📌 Notas adicionales

Este proyecto utiliza PostgreSQL 17 como base estándar en todos los entornos.

Evita funciones, sintaxis o extensiones no compatibles con esta versión.

Este repositorio ya no usa /schema ni /seed, toda la evolución de la base se controla únicamente mediante migraciones incrementales y funciones registradas.

---

¡Listo! Ya puedes colaborar con confianza en la evolución de la base de datos. 😎
