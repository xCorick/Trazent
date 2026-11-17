## Qué cambia

<!-- Historia o tarea del tablero Kanban y un resumen breve. -->

## Cómo se probó

- [ ] Los checks del commit (lint-staged) pasaron
- [ ] Probado localmente

## Si toca la base de datos (`db/`)

- [ ] Solo archivos **nuevos** en `migrations/` o `functions/` (ninguno ya aplicado fue editado)
- [ ] `bash scripts/apply-pending.sh` corre sin errores sobre mi base local
- [ ] Si cambió la firma de una función, el archivo incluye su `DROP FUNCTION`
