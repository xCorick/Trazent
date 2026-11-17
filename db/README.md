# Trazent · Base de datos (PostgreSQL 17)

Migraciones y funciones de la base de datos de Trazent. La API solo llama funciones (no escribe SQL suelto).

| Carpeta / archivo           | Qué contiene                                                                    |
| --------------------------- | ------------------------------------------------------------------------------- |
| `migrations/`               | Cambios de esquema y datos, incrementales (`AAAAMMDD_HHMMSS_<acción>_<nombre>.sql`) |
| `functions/`                | Una función por archivo (`AAAAMMDD_HHMMSS_<nombre>.sql`, con `CREATE OR REPLACE`)   |
| `scripts/apply-pending.sh`  | Aplica lo pendiente, según la tabla `schema_migrations`                         |
| `scripts/new-sql.sh`        | Crea una migración o función con el nombre correcto                             |
| `scripts/latest-functions.sh` | Busca la versión más reciente de una función                                  |

## Uso

```bash
cp .env.example .env          # y llena los datos de tu base (local o Neon)
bash scripts/apply-pending.sh # siempre desde la carpeta db/
```

`apply-pending.sh` aplica primero **todas** las migraciones y después **todas** las funciones, cada grupo en orden
de nombre (es decir, de fecha). Cada archivo se registra en `schema_migrations` y no vuelve a correr.

Para crear un archivo nuevo: `cd scripts && bash new-sql.sh` (o la tarea de VS Code).

## Reglas

- **Nunca edites un archivo ya aplicado.** Para cambiar una función, crea un archivo nuevo con `CREATE OR REPLACE`;
  si cambia la firma (parámetros o columnas de retorno), primero haz `DROP FUNCTION` en ese mismo archivo.
- Una migración que necesite una función (por ejemplo, un trigger) debe crearla dentro de la migración, porque las
  funciones de `functions/` corren después de todas las migraciones (ver `set_updated_at`).
- Los enums se guardan como `smallint` y se documentan con `COMMENT ON COLUMN` (los mismos valores que la API y las apps).
- Prueba siempre con `apply-pending.sh` antes de subir tu cambio.

## Validación automática

- **En cada Pull Request** (job `db` del CI de la raíz): se levanta un PostgreSQL 17 vacío y se aplica todo dos
  veces; la segunda vez no debe quedar nada pendiente.
- **Al fusionar a `main`** (`db-deploy.yml`): se aplican las pendientes en Neon con los secretos `NEON_PG*` del repositorio.
