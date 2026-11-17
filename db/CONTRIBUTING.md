# 🛠️ Guía para Contribuir

Gracias por contribuir a este repositorio de base de datos. Aquí encontrarás las reglas y convenciones a seguir para mantener la consistencia y calidad del proyecto.

---

## 📌 Convenciones

- Todos los cambios a la base de datos deben registrarse como scripts `.sql` nuevos en `/migrations` o `/functions`.
- Nunca edites scripts ya aplicados.
- Usa `scripts/new-sql.sh` para generar nuevos archivos con timestamp, tipo (migration/function) y acción (create, update, insert, alter, drop).
- Todos los cambios deben probarse ejecutando `bash scripts/apply-pending.sh` sobre una base limpia o actualizada.

---

## ✅ Convención de commits

Usa prefijos según el tipo de cambio:

- `feat(migrations): ...` → nueva migración (ej. nueva tabla, columna)
- `fix(functions): ...` → corrección en función/procedimiento
- `chore(migrations): ...` → actualización de datos en migración
- `refactor(migrations): ...` → mejoras internas en estructura sin cambiar funcionalidad
- `docs(readme): ...` → cambios en la documentación

---

## ✅ Pull Requests

- Incluye **solo archivos nuevos** (nunca edites scripts existentes).
- Usa la plantilla automática de Pull Request (`.github/PULL_REQUEST_TEMPLATE.md`).
- Verifica que `bash scripts/apply-pending.sh` se ejecute sin errores en tu entorno local.
- La validación automática en GitHub Actions ejecutará `scripts/apply-pending.sh` sobre una base vacía de PostgreSQL 17 para asegurar que los scripts son consistentes.

---

## 📝 Notas adicionales

- La base de datos objetivo es **PostgreSQL 17**. Asegúrate de que todas las funciones, sintaxis y extensiones sean compatibles con esta versión.
- Evita dependencias de extensiones no incluidas por defecto en PostgreSQL.

