
#!/bin/bash
set -e

# Obtener rutas del proyecto automáticamente
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")"

# Permitir argumentos de texto o número
type_arg="$1"
action_arg="$2"
name_arg="$3"

# Normalizar tipo
case "$type_arg" in
  1|migrations)
    TYPE="migrations";;
  2|functions)
    TYPE="functions";;
  *)
    TYPE="";;
esac

if [ -z "$TYPE" ]; then
  echo "What type of file do you want to create?"
  echo "1) migrations"
  echo "2) functions"
  read -p "Select an option [1/2]: " TYPE_INPUT

  case "$TYPE_INPUT" in
    1) TYPE="migrations";;
    2) TYPE="functions";;
    migrations|functions) TYPE="$TYPE_INPUT";;
    *) echo "❌ Invalid option."; exit 1;;
  esac
fi

if [ "$TYPE" = "migrations" ]; then

  # Normalizar acción
  case "$action_arg" in
    "N/A (solo para functions)"|"N/A"|"") ACTION_STR="";;
    1|create) ACTION_STR="create";;
    2|update) ACTION_STR="update";;
    3|insert) ACTION_STR="insert";;
    4|alter) ACTION_STR="alter";;
    5|drop) ACTION_STR="drop";;
    *) ACTION_STR="";;
  esac

  if [ -z "$ACTION_STR" ]; then
    echo "What action type is the migration?"
    echo "1) create"
    echo "2) update"
    echo "3) insert"
    echo "4) alter"
    echo "5) drop"

    read -p "Select an action [1-5]: " ACTION_INPUT

    case "$ACTION_INPUT" in
      1|create) ACTION_STR="create";;
      2|update) ACTION_STR="update";;
      3|insert) ACTION_STR="insert";;
      4|alter) ACTION_STR="alter";;
      5|drop) ACTION_STR="drop";;
      *) echo "❌ Invalid action."; exit 1;;
    esac
  fi

  FOLDER="$DB_DIR/migrations"

else
  FOLDER="$DB_DIR/functions"
fi

# Obtener nombre
if [ -n "$name_arg" ]; then
  NAME="$name_arg"
else
  read -p "Enter a descriptive name (lowercase, no accents): " NAME
fi

# Normalizar nombre
SAFE_NAME=$(echo "$NAME" | xargs | tr '[:space:]' '_' | tr '[:upper:]' '[:lower:]' | sed 's/_*$//')

# Generar timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Generar nombre del archivo
if [ "$TYPE" = "migrations" ]; then
  FILENAME="${FOLDER}/${TIMESTAMP}_${ACTION_STR}_${SAFE_NAME}.sql"
else
  FILENAME="${FOLDER}/${TIMESTAMP}_${SAFE_NAME}.sql"
fi

# Crear directorio si no existe
mkdir -p "$FOLDER"

# Crear archivo SQL
cat > "$FILENAME" <<EOF
-- $FILENAME
-- Author: $(git config user.name || echo "Unknown")
-- Date: $(date)
--
-- Write your SQL below
EOF

echo ""
echo "✅ File created: $FILENAME"
